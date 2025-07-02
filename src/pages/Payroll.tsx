import React, { useEffect, useState } from "react";
import { getPayroll, addPayroll, updatePayroll, deletePayroll } from "@/lib/firebase";
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
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPayroll, setNewPayroll] = useState({ employeeId: "", month: "", amount: 0, status: "Pending" });
  const [editId, setEditId] = useState(null);
  const [editPayroll, setEditPayroll] = useState({ employeeId: "", month: "", amount: 0, status: "Pending" });

  const fetchPayroll = async () => {
    setLoading(true);
    setError("");
    try {
      setPayroll(await getPayroll());
    } catch (e) {
      setError("Failed to fetch payroll");
    }
    setLoading(false);
  };

  useEffect(() => { fetchPayroll(); }, []);

  const handleAdd = async () => {
    setLoading(true);
    setError("");
    try {
      await addPayroll(newPayroll);
      setNewPayroll({ employeeId: "", month: "", amount: 0, status: "Pending" });
      fetchPayroll();
    } catch (e) {
      setError("Failed to add payroll");
    }
    setLoading(false);
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setEditPayroll(p);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      await updatePayroll(editId, editPayroll);
      setEditId(null);
      fetchPayroll();
    } catch (e) {
      setError("Failed to update payroll");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError("");
    try {
      await deletePayroll(id);
      fetchPayroll();
    } catch (e) {
      setError("Failed to delete payroll");
    }
    setLoading(false);
  };

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
              {payroll.map((emp, i) => (
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
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Payroll</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading && <div className="mb-2">Loading...</div>}
        <table className="w-full border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Employee ID</th>
              <th className="p-2 border">Month</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payroll.map(p => (
              <tr key={p.id}>
                {editId === p.id ? (
                  <>
                    <td className="border p-1"><input value={editPayroll.employeeId} onChange={e => setEditPayroll({ ...editPayroll, employeeId: e.target.value })} /></td>
                    <td className="border p-1"><input value={editPayroll.month} onChange={e => setEditPayroll({ ...editPayroll, month: e.target.value })} /></td>
                    <td className="border p-1"><input type="number" value={editPayroll.amount} onChange={e => setEditPayroll({ ...editPayroll, amount: Number(e.target.value) })} /></td>
                    <td className="border p-1">
                      <select value={editPayroll.status} onChange={e => setEditPayroll({ ...editPayroll, status: e.target.value })}>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="border p-1">
                      <button onClick={handleUpdate} className="text-blue-600 mr-2">Save</button>
                      <button onClick={() => setEditId(null)} className="text-gray-600">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-1">{p.employeeId}</td>
                    <td className="border p-1">{p.month}</td>
                    <td className="border p-1">{p.amount}</td>
                    <td className="border p-1">{p.status}</td>
                    <td className="border p-1">
                      <button onClick={() => handleEdit(p)} className="text-blue-600 mr-2">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mb-2 font-semibold">Add Payroll</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <input placeholder="Employee ID" value={newPayroll.employeeId} onChange={e => setNewPayroll({ ...newPayroll, employeeId: e.target.value })} className="border p-1 rounded" />
          <input placeholder="Month" value={newPayroll.month} onChange={e => setNewPayroll({ ...newPayroll, month: e.target.value })} className="border p-1 rounded" />
          <input type="number" placeholder="Amount" value={newPayroll.amount} onChange={e => setNewPayroll({ ...newPayroll, amount: Number(e.target.value) })} className="border p-1 rounded" />
          <select value={newPayroll.status} onChange={e => setNewPayroll({ ...newPayroll, status: e.target.value })} className="border p-1 rounded">
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
          <button onClick={handleAdd} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
        </div>
      </div>
    </div>
  );
} 