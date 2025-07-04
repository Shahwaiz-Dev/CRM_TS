import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CRMSidebar } from '@/components/crm/CRMSidebar';
import { DashboardHeader } from '@/components/crm/DashboardHeader';
import { PipelineView } from '@/components/crm/PipelineView';
import { AccountsView } from '@/components/crm/AccountsView';
import { TasksView } from '@/components/crm/TasksView';
import { UsersView } from '@/components/crm/UsersView';
import { DashboardOverview } from '@/components/crm/DashboardOverview';
import { OpportunitiesView } from '../components/crm/OpportunitiesView';
import { ContactsView } from '@/components/crm/ContactsView';
import { CasesView } from '@/components/crm/CasesView';
import { DealsView } from '@/components/crm/DealsView';
import Employees from './Employees';
import Payroll from './Payroll';
import Attendance from './Attendance';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useLoading } from "@/components/ui/PageLoader";
import { RequireRole } from '@/components/crm/RequireRole';

const Dashboard = () => {
  const location = useLocation();
  const { setLoading } = useLoading();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row w-full bg-white">
        <CRMSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <DashboardHeader />
          <main className="flex-1 overflow-auto bg-gray-50 px-2 sm:px-4 md:px-6 lg:px-12 py-2 md:py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="h-full"
              >
                <Routes location={location}>
                  <Route path="/" element={
                    <RequireRole allowedRoles={['admin', 'sales']}>
                      <DashboardOverview />
                    </RequireRole>
                  } />
                  <Route path="/opportunities" element={
                    <RequireRole allowedRoles={['admin', 'sales']}>
                      <OpportunitiesView />
                    </RequireRole>
                  } />
                  <Route path="/pipeline" element={
                    <RequireRole allowedRoles={['admin', 'sales']}>
                      <PipelineView />
                    </RequireRole>
                  } />
                  <Route path="/accounts" element={
                    <RequireRole allowedRoles={['admin', 'sales']}>
                      <AccountsView />
                    </RequireRole>
                  } />
                  <Route path="/contacts" element={
                    <RequireRole allowedRoles={['admin', 'sales']}>
                      <ContactsView />
                    </RequireRole>
                  } />
                  <Route path="/cases" element={
                    <RequireRole allowedRoles={['admin', 'sales']}>
                      <CasesView />
                    </RequireRole>
                  } />
                  <Route path="/deals" element={
                    <RequireRole allowedRoles={['admin', 'sales']}>
                      <DealsView />
                    </RequireRole>
                  } />
                  <Route path="/tasks" element={
                    <RequireRole allowedRoles={['admin', 'sales']}>
                      <TasksView />
                    </RequireRole>
                  } />
                  <Route path="/users" element={
                    <RequireRole allowedRoles={['admin']}>
                      <UsersView />
                    </RequireRole>
                  } />
                  <Route path="/hr/employees" element={
                    <RequireRole allowedRoles={['admin', 'hr']}>
                      <Employees />
                    </RequireRole>
                  } />
                  <Route path="/hr/payroll" element={
                    <RequireRole allowedRoles={['admin', 'hr']}>
                      <Payroll />
                    </RequireRole>
                  } />
                  <Route path="/hr/attendance" element={
                    <RequireRole allowedRoles={['admin', 'hr']}>
                      <Attendance />
                    </RequireRole>
                  } />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
