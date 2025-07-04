import React, { useEffect, useState } from "react";
import { getAttendance, addAttendance, updateAttendance, deleteAttendance } from "@/lib/firebase";
import { Search, Filter, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLoading } from "@/components/ui/PageLoader";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const today = new Date();

export default function Attendance() {
  const { user, loading } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState("");
  const [newAttendance, setNewAttendance] = useState({ employeeId: "", date: "", status: "Present" });
  const [editId, setEditId] = useState(null);
  const [editAttendance, setEditAttendance] = useState({ employeeId: "", date: "", status: "Present" });
  const [selectedDate, setSelectedDate] = useState(today);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [filter, setFilter] = useState({ employee: '', date: '', status: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [employees, setEmployees] = useState([]);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ employeeId: '', type: '', dateRange: '', reason: '', status: 'Pending' });

  const fetchEmployees = async () => {
    try {
      const snap = await getDocs(collection(db, 'employees'));
      setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setError('Failed to fetch employees');
    }
  };

  const fetchAttendance = async () => {
    try {
      setAttendance(await getAttendance());
    } catch (e) {
      setError("Failed to fetch attendance");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
    fetchLeaveRequests();
  }, []);

  const handleAdd = async () => {
    try {
      await addAttendance(newAttendance);
      setNewAttendance({ employeeId: "", date: "", status: "Present" });
      fetchAttendance();
    } catch (e) {
      setError("Failed to add attendance");
    }
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setEditAttendance(a);
  };

  const handleUpdate = async () => {
    try {
      await updateAttendance(editId, editAttendance);
      setEditId(null);
      fetchAttendance();
    } catch (e) {
      setError("Failed to update attendance");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAttendance(id);
      fetchAttendance();
    } catch (e) {
      setError("Failed to delete attendance");
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const snap = await getDocs(collection(db, 'leaveRequests'));
      setLeaveRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      setError('Failed to fetch leave requests');
    }
  };

  const handleAddLeave = async () => {
    if (!newLeave.employeeId || !newLeave.type || !newLeave.dateRange) {
      setError('Please fill all leave request fields');
      return;
    }
    try {
      await addDoc(collection(db, 'leaveRequests'), newLeave);
      setNewLeave({ employeeId: '', type: '', dateRange: '', reason: '', status: 'Pending' });
      setLeaveModalOpen(false);
      fetchLeaveRequests();
    } catch (e) {
      setError('Failed to add leave request');
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, 'leaveRequests', id), { status: 'Approved' });
      fetchLeaveRequests();
    } catch (e) {
      setError('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(db, 'leaveRequests', id), { status: 'Rejected' });
      fetchLeaveRequests();
    } catch (e) {
      setError('Failed to reject leave');
    }
  };

  const handleDeleteLeave = async (id) => {
    try {
      await deleteDoc(doc(db, 'leaveRequests', id));
      fetchLeaveRequests();
    } catch (e) {
      setError('Failed to delete leave request');
    }
  };

  const handleFilter = () => {
    setFilterOpen(true);
    window.alert('Filter options/modal would open here.');
  };

  // Filter attendance by search (from backend data)
  const filteredAttendance = attendance.filter(emp =>
    (emp.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.department || '').toLowerCase().includes(search.toLowerCase())
  );

  // Calculate stats from backend data
  const presentToday = attendance.filter(a => a.status === 'Present').length;
  const absentToday = attendance.filter(a => a.status === 'Absent').length;
  const lateToday = attendance.filter(a => a.status === 'Late').length;
  const attendanceRate = attendance.length ? ((presentToday / attendance.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Attendance Management</h1>
          <p className="text-gray-500 mt-1">Track employee attendance and manage leave requests</p>
        </div>
        <button onClick={() => { setLeaveModalOpen(true); setModalMode('add'); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2 self-start md:self-auto"><Plus className="h-5 w-5" /> Add Leave Request</button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Present Today</span>
          <span className="text-3xl font-bold">{presentToday}</span>
          <span className="text-gray-500 text-xs mt-1">{attendance.length ? ((presentToday / attendance.length) * 100).toFixed(1) : '0.0'}% of workforce</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Late Arrivals</span>
          <span className="text-3xl font-bold">{lateToday}</span>
          <span className="text-gray-500 text-xs mt-1">Arrived after 9:00 AM</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Absent Today</span>
          <span className="text-3xl font-bold">{absentToday}</span>
          <span className="text-gray-500 text-xs mt-1">Without prior notice</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Attendance Rate</span>
          <span className="text-3xl font-bold">{attendanceRate}%</span>
          <span className="text-green-600 text-xs mt-1">&nbsp;</span>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Daily Attendance Card */}
        <div className="bg-white rounded-xl border p-6 flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold">Daily Attendance</h2>
              <p className="text-gray-500 text-sm">Employee check-in and check-out records</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="pl-10 pr-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button onClick={handleFilter} className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100"><Filter className="h-4 w-4" /> Filter</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Employee</th>
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Check In</th>
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Check Out</th>
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Total Hours</th>
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((emp, i) => {
                  const employee = employees.find(e => e.id === emp.employeeId);
                  return (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 flex items-center gap-3 min-w-[200px]">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">{employee ? (employee.name?.split(' ').map(n => n[0]).join('').toUpperCase()) : '?'}</div>
                        <div>
                          <div className="font-semibold">{employee ? employee.name : 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{employee ? employee.department : ''}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">{emp.checkIn || '-'}</td>
                      <td className="py-3 px-3 font-mono">{emp.checkOut || '-'}</td>
                      <td className="py-3 px-3 font-semibold">{emp.totalHours || '-'}</td>
                      <td className="py-3 px-3"><span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">{emp.status}</span></td>
                      <td className="py-3 px-3 flex gap-2">
                        <button onClick={() => { handleEdit(emp); setModalMode('edit'); setModalOpen(true); }} className="text-gray-500 hover:text-blue-600" title="Edit">✏️</button>
                        <button onClick={() => handleDelete(emp.id)} className="text-gray-500 hover:text-red-600" title="Delete">🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Calendar Card */}
        <div className="bg-white rounded-xl border p-6 w-full lg:w-[340px] flex-shrink-0">
          <h2 className="text-xl font-bold mb-1">Calendar</h2>
          <p className="text-gray-500 text-sm mb-4">Select date to view attendance</p>
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-lg border"
            />
          </div>
        </div>
      </div>
      {/* Leave Requests Section */}
      <div className="mt-8">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-1">Leave Requests</h2>
          <p className="text-gray-500 text-sm mb-4">Pending and recent leave requests</p>
          <div className="space-y-4">
            {leaveRequests.map(req => (
              <div key={req.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border rounded-lg p-4">
                <div>
                  <div className="font-semibold text-lg">{employees.find(e => e.id === req.employeeId)?.name || 'Unknown'}</div>
                  <div className="text-gray-500 text-sm">{req.type}</div>
                </div>
                <div className="flex flex-col md:items-end md:flex-row md:gap-4 gap-1">
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" /> {req.dateRange}</span>
                    {req.status === 'Pending' && <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold ml-2">Pending</span>}
                    {req.status === 'Approved' && <span className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold ml-2">Approved</span>}
                    {req.status === 'Rejected' && <span className="bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-semibold ml-2">Rejected</span>}
                  </div>
                  <div className="text-gray-400 text-xs md:text-right">{req.reason}</div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button onClick={() => handleApprove(req.id)} className="border rounded px-3 py-1 text-sm font-medium hover:bg-blue-50 hover:border-blue-600">Approve</button>
                    <button onClick={() => handleReject(req.id)} className="border rounded px-3 py-1 text-sm font-medium hover:bg-red-50 hover:border-red-600">Reject</button>
                    <button onClick={() => handleDeleteLeave(req.id)} className="border rounded px-3 py-1 text-sm font-medium hover:bg-gray-50 hover:border-gray-600 text-gray-500">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Add/Edit Attendance Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalMode === 'add' ? 'Add Attendance' : 'Edit Attendance'}</DialogTitle>
            <DialogDescription>{modalMode === 'add' ? 'Fill out the form to add a new attendance record.' : 'Edit the attendance record.'}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <select value={modalMode === 'add' ? newAttendance.employeeId : editAttendance.employeeId} onChange={e => modalMode === 'add' ? setNewAttendance({ ...newAttendance, employeeId: e.target.value }) : setEditAttendance({ ...editAttendance, employeeId: e.target.value })} className="border p-1 rounded">
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <input type="date" value={modalMode === 'add' ? newAttendance.date : editAttendance.date} onChange={e => modalMode === 'add' ? setNewAttendance({ ...newAttendance, date: e.target.value }) : setEditAttendance({ ...editAttendance, date: e.target.value })} className="border p-1 rounded" />
            <select value={modalMode === 'add' ? newAttendance.status : editAttendance.status} onChange={e => modalMode === 'add' ? setNewAttendance({ ...newAttendance, status: e.target.value }) : setEditAttendance({ ...editAttendance, status: e.target.value })} className="border p-1 rounded">
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
            <div className="flex gap-2 mt-2">
              <Button onClick={modalMode === 'add' ? handleAdd : handleUpdate}>{modalMode === 'add' ? 'Add' : 'Save'}</Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add Leave Request Modal */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Leave Request</DialogTitle>
            <DialogDescription>Fill out the form to request leave.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <select value={newLeave.employeeId} onChange={e => setNewLeave({ ...newLeave, employeeId: e.target.value })} className="border p-1 rounded">
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <input placeholder="Type (e.g. Sick, Vacation)" value={newLeave.type} onChange={e => setNewLeave({ ...newLeave, type: e.target.value })} className="border p-1 rounded" />
            <input placeholder="Date Range" value={newLeave.dateRange} onChange={e => setNewLeave({ ...newLeave, dateRange: e.target.value })} className="border p-1 rounded" />
            <input placeholder="Reason" value={newLeave.reason} onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })} className="border p-1 rounded" />
            <div className="flex gap-2 mt-2">
              <Button onClick={handleAddLeave}>Submit</Button>
              <Button variant="outline" onClick={() => setLeaveModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 