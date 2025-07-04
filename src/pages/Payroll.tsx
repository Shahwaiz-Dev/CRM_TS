import React, { useEffect, useState } from "react";
import { getPayroll, addPayroll, updatePayroll, deletePayroll } from "@/lib/firebase";
import { Search, Filter, Download, Edit, Check, DollarSign, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLoading } from "@/components/ui/PageLoader";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function toCSV(rows) {
  const header = ['Name','Employee ID','Position','Department','Base Salary','Overtime','Bonuses','Deductions','Net Pay','Status'];
  const csvRows = [header.join(',')];
  for (const row of rows) {
    csvRows.push([
      row.name || '',
      row.empId || '',
      row.position || '',
      row.department || '',
      row.baseSalary || '',
      row.overtime || '',
      row.bonuses || '',
      row.deductions || '',
      row.netPay || row.amount || '',
      row.status || ''
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
  const { user, loading } = useAuth();
  // Remove useAuth and Navigate imports and any role-checking logic at the top of the component.

  const [payroll, setPayroll] = useState([]);
  const [error, setError] = useState("");
  const [newPayroll, setNewPayroll] = useState({ 
    employeeId: "", 
    month: "", 
    amount: 0, 
    overtime: 0,
    bonuses: 0,
    deductions: 0,
    status: "Pending" 
  });
  const [editId, setEditId] = useState(null);
  const [editPayroll, setEditPayroll] = useState({ 
    employeeId: "", 
    month: "", 
    amount: 0, 
    overtime: 0,
    bonuses: 0,
    deductions: 0,
    status: "Pending" 
  });
  const [filterModal, setFilterModal] = useState(false);
  const [filter, setFilter] = useState({ employee: '', month: '', status: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');

  const fetchPayroll = async () => {
    setError("");
    try {
      const payrollData = await getPayroll();
      console.log("Payroll data:", payrollData); // Debug log
      setPayroll(payrollData);
    } catch (e) {
      console.error("Error fetching payroll:", e);
      setError("Failed to fetch payroll");
    } finally {
      // setLoading(false); // Removed
    }
  };

  const fetchEmployees = async () => {
    try {
      const snap = await getDocs(collection(db, 'employees'));
      const employeesData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Employees data:", employeesData); // Debug log
      setEmployees(employeesData);
    } catch (e) {
      console.error("Error fetching employees:", e);
      setError("Failed to fetch employees");
    } finally {
      // setLoading(false); // Removed
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPayroll();
  }, []);

  const handleAdd = async () => {
    if (!newPayroll.employeeId || !newPayroll.month) {
      setError("Please select an employee and enter a month");
      return;
    }

    setError("");
    try {
      // setLoading(true); // Removed
      // Calculate net pay
      const netPay = newPayroll.amount + newPayroll.overtime + newPayroll.bonuses - newPayroll.deductions;
      const payrollData = {
        ...newPayroll,
        netPay: netPay,
        createdAt: new Date().toISOString()
      };
      
      await addPayroll(payrollData);
      setNewPayroll({ 
        employeeId: "", 
        month: "", 
        amount: 0, 
        overtime: 0,
        bonuses: 0,
        deductions: 0,
        status: "Pending" 
      });
      setModalOpen(false);
      fetchPayroll();
    } catch (e) {
      console.error("Error adding payroll:", e);
      setError("Failed to add payroll");
    } finally {
      // setLoading(false); // Removed
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setEditPayroll({
      employeeId: p.employeeId || "",
      month: p.month || "",
      amount: p.amount || 0,
      overtime: p.overtime || 0,
      bonuses: p.bonuses || 0,
      deductions: p.deductions || 0,
      status: p.status || "Pending"
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editPayroll.employeeId || !editPayroll.month) {
      setError("Please select an employee and enter a month");
      return;
    }

    setError("");
    try {
      // setLoading(true); // Removed
      // Calculate net pay
      const netPay = editPayroll.amount + editPayroll.overtime + editPayroll.bonuses - editPayroll.deductions;
      const payrollData = {
        ...editPayroll,
        netPay: netPay,
        updatedAt: new Date().toISOString()
      };
      
      await updatePayroll(editId, payrollData);
      setEditId(null);
      setModalOpen(false);
      fetchPayroll();
    } catch (e) {
      console.error("Error updating payroll:", e);
      setError("Failed to update payroll");
    } finally {
      // setLoading(false); // Removed
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll record?")) {
      return;
    }

    setError("");
    try {
      // setLoading(true); // Removed
      await deletePayroll(id);
      fetchPayroll();
    } catch (e) {
      console.error("Error deleting payroll:", e);
      setError("Failed to delete payroll");
    } finally {
      // setLoading(false); // Removed
    }
  };

  const handleExport = () => {
    if (filteredPayroll.length === 0) {
      alert("No payroll data to export");
      return;
    }
    
    const enrichedPayroll = filteredPayroll.map(pay => {
      const employee = employees.find(e => e.id === pay.employeeId);
      return {
        ...pay,
        name: employee?.name || 'Unknown',
        empId: employee?.employeeId || employee?.id || 'N/A',
        position: employee?.position || 'N/A',
        department: employee?.department || 'N/A',
        baseSalary: employee?.salary || pay.amount || 0
      };
    });

    const csv = toCSV(enrichedPayroll);
    downloadCSV(csv, 'payroll_report.csv');
  };

  const handleProcess = () => {
    const pendingPayrolls = payroll.filter(p => p.status === 'Pending');
    if (pendingPayrolls.length === 0) {
      alert('No pending payrolls to process!');
      return;
    }
    
    if (window.confirm(`Process ${pendingPayrolls.length} pending payroll(s)?`)) {
      // Here you would typically process the payrolls
      // For now, we'll just mark them as processed
      Promise.all(
        pendingPayrolls.map(p => 
          updatePayroll(p.id, { ...p, status: 'Paid', processedAt: new Date().toISOString() })
        )
      ).then(() => {
        alert('Payroll processed successfully!');
        fetchPayroll();
      }).catch(e => {
        console.error("Error processing payroll:", e);
        alert('Error processing payroll');
      });
    }
  };

  const handleRowDownload = (pay) => {
    const employee = employees.find(e => e.id === pay.employeeId);
    const enrichedPayroll = [{
      ...pay,
      name: employee?.name || 'Unknown',
      empId: employee?.employeeId || employee?.id || 'N/A',
      position: employee?.position || 'N/A',
      department: employee?.department || 'N/A',
      baseSalary: employee?.salary || pay.amount || 0
    }];

    const csv = toCSV(enrichedPayroll);
    const fileName = `${employee?.name?.replace(/\s+/g, '_').toLowerCase() || 'employee'}_payroll.csv`;
    downloadCSV(csv, fileName);
  };

  const handleMarkAsPaid = async (pay) => {
    if (pay.status === 'Paid') {
      alert(`Payroll for this employee is already marked as paid.`);
      return;
    }
    
    setError("");
    try {
      // setLoading(true); // Removed
      await updatePayroll(pay.id, { ...pay, status: 'Paid', paidAt: new Date().toISOString() });
      fetchPayroll();
    } catch (e) {
      console.error("Error marking as paid:", e);
      setError("Failed to mark as paid");
    } finally {
      // setLoading(false); // Removed
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setNewPayroll({ 
      employeeId: "", 
      month: "", 
      amount: 0, 
      overtime: 0,
      bonuses: 0,
      deductions: 0,
      status: "Pending" 
    });
    setModalOpen(true);
  };

  const applyFilters = () => {
    setFilterModal(false);
  };

  const clearFilters = () => {
    setFilter({ employee: '', month: '', status: '' });
  };

  // Calculate stats from backend data
  const totalPayroll = payroll.reduce((sum, p) => sum + (Number(p.netPay) || Number(p.amount) || 0), 0);
  const averageSalary = payroll.length ? (totalPayroll / payroll.length) : 0;
  const totalOvertime = payroll.reduce((sum, p) => sum + (Number(p.overtime) || 0), 0);
  const totalBonuses = payroll.reduce((sum, p) => sum + (Number(p.bonuses) || 0), 0);

  // Filtered payroll
  const filteredPayroll = payroll.filter(p => {
    const employee = employees.find(e => e.id === p.employeeId);
    const employeeName = employee?.name || '';
    const employeeId = employee?.employeeId || employee?.id || '';
    
    return (
      (!filter.employee || employeeName.toLowerCase().includes(filter.employee.toLowerCase())) &&
      (!filter.month || (p.month && p.month === filter.month)) &&
      (!filter.status || (p.status && p.status === filter.status)) &&
      (!search || 
        employeeName.toLowerCase().includes(search.toLowerCase()) || 
        employeeId.toLowerCase().includes(search.toLowerCase()) ||
        (p.month && p.month.toLowerCase().includes(search.toLowerCase()))
      )
    );
  });

  return (
    <div className="p-6 md:p-10">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">Payroll Management</h1>
          <p className="text-gray-500 mt-1">Manage employee compensation and payroll processing</p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <button 
            onClick={handleExport} 
            className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100"
          >
            <Download className="h-4 w-4" /> Export Report
          </button>
          <button 
            onClick={openAddModal}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Payroll
          </button>
          <button 
            onClick={handleProcess} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" /> Process Payroll
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Payroll</span>
          <span className="text-3xl font-bold">${totalPayroll.toLocaleString()}</span>
          <span className="text-green-600 text-xs mt-1">Current period</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Average Salary</span>
          <span className="text-3xl font-bold">${Math.round(averageSalary).toLocaleString()}</span>
          <span className="text-gray-500 text-xs mt-1">Per employee</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Overtime</span>
          <span className="text-3xl font-bold">${totalOvertime.toLocaleString()}</span>
          <span className="text-gray-500 text-xs mt-1">This pay period</span>
        </div>
        <div className="bg-white rounded-lg border p-5 flex flex-col">
          <span className="text-gray-500 text-sm">Total Bonuses</span>
          <span className="text-3xl font-bold">${totalBonuses.toLocaleString()}</span>
          <span className="text-gray-500 text-xs mt-1">Performance bonuses</span>
        </div>
      </div>

      {/* Payroll Records Card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Payroll Records</h2>
            <p className="text-gray-500 text-sm">View and manage employee payroll information ({filteredPayroll.length} records)</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search payroll..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button 
              onClick={() => setFilterModal(true)}
              className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100"
            >
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        {filteredPayroll.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No payroll records found.</p>
            <button 
              onClick={openAddModal}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Add your first payroll record
            </button>
          </div>
        ) : (
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
                {filteredPayroll.map((pay) => {
                  const employee = employees.find(e => e.id === pay.employeeId);
                  const initials = employee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
                  
                  return (
                    <tr key={pay.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 flex items-center gap-3 min-w-[200px]">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold">{employee?.name || 'Unknown Employee'}</div>
                          <div className="text-xs text-gray-500">{employee?.department || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold">{employee?.position || 'N/A'}</td>
                      <td className="py-3 px-3 font-semibold">${Number(pay.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold">${Number(pay.overtime || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold">${Number(pay.bonuses || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold text-red-600">${Number(pay.deductions || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold text-green-600">${Number(pay.netPay || pay.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          pay.status === 'Paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 flex gap-2">
                        <button 
                          onClick={() => handleRowDownload(pay)} 
                          className="text-gray-500 hover:text-blue-600" 
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(pay)} 
                          className="text-gray-500 hover:text-blue-600" 
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(pay.id)} 
                          className="text-gray-500 hover:text-red-600" 
                          title="Delete"
                        >
                          <span className="sr-only">Delete</span>🗑️
                        </button>
                        <button 
                          onClick={() => handleMarkAsPaid(pay)} 
                          className={`text-gray-500 hover:text-green-600 ${pay.status === 'Paid' ? 'opacity-50' : ''}`}
                          title="Mark as Paid" 
                          disabled={pay.status === 'Paid'}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <Dialog open={filterModal} onOpenChange={setFilterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Payroll</DialogTitle>
            <DialogDescription>Filter payroll records by employee, month, or status.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <input 
                placeholder="Employee Name" 
                value={filter.employee} 
                onChange={e => setFilter(f => ({ ...f, employee: e.target.value }))} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input 
                type="month"
                placeholder="Month" 
                value={filter.month} 
                onChange={e => setFilter(f => ({ ...f, month: e.target.value }))} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={filter.status} 
                onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
              <Button variant="outline" onClick={clearFilters} className="flex-1">Clear All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === 'add' ? 'Add New Payroll' : 'Edit Payroll'}</DialogTitle>
            <DialogDescription>
              {modalMode === 'add' ? 'Fill out the form to add a new payroll record.' : 'Fill out the form to edit the payroll record.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
              <select 
                value={modalMode === 'add' ? newPayroll.employeeId : editPayroll.employeeId} 
                onChange={e => modalMode === 'add' 
                  ? setNewPayroll({ ...newPayroll, employeeId: e.target.value }) 
                  : setEditPayroll({ ...editPayroll, employeeId: e.target.value })
                } 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
              <input 
                type="month"
                placeholder="Month" 
                value={modalMode === 'add' ? newPayroll.month : editPayroll.month} 
                onChange={e => modalMode === 'add' 
                  ? setNewPayroll({ ...newPayroll, month: e.target.value }) 
                  : setEditPayroll({ ...editPayroll, month: e.target.value })
                } 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
              <input 
                type="number" 
                placeholder="Base Salary" 
                value={modalMode === 'add' ? newPayroll.amount : editPayroll.amount} 
                onChange={e => modalMode === 'add' 
                  ? setNewPayroll({ ...newPayroll, amount: Number(e.target.value) }) 
                  : setEditPayroll({ ...editPayroll, amount: Number(e.target.value) })
                } 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overtime</label>
              <input 
                type="number" 
                placeholder="Overtime Pay" 
                value={modalMode === 'add' ? newPayroll.overtime : editPayroll.overtime} 
                onChange={e => modalMode === 'add' 
                  ? setNewPayroll({ ...newPayroll, overtime: Number(e.target.value) }) 
                  : setEditPayroll({ ...editPayroll, overtime: Number(e.target.value) })
                } 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonuses</label>
              <input 
                type="number" 
                placeholder="Bonuses" 
                value={modalMode === 'add' ? newPayroll.bonuses : editPayroll.bonuses} 
                onChange={e => modalMode === 'add' 
                  ? setNewPayroll({ ...newPayroll, bonuses: Number(e.target.value) }) 
                  : setEditPayroll({ ...editPayroll, bonuses: Number(e.target.value) })
                } 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
              <input 
                type="number" 
                placeholder="Deductions" 
                value={modalMode === 'add' ? newPayroll.deductions : editPayroll.deductions} 
                onChange={e => modalMode === 'add' 
                  ? setNewPayroll({ ...newPayroll, deductions: Number(e.target.value) }) 
                  : setEditPayroll({ ...editPayroll, deductions: Number(e.target.value) })
                } 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            {/* Add any other fields here if needed */}
            <div className="flex gap-2 mt-4">
              <Button onClick={modalMode === 'add' ? handleAdd : handleUpdate} className="flex-1">{modalMode === 'add' ? 'Add Payroll' : 'Save Changes'}</Button>
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}