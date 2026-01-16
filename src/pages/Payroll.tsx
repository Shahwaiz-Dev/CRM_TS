import React, { useEffect, useState } from "react";
import { getPayroll, addPayroll, updatePayroll, deletePayroll, getEmployees } from "@/lib/firebase";
import { Search, Filter, Download, Edit, Check, DollarSign, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { StatsCardsSkeleton } from '@/components/ui/StatsCardsSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/store/slices/languageSlice";
import { setPayrollRecords, setLoading as setPayrollLoading, setError as setPayrollError } from "@/store/slices/payrollSlice";
import { setEmployees, setLoading as setEmployeesLoading } from "@/store/slices/employeesSlice";

function toCSV(rows) {
  const header = ['Name', 'Employee ID', 'Position', 'Department', 'Base Salary', 'Overtime', 'Bonuses', 'Deductions', 'Net Pay', 'Status'];
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const payroll = useAppSelector((state) => state.payroll.records);
  const dataLoading = useAppSelector((state) => state.payroll.loading);
  const employees = useAppSelector((state) => state.employees.employees);

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
  const [search, setSearch] = useState('');

  const { t } = useTranslation();

  const fetchPayroll = async () => {
    dispatch(setPayrollError(""));
    dispatch(setPayrollLoading(true));
    try {
      const payrollData = await getPayroll();
      dispatch(setPayrollRecords(payrollData));
    } catch (e) {
      dispatch(setPayrollError("Failed to fetch payroll"));
    } finally {
      dispatch(setPayrollLoading(false));
    }
  };

  const fetchEmployees = async () => {
    dispatch(setEmployeesLoading(true));
    try {
      const employeesData = await getEmployees();
      dispatch(setEmployees(employeesData));
    } catch (e) {
      dispatch(setPayrollError("Failed to fetch employees"));
    } finally {
      dispatch(setEmployeesLoading(false));
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
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <StatsCardsSkeleton count={4} />
        <div className="bg-card rounded-xl border p-6">
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
          <TableSkeleton rows={5} columns={9} />
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{t('payroll_management')}</h1>
          <p className="text-muted-foreground mt-1">{t('manage_employee_compensation')}</p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <button
            onClick={handleExport}
            className="border rounded-lg px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-100"
          >
            <Download className="h-4 w-4" /> {t('export_report')}
          </button>
          <button
            onClick={openAddModal}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> {t('add_payroll')}
          </button>
          <button
            onClick={handleProcess}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" /> {t('process_payroll')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('total_payroll')}</span>
          <span className="text-3xl font-bold text-foreground">${totalPayroll.toLocaleString()}</span>
          <span className="text-green-500 text-xs mt-1">{t('current_period')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('average_salary')}</span>
          <span className="text-3xl font-bold text-foreground">${Math.round(averageSalary).toLocaleString()}</span>
          <span className="text-muted-foreground text-xs mt-1">{t('per_employee')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('total_overtime')}</span>
          <span className="text-3xl font-bold text-foreground">${totalOvertime.toLocaleString()}</span>
          <span className="text-muted-foreground text-xs mt-1">{t('this_pay_period')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('total_bonuses')}</span>
          <span className="text-3xl font-bold text-foreground">${totalBonuses.toLocaleString()}</span>
          <span className="text-muted-foreground text-xs mt-1">{t('performance_bonuses')}</span>
        </div>
      </div>

      {/* Payroll Records Card */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('payroll_records')}</h2>
            <p className="text-muted-foreground text-sm">{t('view_and_manage_payroll_info', { count: filteredPayroll.length })}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('search_payroll')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-3 py-2 border rounded-lg w-full bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <button
              onClick={() => setFilterModal(true)}
              className="border rounded-lg px-4 py-2 flex items-center gap-2 text-foreground hover:bg-muted transition-colors"
            >
              <Filter className="h-4 w-4" /> {t('filter')}
            </button>
          </div>
        </div>

        {filteredPayroll.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('no_payroll_records_found')}</p>
            <button
              onClick={openAddModal}
              className="mt-2 text-primary hover:underline"
            >
              {t('add_your_first_payroll_record')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('employee')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('position')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('base_salary')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('overtime')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('bonuses')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('deductions')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('net_pay')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('status')}</th>
                  <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayroll.map((pay) => {
                  const employee = employees.find(e => e.id === pay.employeeId);
                  const initials = employee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

                  return (
                    <tr key={pay.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-3 min-w-[200px]">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{employee?.name || t('unknown_employee')}</div>
                          <div className="text-xs text-muted-foreground">{employee?.department || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">{employee?.position || 'N/A'}</td>
                      <td className="py-3 px-3 font-semibold text-foreground">${Number(pay.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold text-foreground">${Number(pay.overtime || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold text-foreground">${Number(pay.bonuses || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold text-destructive">${Number(pay.deductions || 0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-semibold text-green-500">${Number(pay.netPay || pay.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pay.status === 'Paid'
                          ? 'bg-green-500/10 text-green-600 border border-green-200/20'
                          : 'bg-yellow-500/10 text-yellow-600 border border-yellow-200/20'
                          }`}>
                          {t(pay.status.toLowerCase())}
                        </span>
                      </td>
                      <td className="py-3 px-3 flex gap-2">
                        <button
                          onClick={() => handleRowDownload(pay)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(pay)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pay.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <span className="sr-only">Delete</span>🗑️
                        </button>
                        <button
                          onClick={() => handleMarkAsPaid(pay)}
                          className={`text-muted-foreground hover:text-green-500 transition-colors ${pay.status === 'Paid' ? 'opacity-50' : ''}`}
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
            <DialogTitle>{t('filter_payroll')}</DialogTitle>
            <DialogDescription>{t('filter_payroll_description')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('employee')}</label>
              <input
                placeholder={t('employee_name')}
                value={filter.employee}
                onChange={e => setFilter(f => ({ ...f, employee: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('month')}</label>
              <input
                type="month"
                placeholder={t('month')}
                value={filter.month}
                onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
              <select
                value={filter.status}
                onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="" className="bg-background text-foreground">{t('all_statuses')}</option>
                <option value="Pending" className="bg-background text-foreground">{t('pending')}</option>
                <option value="Paid" className="bg-background text-foreground">{t('paid')}</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={applyFilters} className="flex-1">{t('apply_filters')}</Button>
              <Button variant="outline" onClick={clearFilters} className="flex-1">{t('clear_all')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === 'add' ? t('add_new_payroll') : t('edit_payroll')}</DialogTitle>
            <DialogDescription>
              {modalMode === 'add' ? t('add_new_payroll_desc') : t('edit_payroll_desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('employee')} *</label>
              <select
                value={modalMode === 'add' ? newPayroll.employeeId : editPayroll.employeeId}
                onChange={e => modalMode === 'add'
                  ? setNewPayroll({ ...newPayroll, employeeId: e.target.value })
                  : setEditPayroll({ ...editPayroll, employeeId: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="" className="bg-background text-foreground">{t('select_employee')}</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id} className="bg-background text-foreground">{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('month')} *</label>
              <input
                type="month"
                placeholder={t('month')}
                value={modalMode === 'add' ? newPayroll.month : editPayroll.month}
                onChange={e => modalMode === 'add'
                  ? setNewPayroll({ ...newPayroll, month: e.target.value })
                  : setEditPayroll({ ...editPayroll, month: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('base_salary')}</label>
              <input
                type="number"
                placeholder={t('base_salary')}
                value={modalMode === 'add' ? newPayroll.amount : editPayroll.amount}
                onChange={e => modalMode === 'add'
                  ? setNewPayroll({ ...newPayroll, amount: Number(e.target.value) })
                  : setEditPayroll({ ...editPayroll, amount: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('overtime')}</label>
              <input
                type="number"
                placeholder={t('overtime_pay')}
                value={modalMode === 'add' ? newPayroll.overtime : editPayroll.overtime}
                onChange={e => modalMode === 'add'
                  ? setNewPayroll({ ...newPayroll, overtime: Number(e.target.value) })
                  : setEditPayroll({ ...editPayroll, overtime: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('bonuses')}</label>
              <input
                type="number"
                placeholder={t('bonuses')}
                value={modalMode === 'add' ? newPayroll.bonuses : editPayroll.bonuses}
                onChange={e => modalMode === 'add'
                  ? setNewPayroll({ ...newPayroll, bonuses: Number(e.target.value) })
                  : setEditPayroll({ ...editPayroll, bonuses: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('deductions')}</label>
              <input
                type="number"
                placeholder={t('deductions')}
                value={modalMode === 'add' ? newPayroll.deductions : editPayroll.deductions}
                onChange={e => modalMode === 'add'
                  ? setNewPayroll({ ...newPayroll, deductions: Number(e.target.value) })
                  : setEditPayroll({ ...editPayroll, deductions: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2 bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Add any other fields here if needed */}
            <div className="flex gap-2 mt-4">
              <Button onClick={modalMode === 'add' ? handleAdd : handleUpdate} className="flex-1">{modalMode === 'add' ? t('add_payroll') : t('save_changes')}</Button>
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">{t('cancel')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}