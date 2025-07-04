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
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const navigationItems = [
  { title: 'Dashboard', url: '/', icon: Calendar, roles: ['admin', 'sales', 'new user'] },
  { title: 'Accounts', url: '/accounts', icon: Users, roles: ['admin', 'sales', 'new user'] },
  { title: 'Opportunities', url: '/opportunities', icon: Trophy, roles: ['admin', 'sales', 'new user'] },
  { title: 'Sales Pipeline', url: '/pipeline', icon: List, roles: ['admin', 'sales', 'new user'] },
  { title: 'Tasks', url: '/tasks', icon: List, roles: ['admin', 'sales', 'new user'] },
  { title: 'Users & Roles', url: '/users', icon: User, roles: ['admin'] },
];

const hrNavigationItems = [
  { title: 'Employees', url: '/hr/employees', icon: Briefcase, roles: ['admin', 'hr', 'new user'] },
  { title: 'Payroll', url: '/hr/payroll', icon: DollarSign, roles: ['admin', 'hr', 'new user'] },
  { title: 'Attendance', url: '/hr/attendance', icon: Clock, roles: ['admin', 'hr', 'new user'] },
];

export function CRMSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const { user } = useAuth();
  const role = user?.role;

  const isActive = (path) => currentPath === path;

  const getLinkClassName = (path) => {
    const baseClasses = "flex items-center gap-3 w-full p-2 rounded-md transition-all duration-200";
    const isCurrentlyActive = isActive(path);
    
    if (isCurrentlyActive) {
      return `${baseClasses} bg-blue-600 text-white `;
    }
    
    return `hover:bg-white-600 text-gray-700 ${baseClasses}`;
  };

  const getIconClassName = (path) => {
    const baseClasses = "h-5 w-5 flex-shrink-0 transition-colors duration-200";
    const isCurrentlyActive = isActive(path);
    
    if (isCurrentlyActive) {
      return `${baseClasses} text-white`;
    }
    
    return `${baseClasses} text-gray-500`;
  };

  const getTextClassName = (path) => {
    const baseClasses = `text-[16px] transition-colors duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`;
    const isCurrentlyActive = isActive(path);
    
    if (isCurrentlyActive) {
      return `${baseClasses} text-white`;
    }
    
    return `${baseClasses} text-gray-700`;
  };

  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      <SidebarTrigger className="m-2 self-end bg-white" />
      <SidebarContent className="bg-white">
        <div className="p-4 bg-white">
          <h2 className={`font-bold text-2xl text-gray-800 transition-opacity duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>CRM Pro</h2>
        </div>
        {/* Only show NAVIGATION section if not HR-only */}
        {role !== 'hr' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-700 text-lg font-semibold pb-1">NAVIGATION</SidebarGroupLabel>
            <SidebarGroupContent className="bg-white">
              <SidebarMenu>
                {navigationItems.filter(item => item.roles.includes(role)).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url} end className={getLinkClassName(item.url)}>
                      <item.icon className={getIconClassName(item.url)} />
                      <span className={getTextClassName(item.url)}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {/* HR MANAGEMENT section visible to admin and hr */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 text-lg font-semibold pb-1">HR MANAGEMENT</SidebarGroupLabel>
          <SidebarGroupContent className="bg-white">
            <SidebarMenu>
              {hrNavigationItems.filter(item => item.roles.includes(role)).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url} className={getLinkClassName(item.url)}>
                    <item.icon className={getIconClassName(item.url)} />
                    <span className={getTextClassName(item.url)}>
                      {item.title}
                    </span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}