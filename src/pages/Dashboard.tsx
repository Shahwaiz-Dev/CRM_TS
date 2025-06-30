import React from 'react';
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
import Employees from './Employees';
import Payroll from './Payroll';
import Attendance from './Attendance';
import { AnimatePresence, motion } from 'framer-motion';

const Dashboard = () => {
  const location = useLocation();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <CRMSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <DashboardHeader />
          <main className="flex-1 overflow-auto bg-gray-50 px-4 sm:px-6 md:px-8 lg:px-12">
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
                  <Route path="/" element={<DashboardOverview />} />
                  <Route path="/opportunities" element={<OpportunitiesView />} />
                  <Route path="/pipeline" element={<PipelineView />} />
                  <Route path="/accounts" element={<AccountsView />} />
                  <Route path="/tasks" element={<TasksView />} />
                  <Route path="/users" element={<UsersView />} />
                  <Route path="/hr/employees" element={<Employees />} />
                  <Route path="/hr/payroll" element={<Payroll />} />
                  <Route path="/hr/attendance" element={<Attendance />} />
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
