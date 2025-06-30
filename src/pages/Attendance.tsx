import React, { useState } from 'react';
import { Search, Filter, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

const attendanceData = [
  {
    initials: 'AJ',
    name: 'Alice Johnson',
    department: 'Engineering',
    checkIn: '09:00 AM',
    checkOut: '06:15 PM',
    totalHours: '9h 15m',
    status: 'Present',
  },
  {
    initials: 'BW',
    name: 'Bob Wilson',
    department: 'Product',
    checkIn: '08:45 AM',
    checkOut: '05:30 PM',
    totalHours: '8h 45m',
    status: 'Present',
  },
];

const initialLeaveRequests = [
  {
    id: 1,
    name: 'Sarah Johnson',
    type: 'Vacation - 5 days',
    dateRange: '2024-02-05 to 2024-02-09',
    reason: 'Family vacation',
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Mike Thompson',
    type: 'Sick Leave - 2 days',
    dateRange: '2024-01-25 to 2024-01-26',
    reason: 'Medical appointment',
    status: 'Approved',
  },
];

const today = new Date();

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(today);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const handleApprove = (id) => {
    setLeaveRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };
  const handleReject = (id) => {
    setLeaveRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };
  const handleAddLeave = () => {
    window.alert('Leave request form/modal would open here.');
  };
  const handleFilter = () => {
    setFilterOpen(true);
    window.alert('Filter options/modal would open here.');
  };

  // Filter attendance by search
  const filteredAttendance = attendanceData.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Attendance Management</h1>
          <p className="text-gray-500 mt-1">Track employee attendance and manage leave requests</p>
        </div>
        <button onClick={handleAddLeave} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2 self-start md:self-auto"><Plus className="h-5 w-5" /> Add Leave Request</button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Present Today</span>
          <span className="text-3xl font-bold">2</span>
          <span className="text-gray-500 text-xs mt-1">50.0% of workforce</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Late Arrivals</span>
          <span className="text-3xl font-bold">1</span>
          <span className="text-gray-500 text-xs mt-1">Arrived after 9:00 AM</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Absent Today</span>
          <span className="text-3xl font-bold">1</span>
          <span className="text-gray-500 text-xs mt-1">Without prior notice</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Attendance Rate</span>
          <span className="text-3xl font-bold">75.0%</span>
          <span className="text-green-600 text-xs mt-1">+2.1% from yesterday</span>
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
                {filteredAttendance.map((emp, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 flex items-center gap-3 min-w-[200px]">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">{emp.initials}</div>
                      <div>
                        <div className="font-semibold">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.department}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">{emp.checkIn}</td>
                    <td className="py-3 px-3 font-mono">{emp.checkOut}</td>
                    <td className="py-3 px-3 font-semibold">{emp.totalHours}</td>
                    <td className="py-3 px-3"><span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">{emp.status}</span></td>
                  </tr>
                ))}
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
                  <div className="font-semibold text-lg">{req.name}</div>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 