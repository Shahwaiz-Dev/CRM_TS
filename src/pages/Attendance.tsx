import React, { useEffect, useState } from "react";
import { getAttendance, addAttendance, updateAttendance, deleteAttendance, getEmployees, getLeaveRequests, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest } from "@/lib/firebase";
import { Search, Filter, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DateRange } from 'react-day-picker';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { StatsCardsSkeleton } from '@/components/ui/StatsCardsSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/store/slices/languageSlice";
import { setAttendanceRecords, setLoading as setAttendanceLoading, setError as setAttendanceError } from "@/store/slices/attendanceSlice";
import { setEmployees, setLoading as setEmployeesLoading } from "@/store/slices/employeesSlice";

const today = new Date();

export default function Attendance() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const attendance = useAppSelector((state) => state.attendance.records);
  const dataLoading = useAppSelector((state) => state.attendance.loading);
  const employees = useAppSelector((state) => state.employees.employees);

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
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ employeeId: '', type: '', dateRange: '', reason: '', status: 'Pending' });
  const [leaveDateRange, setLeaveDateRange] = useState<DateRange | undefined>();
  const [saving, setSaving] = useState(false);
  const [leaveSaving, setLeaveSaving] = useState(false);

  const { t } = useTranslation();

  const fetchEmployees = async () => {
    dispatch(setEmployeesLoading(true));
    try {
      const data = await getEmployees();
      dispatch(setEmployees(data));
    } catch (e) {
      dispatch(setAttendanceError('Failed to fetch employees'));
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };

  const fetchAttendance = async () => {
    dispatch(setAttendanceLoading(true));
    try {
      const data = await getAttendance();
      dispatch(setAttendanceRecords(data));
    } catch (e) {
      dispatch(setAttendanceError("Failed to fetch attendance"));
    } finally {
      dispatch(setAttendanceLoading(false));
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
    fetchLeaveRequests();
  }, []);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await addAttendance(newAttendance);
      setNewAttendance({ employeeId: "", date: "", status: "Present" });
      setModalOpen(false);
      fetchAttendance();
    } catch (e) {
      setError("Failed to add attendance");
      alert('Failed to add attendance. Please try again.');
    }
    setSaving(false);
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setEditAttendance(a);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateAttendance(editId, editAttendance);
      setEditId(null);
      setModalOpen(false);
      fetchAttendance();
    } catch (e) {
      setError("Failed to update attendance");
      alert('Failed to update attendance. Please try again.');
    }
    setSaving(false);
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
      setLeaveRequests(await getLeaveRequests());
    } catch (e) {
      setError('Failed to fetch leave requests');
    }
  };

  const handleAddLeave = async () => {
    if (!newLeave.employeeId || !newLeave.type || !newLeave.dateRange) {
      setError('Please fill all leave request fields');
      alert('Please fill all leave request fields');
      return;
    }
    setLeaveSaving(true);
    try {
      await addLeaveRequest(newLeave);
      setNewLeave({ employeeId: '', type: '', dateRange: '', reason: '', status: 'Pending' });
      setLeaveDateRange(undefined);
      setLeaveModalOpen(false);
      fetchLeaveRequests();
    } catch (e) {
      console.error('Error adding leave request:', e);
      setError('Failed to add leave request');
      alert('Failed to add leave request. Please try again.');
    } finally {
      setLeaveSaving(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateLeaveRequest(id, { status: 'Approved' });
      fetchLeaveRequests();
    } catch (e) {
      setError('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await updateLeaveRequest(id, { status: 'Rejected' });
      fetchLeaveRequests();
    } catch (e) {
      setError('Failed to reject leave');
    }
  };

  const handleDeleteLeave = async (id) => {
    try {
      await deleteLeaveRequest(id);
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

  if (dataLoading) {
    return (
      <motion.div
        className="p-4 md:p-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>
        <StatsCardsSkeleton count={4} />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="bg-card rounded-xl border p-6 flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            <TableSkeleton rows={5} columns={5} />
          </div>
          <div className="bg-card rounded-xl border p-6 w-full lg:w-[340px] flex-shrink-0">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-4"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{t('attendance_management')}</h1>
          <p className="text-muted-foreground mt-1">{t('track_attendance_and_leaves')}</p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <button onClick={() => {
            setNewAttendance({ employeeId: "", date: "", status: "Present" });
            setModalMode('add');
            setModalOpen(true);
          }} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2">
            <Plus className="h-5 w-5" /> {t('add_attendance')}
          </button>
          <button onClick={() => {
            setNewLeave({ employeeId: '', type: '', dateRange: '', reason: '', status: 'Pending' });
            setLeaveDateRange(undefined);
            setLeaveModalOpen(true);
          }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2">
            <Plus className="h-5 w-5" /> {t('add_leave_request')}
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('present_today')}</span>
          <span className="text-3xl font-bold text-foreground">{presentToday}</span>
          <span className="text-muted-foreground text-xs mt-1">{attendance.length ? ((presentToday / attendance.length) * 100).toFixed(1) : '0.0'}% {t('of_workforce')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('late_arrivals')}</span>
          <span className="text-3xl font-bold text-foreground">{lateToday}</span>
          <span className="text-muted-foreground text-xs mt-1">{t('arrived_after_9am')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('absent_today')}</span>
          <span className="text-3xl font-bold text-foreground">{absentToday}</span>
          <span className="text-muted-foreground text-xs mt-1">{t('without_prior_notice')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('attendance_rate')}</span>
          <span className="text-3xl font-bold text-foreground">{attendanceRate}%</span>
          <span className="text-green-500 text-xs mt-1">&nbsp;</span>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Daily Attendance Card */}
        <div className="bg-card rounded-xl border p-6 flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{t('daily_attendance')}</h2>
              <p className="text-muted-foreground text-sm">{t('employee_checkin_checkout')}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('search_employees')}
                  className="pl-10 pr-3 py-2 border rounded-lg w-full bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <button onClick={handleFilter} className="border rounded-lg px-4 py-2 flex items-center gap-2 text-foreground hover:bg-muted transition-colors"><Filter className="h-4 w-4" /> {t('filter')}</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('employee_name')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('check_in')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('check_out')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('total_hours')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((emp, i) => {
                  const employee = employees.find(e => e.id === emp.employeeId);
                  return (
                    <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-3 min-w-[200px]">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border">{employee ? (employee.name?.split(' ').map(n => n[0]).join('').toUpperCase()) : '?'}</div>
                        <div>
                          <div className="font-semibold text-foreground">{employee ? employee.name : t('unknown')}</div>
                          <div className="text-xs text-muted-foreground">{employee ? employee.department : ''}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-foreground">{emp.checkIn || '-'}</td>
                      <td className="py-3 px-3 font-mono text-foreground">{emp.checkOut || '-'}</td>
                      <td className="py-3 px-3 font-semibold text-foreground">{emp.totalHours || '-'}</td>
                      <td className="py-3 px-3"><span className="bg-green-500/10 text-green-600 border border-green-200/20 rounded-full px-3 py-1 text-xs font-semibold">{t(emp.status.toLowerCase())}</span></td>
                      <td className="py-3 px-3 flex gap-2">
                        <button onClick={() => { handleEdit(emp); setModalMode('edit'); setModalOpen(true); }} className="text-muted-foreground hover:text-blue-600 transition-colors" title="Edit">✏️</button>
                        <button onClick={() => handleDelete(emp.id)} className="text-muted-foreground hover:text-red-600 transition-colors" title="Delete">🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Calendar Card */}
        <div className="bg-card rounded-xl border p-6 w-full lg:w-[340px] flex-shrink-0">
          <h2 className="text-xl font-bold mb-1 text-foreground">{t('calendar')}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t('select_date_to_view_attendance')}</p>
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-lg border"
              classNames={{
                day_today: "bg-muted text-foreground font-semibold"
              }}
            />
          </div>
        </div>
      </div>
      {/* Leave Requests Section */}
      <div className="mt-8">
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-1 text-foreground">{t('leave_requests')}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t('pending_and_recent_leave_requests')}</p>
          <div className="space-y-4">
            {leaveRequests.map(req => (
              <div key={req.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border rounded-lg p-4">
                <div>
                  <div className="font-semibold text-lg text-foreground">{employees.find(e => e.id === req.employeeId)?.name || t('unknown')}</div>
                  <div className="text-muted-foreground text-sm">{req.type}</div>
                </div>
                <div className="flex flex-col md:items-end md:flex-row md:gap-4 gap-1">
                  <div className="flex items-center gap-2 text-foreground text-sm">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4 text-muted-foreground" /> {req.dateRange}</span>
                    {req.status === 'Pending' && <span className="bg-muted text-muted-foreground border rounded-full px-3 py-1 text-xs font-semibold ml-2">{t('pending')}</span>}
                    {req.status === 'Approved' && <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold ml-2">{t('approved')}</span>}
                    {req.status === 'Rejected' && <span className="bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-3 py-1 text-xs font-semibold ml-2">{t('rejected')}</span>}
                  </div>
                  <div className="text-muted-foreground text-xs md:text-right">{req.reason}</div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="border rounded px-3 py-1 text-sm font-medium hover:bg-primary/10 hover:border-primary transition-colors text-foreground"
                      disabled={req.status !== 'Pending'}
                    >
                      {t('approve')}
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="border rounded px-3 py-1 text-sm font-medium hover:bg-destructive/10 hover:border-destructive transition-colors text-foreground"
                      disabled={req.status !== 'Pending'}
                    >
                      {t('reject')}
                    </button>
                    <button
                      onClick={() => handleDeleteLeave(req.id)}
                      className="border rounded px-3 py-1 text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
                    >
                      {t('delete')}
                    </button>
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
            <DialogTitle>{modalMode === 'add' ? t('add_attendance') : t('edit_attendance')}</DialogTitle>
            <DialogDescription>{modalMode === 'add' ? t('add_attendance_desc') : t('edit_attendance_desc')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <select value={modalMode === 'add' ? newAttendance.employeeId : editAttendance.employeeId} onChange={e => modalMode === 'add' ? setNewAttendance({ ...newAttendance, employeeId: e.target.value }) : setEditAttendance({ ...editAttendance, employeeId: e.target.value })} className="bg-background border p-1 rounded text-foreground">
              <option value="" className="bg-background text-foreground">{t('select_employee')}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id} className="bg-background text-foreground">{e.name}</option>
              ))}
            </select>
            <input type="date" value={modalMode === 'add' ? newAttendance.date : editAttendance.date} onChange={e => modalMode === 'add' ? setNewAttendance({ ...newAttendance, date: e.target.value }) : setEditAttendance({ ...editAttendance, date: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
            <select value={modalMode === 'add' ? newAttendance.status : editAttendance.status} onChange={e => modalMode === 'add' ? setNewAttendance({ ...newAttendance, status: e.target.value }) : setEditAttendance({ ...editAttendance, status: e.target.value })} className="bg-background border p-1 rounded text-foreground">
              <option value="Present" className="bg-background text-foreground">{t('present')}</option>
              <option value="Absent" className="bg-background text-foreground">{t('absent')}</option>
              <option value="Late" className="bg-background text-foreground">{t('late')}</option>
            </select>
            <div className="flex gap-2 mt-2">
              <Button
                onClick={modalMode === 'add' ? handleAdd : handleUpdate}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {modalMode === 'add' ? t('adding') : t('saving')}
                  </>
                ) : (
                  modalMode === 'add' ? t('add') : t('save')
                )}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>{t('cancel')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add Leave Request Modal */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('add_leave_request')}</DialogTitle>
            <DialogDescription>{t('add_leave_request_desc')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <select value={newLeave.employeeId} onChange={e => setNewLeave({ ...newLeave, employeeId: e.target.value })} className="bg-background border p-1 rounded text-foreground">
              <option value="" className="bg-background text-foreground">{t('select_employee')}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id} className="bg-background text-foreground">{e.name}</option>
              ))}
            </select>
            <input placeholder={t('type_example')} value={newLeave.type} onChange={e => setNewLeave({ ...newLeave, type: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">{t('select_leave_date_range')}</label>
                <p className="text-xs text-gray-500 mb-3">{t('click_to_select_leave_dates')}</p>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={leaveDateRange}
                  onSelect={(range) => {
                    setLeaveDateRange(range);
                    if (range?.from && range?.to) {
                      const from = range.from.toLocaleDateString();
                      const to = range.to.toLocaleDateString();
                      setNewLeave({ ...newLeave, dateRange: `${from} - ${to}` });
                    }
                  }}
                  numberOfMonths={1}
                  className="rounded-lg border"
                  showOutsideDays={false}
                  disabled={{ before: new Date() }}
                  classNames={{
                    day_today: "bg-muted text-foreground font-semibold"
                  }}
                />
              </div>
              {!leaveDateRange?.from && !leaveDateRange?.to && (
                <div className="text-center text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-md">
                  👆 {t('click_to_select_leave_dates')}
                </div>
              )}
              {leaveDateRange?.from && !leaveDateRange?.to && (
                <div className="text-center text-sm font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-md">
                  ✅ {t('start_date_selected')}: {leaveDateRange.from.toLocaleDateString()}
                  <br />
                  <span className="text-xs">{t('now_click_end_date')}</span>
                </div>
              )}
              {leaveDateRange?.from && leaveDateRange?.to && (
                <div className="text-center text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  ✅ {t('leave_period_selected')}: {leaveDateRange.from.toLocaleDateString()} – {leaveDateRange.to.toLocaleDateString()}
                  <br />
                  <span className="text-xs font-normal">({Math.ceil((leaveDateRange.to.getTime() - leaveDateRange.from.getTime()) / (1000 * 60 * 60 * 24))} {t('days')})</span>
                </div>
              )}
            </div>
            <input placeholder={t('reason')} value={newLeave.reason} onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
            <div className="flex gap-2 mt-2">
              <Button onClick={handleAddLeave} disabled={leaveSaving}>
                {leaveSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
              <Button variant="outline" onClick={() => setLeaveModalOpen(false)}>{t('cancel')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 