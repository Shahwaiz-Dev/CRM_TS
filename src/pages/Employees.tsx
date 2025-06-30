import React from 'react';
import { Search, Filter, Edit, Trash2, Calendar } from 'lucide-react';

const employees = [
  {
    initials: 'AJ',
    name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    phone: '+1 (555) 123-4567',
    position: 'Senior Developer',
    department: 'Engineering',
    salary: '$95,000',
    startDate: '2022-03-15',
    status: 'Active',
  },
  {
    initials: 'BW',
    name: 'Bob Wilson',
    email: 'bob.wilson@company.com',
    phone: '+1 (555) 987-6543',
    position: 'Product Manager',
    department: 'Product',
    salary: '$105,000',
    startDate: '2021-08-20',
    status: 'Active',
  },
];

export default function Employees() {
  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Employees</h1>
          <p className="text-gray-500 mt-1">Manage your team members and their information</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2 self-start md:self-auto"><span className="text-lg font-bold">+</span> Add Employee</button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Employees</span>
          <span className="text-3xl font-bold">147</span>
          <span className="text-green-600 text-xs mt-1">+3 this month</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Active Employees</span>
          <span className="text-3xl font-bold">142</span>
          <span className="text-gray-500 text-xs mt-1">96.6% of total</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Departments</span>
          <span className="text-3xl font-bold">8</span>
          <span className="text-gray-500 text-xs mt-1">Active departments</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Avg. Tenure</span>
          <span className="text-3xl font-bold">2.4</span>
          <span className="text-gray-500 text-xs mt-1">Years per employee</span>
        </div>
      </div>
      {/* Directory Card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Employee Directory</h2>
            <p className="text-gray-500 text-sm">View and manage all employee information</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <input type="text" placeholder="Search employees..." className="pl-10 pr-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100"><Filter className="h-4 w-4" /> Filter</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Employee</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Position</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Department</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Salary</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Start Date</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Status</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 flex items-center gap-3 min-w-[200px]">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">{emp.initials}</div>
                    <div>
                      <div className="font-semibold">{emp.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>&#9993; {emp.email}</span>
                        <span>&#128222; {emp.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold">{emp.position}</td>
                  <td className="py-3 px-3"><span className="bg-gray-100 rounded px-2 py-1 text-xs font-semibold">{emp.department}</span></td>
                  <td className="py-3 px-3 font-semibold">{emp.salary}</td>
                  <td className="py-3 px-3 flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-400" /> {emp.startDate}</td>
                  <td className="py-3 px-3"><span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">{emp.status}</span></td>
                  <td className="py-3 px-3 flex gap-2">
                    <button className="text-gray-500 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                    <button className="text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 