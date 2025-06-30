import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Users, User, List, Calendar, Trophy, Briefcase, DollarSign, Clock } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  { title: 'Dashboard', url: '/', icon: Calendar },
  { title: 'Accounts', url: '/accounts', icon: Users },
  { title: 'Opportunities', url: '/opportunities', icon: Trophy },
  { title: 'Sales Pipeline', url: '/pipeline', icon: List },
  { title: 'Tasks', url: '/tasks', icon: List },
  { title: 'Users & Roles', url: '/users', icon: User },
];

export function CRMSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      <SidebarTrigger className="m-2 self-end bg-white" />
      
      <SidebarContent className="bg-white">
        <div className="p-4 bg-white">
          <h2 className={`font-bold text-2xl text-gray-800 transition-opacity duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            CRM Pro
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 text-lg font-semibold pb-1">NAVIGATION</SidebarGroupLabel>
          <SidebarGroupContent className="bg-white">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-3 w-full group"
                    >
                      <item.icon className="h-7 w-7 flex-shrink-0 text-gray-500 transition-colors duration-150" />
                      <span className={`text-gray-700 text-[17px] font-semibold transition-colors duration-150 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 text-lg font-semibold pb-1">HR MANAGEMENT</SidebarGroupLabel>
          <SidebarGroupContent className="bg-white">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/hr/employees')}>
                  <NavLink to="/hr/employees" className="flex items-center gap-3 w-full group">
                    <Briefcase className="h-7 w-7 flex-shrink-0 text-gray-500 transition-colors duration-150" />
                    <span className={`text-gray-700  text-[17px] font-semibold transition-colors duration-150 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                      Employees
                    </span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/hr/payroll')}>
                  <NavLink to="/hr/payroll" className="flex items-center gap-3 w-full group">
                    <DollarSign className="h-7 w-7 flex-shrink-0 text-gray-500 transition-colors duration-150" />
                    <span className={`text-gray-700  text-[17px] font-semibold transition-colors duration-150 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                      Payroll
                    </span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/hr/attendance')}>
                  <NavLink to="/hr/attendance" className="flex items-center gap-3 w-full group">
                    <Clock className="h-7 w-7 flex-shrink-0 text-gray-500 transition-colors duration-150" />
                    <span className={`text-gray-700 text-[17px] font-semibold transition-colors duration-150 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                      Attendance
                    </span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
