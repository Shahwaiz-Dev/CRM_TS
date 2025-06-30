import React from 'react';
import { Search, Filter, Download, Edit, Check, DollarSign } from 'lucide-react';

const payrollData = [
  {
    initials: 'AJ',
    name: 'Alice Johnson',
    empId: 'EMP001',
    position: 'Senior Developer',
    department: 'Engineering',
    baseSalary: '$95,000',
    overtime: '$2,400',
    bonuses: '$5,000',
    deductions: '-$1,200',
    netPay: '$101,200',
    status: 'Paid',
  },
  {
    initials: 'BW',
    name: 'Bob Wilson',
    empId: 'EMP002',
    position: 'Product Manager',
    department: 'Product',
    baseSalary: '$105,000',
    overtime: '$0',
    bonuses: '$1,500',
    deductions: '-$1,500',
    netPay: '$111,500',
    status: 'Paid',
  },
];

function toCSV(rows) {
  const header = ['Name','Employee ID','Position','Department','Base Salary','Overtime','Bonuses','Deductions','Net Pay','Status'];
  const csvRows = [header.join(',')];
  for (const row of rows) {
    csvRows.push([
      row.name,
      row.empId,
      row.position,
      row.department,
      row.baseSalary,
      row.overtime,
      row.bonuses,
      row.deductions,
      row.netPay,
      row.status
    ].map(v => `"${v}"`).join(','));
  }
  return csvRows.join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function Payroll() {
  const handleExport = () => {
    const csv = toCSV(payrollData);
    downloadCSV(csv, 'payroll_report.csv');
  };
  const handleProcess = () => {
    window.alert('Payroll processed successfully!');
  };
  const handleRowDownload = (row) => {
    const csv = toCSV([row]);
    downloadCSV(csv, `${row.name.replace(/\s+/g, '_').toLowerCase()}_payroll.csv`);
  };
  const handleRowCheck = (row) => {
    window.alert(`Payroll for ${row.name} is already marked as paid.`);
  };
  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Payroll Management</h1>
          <p className="text-gray-500 mt-1">Manage employee compensation and payroll processing</p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <button onClick={handleExport} className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100"><Download className="h-4 w-4" /> Export Report</button>
          <button onClick={handleProcess} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2"><span className="text-lg font-bold">+</span> Process Payroll</button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Payroll</span>
          <span className="text-3xl font-bold">$376,800</span>
          <span className="text-green-600 text-xs mt-1">+5.2% from last month</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Average Salary</span>
          <span className="text-3xl font-bold">$94,200</span>
          <span className="text-gray-500 text-xs mt-1">Per employee</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Overtime</span>
          <span className="text-3xl font-bold">$4,400</span>
          <span className="text-gray-500 text-xs mt-1">This pay period</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Bonuses</span>
          <span className="text-3xl font-bold">$27,000</span>
          <span className="text-gray-500 text-xs mt-1">Performance bonuses</span>
        </div>
      </div>
      {/* Payroll Records Card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Payroll Records</h2>
            <p className="text-gray-500 text-sm">View and manage employee payroll information</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <input type="text" placeholder="Search payroll..." className="pl-10 pr-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
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
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Base Salary</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Overtime</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Bonuses</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Deductions</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Net Pay</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Status</th>
                <th className="py-2 px-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((emp, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3 flex items-center gap-3 min-w-[200px]">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">{emp.initials}</div>
                    <div>
                      <div className="font-semibold">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.empId}</div>
                      <div className="text-xs text-gray-500">{emp.department}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold">{emp.position}</td>
                  <td className="py-3 px-3 font-semibold">{emp.baseSalary}</td>
                  <td className="py-3 px-3 font-semibold">{emp.overtime}</td>
                  <td className="py-3 px-3 font-semibold">{emp.bonuses}</td>
                  <td className="py-3 px-3 font-semibold text-red-600">{emp.deductions}</td>
                  <td className="py-3 px-3 font-semibold text-green-600">{emp.netPay}</td>
                  <td className="py-3 px-3"><span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">{emp.status}</span></td>
                  <td className="py-3 px-3 flex gap-2">
                    <button onClick={() => handleRowDownload(emp)} className="text-gray-500 hover:text-blue-600"><Download className="h-4 w-4" /></button>
                    <button onClick={() => handleRowCheck(emp)} className="text-gray-500 hover:text-blue-600"><Check className="h-4 w-4" /></button>
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