import React, { useEffect, useState } from "react";
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from "@/lib/firebase";
import { Search, Filter, Edit, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { StatsCardsSkeleton } from '@/components/ui/StatsCardsSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setEmployees, setLoading as setEmployeesLoading, setError as setEmployeesError } from "@/store/slices/employeesSlice";
import { useTranslation } from "@/store/slices/languageSlice";

export default function Employees() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const employees = useAppSelector((state) => state.employees.employees);
  const dataLoading = useAppSelector((state) => state.employees.loading);
  const error = useAppSelector((state) => state.employees.error);

  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", position: "", department: "", hireDate: "", status: "Active", phone: "", salary: "" });
  const [editId, setEditId] = useState(null);
  const [editEmployee, setEditEmployee] = useState({ name: "", email: "", position: "", department: "", hireDate: "", status: "Active", phone: "", salary: "" });
  const [showAdd, setShowAdd] = useState(false);

  const { t } = useTranslation();

  const fetchEmployees = async () => {
    dispatch(setEmployeesLoading(true));
    try {
      const data = await getEmployees();
      dispatch(setEmployees(data));
    } catch (e) {
      dispatch(setEmployeesError(t('failed_to_fetch_employees')));
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleAdd = async () => {
    dispatch(setEmployeesError(null));
    try {
      await addEmployee(newEmployee);
      setNewEmployee({ name: "", email: "", position: "", department: "", hireDate: "", status: "Active", phone: "", salary: "" });
      fetchEmployees();
    } catch (e) {
      dispatch(setEmployeesError(t('failed_to_add_employee')));
    }
  };

  const handleEdit = (emp) => {
    setEditId(emp.id);
    setEditEmployee(emp);
  };

  const handleUpdate = async () => {
    try {
      await updateEmployee(editId, editEmployee);
      setEditId(null);
      fetchEmployees();
    } catch (e) {
      dispatch(setEmployeesError(t('failed_to_update_employee')));
    }
  };

  const handleDelete = async (id) => {
    dispatch(setEmployeesError(null));
    try {
      await deleteEmployee(id);
      fetchEmployees();
    } catch (e) {
      dispatch(setEmployeesError(t('failed_to_delete_employee')));
    }
  };

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts.length === 1 ? parts[0][0] : parts[0][0] + parts[1][0];
  };

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
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
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
          <TableSkeleton rows={5} columns={7} />
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{t('employees')}</h1>
          <p className="text-muted-foreground mt-1">{t('manage_team_members')}</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-base flex items-center gap-2 self-start md:self-auto"><span className="text-lg font-bold">+</span> {t('add_employee')}</button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_employee')}</DialogTitle>
            </DialogHeader>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="flex flex-wrap gap-2 mb-4">
              <input placeholder={t('name')} value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
              <input placeholder={t('email')} value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
              <input placeholder={t('phone')} value={newEmployee.phone} onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
              <input placeholder={t('position')} value={newEmployee.position} onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
              <input placeholder={t('department')} value={newEmployee.department} onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
              <input placeholder={t('salary')} value={newEmployee.salary} onChange={e => setNewEmployee({ ...newEmployee, salary: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
              <input type="date" placeholder={t('hire_date')} value={newEmployee.hireDate} onChange={e => setNewEmployee({ ...newEmployee, hireDate: e.target.value })} className="bg-background border p-1 rounded text-foreground" />
              <select value={newEmployee.status} onChange={e => setNewEmployee({ ...newEmployee, status: e.target.value })} className="bg-background border p-1 rounded text-foreground">
                <option value="Active" className="bg-background text-foreground">{t('active')}</option>
                <option value="Inactive" className="bg-background text-foreground">{t('inactive')}</option>
              </select>
              <button onClick={async () => { await handleAdd(); setShowAdd(false); }} className="bg-blue-600 text-white px-3 py-1 rounded">
                {t('add')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('total_employees')}</span>
          <span className="text-3xl font-bold text-foreground">{employees.length}</span>
          <span className="text-green-500 text-xs mt-1">{t('plus_three_this_month')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('active_employees')}</span>
          <span className="text-3xl font-bold text-foreground">{employees.filter(e => e.status === 'Active').length}</span>
          <span className="text-muted-foreground text-xs mt-1">{((employees.filter(e => e.status === 'Active').length / (employees.length || 1)) * 100).toFixed(1)}% {t('of_total')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('departments')}</span>
          <span className="text-3xl font-bold text-foreground">{[...new Set(employees.map(e => e.department))].length}</span>
          <span className="text-muted-foreground text-xs mt-1">{t('active_departments')}</span>
        </div>
        <div className="bg-card rounded-lg border p-5 flex flex-col">
          <span className="text-muted-foreground text-sm">{t('avg_tenure')}</span>
          <span className="text-3xl font-bold text-foreground">2.4</span>
          <span className="text-muted-foreground text-xs mt-1">{t('years_per_employee')}</span>
        </div>
      </div>
      {/* Directory Card */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('employee_directory')}</h2>
            <p className="text-muted-foreground text-sm">{t('view_and_manage_employee_info')}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <input type="text" placeholder={t('search_employees')} className="pl-10 pr-3 py-2 border rounded-lg w-full bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <button className="border rounded-lg px-4 py-2 flex items-center gap-2 text-foreground hover:bg-muted transition-colors"><Filter className="h-4 w-4" /> {t('filter')}</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('employee')}</th>
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('position')}</th>
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('department')}</th>
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('salary')}</th>
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('start_date')}</th>
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('status')}</th>
                <th className="py-2 px-3 text-left font-semibold text-muted-foreground">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-3 min-w-[200px]">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground border">{getInitials(emp.name)}</div>
                    <div>
                      <div className="font-semibold text-foreground">{emp.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>&#9993; {emp.email}</span>
                        <span>&#128222; {emp.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-foreground">{emp.position}</td>
                  <td className="py-3 px-3"><span className="bg-muted text-muted-foreground border rounded px-2 py-1 text-xs font-semibold">{emp.department}</span></td>
                  <td className="py-3 px-3 font-semibold text-foreground">{emp.salary}</td>
                  <td className="py-3 px-3 flex items-center gap-1 text-muted-foreground"><Calendar className="h-4 w-4 text-muted-foreground" /> {emp.hireDate}</td>
                  <td className="py-3 px-3"><span className="bg-green-500/10 text-green-600 border border-green-200/20 rounded-full px-3 py-1 text-xs font-semibold">{t(emp.status.toLowerCase())}</span></td>
                  <td className="py-3 px-3 flex gap-2">
                    {editId === emp.id ? (
                      <>
                        <button className="text-muted-foreground mr-2 hover:text-foreground transition-colors" onClick={handleUpdate}>{t('save')}</button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setEditId(null)}>{t('cancel')}</button>
                      </>
                    ) : (
                      <>
                        <button className="text-muted-foreground hover:text-blue-600 transition-colors" onClick={() => handleEdit(emp)}><Edit className="h-4 w-4" />
                          <span className="sr-only">{t('edit')}</span>
                        </button>
                        <button className="text-muted-foreground hover:text-red-600 transition-colors" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t('delete')}</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
} 