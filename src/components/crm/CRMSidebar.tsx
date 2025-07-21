import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Users, User, List, Calendar, Trophy, Briefcase, DollarSign, Clock, AlertCircle, Shield } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function CRMSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';
  const { user } = useAuth();
  const role = user?.role;
  const { t } = useLanguage();

  // Move navigation items inside the component to use t()
  const navigationItems = [
    { title: t('dashboard'), url: '/', icon: Calendar, roles: ['admin', 'sales', 'new user'] },
    { title: t('accounts'), url: '/accounts', icon: Users, roles: ['admin', 'sales', 'new user'] },
    { title: t('contacts'), url: '/contacts', icon: User, roles: ['admin', 'sales', 'new user'] },
    { title: t('cases'), url: '/cases', icon: AlertCircle, roles: ['admin', 'sales', 'new user'] },
    { title: t('deals'), url: '/deals', icon: DollarSign, roles: ['admin', 'sales', 'new user'] },
    { title: t('opportunities'), url: '/opportunities', icon: Trophy, roles: ['admin', 'sales', 'new user'] },
    { title: t('sales_pipeline'), url: '/pipeline', icon: List, roles: ['admin', 'sales', 'new user'] },
    { title: t('tasks'), url: '/tasks', icon: List, roles: ['admin', 'sales', 'new user'] },
    { title: t('users_roles'), url: '/users', icon: User, roles: ['admin'] },
  ];

  const hrNavigationItems = [
    { title: t('employees'), url: '/hr/employees', icon: Briefcase, roles: ['admin', 'hr', 'new user'] },
    { title: t('payroll'), url: '/hr/payroll', icon: DollarSign, roles: ['admin', 'hr', 'new user'] },
    { title: t('attendance'), url: '/hr/attendance', icon: Clock, roles: ['admin', 'hr', 'new user'] },
  ];

  const isActive = (path) => currentPath === path;

  const getLinkClassName = (path, hasPermission = true) => {
    const baseClasses = "flex items-center gap-3 w-full p-2 rounded-md transition-all duration-200";
    const isCurrentlyActive = isActive(path);
    
    if (!hasPermission) {
      return `${baseClasses} text-gray-400 cursor-not-allowed opacity-50`;
    }
    
    if (isCurrentlyActive) {
      return `${baseClasses} bg-blue-600 text-white `;
    }
    
    return `hover:bg-white-600 text-gray-700 ${baseClasses}`;
  };

  const getIconClassName = (path, hasPermission = true) => {
    const baseClasses = "h-5 w-5 flex-shrink-0 transition-colors duration-200";
    const isCurrentlyActive = isActive(path);
    
    if (!hasPermission) {
      return `${baseClasses} text-gray-400`;
    }
    
    if (isCurrentlyActive) {
      return `${baseClasses} text-white`;
    }
    
    return `${baseClasses} text-gray-500`;
  };

  const getTextClassName = (path, hasPermission = true) => {
    const baseClasses = `text-[16px] transition-colors duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`;
    const isCurrentlyActive = isActive(path);
    
    if (!hasPermission) {
      return `${baseClasses} text-gray-400`;
    }
    
    if (isCurrentlyActive) {
      return `${baseClasses} text-white`;
    }
    
    return `${baseClasses} text-gray-700`;
  };

  const renderNavigationItem = (item) => {
    const hasPermission = item.roles.includes(role);
    
    if (hasPermission) {
      return (
        <SidebarMenuItem key={item.title}>
          <NavLink to={item.url} end className={getLinkClassName(item.url, true)}>
            <item.icon className={getIconClassName(item.url, true)} />
            <span className={getTextClassName(item.url, true)}>
              {item.title}
            </span>
          </NavLink>
        </SidebarMenuItem>
      );
    } else {
      return (
        <TooltipProvider key={item.title}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuItem>
                <div className={getLinkClassName(item.url, false)}>
                  <item.icon className={getIconClassName(item.url, false)} />
                  <span className={getTextClassName(item.url, false)}>
                    {item.title}
                  </span>
                </div>
              </SidebarMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>{t('requires')}: {item.roles.map(r => t(r.replace(/ /g, '_'))).join(', ')}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  };

  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      <SidebarTrigger className="m-2 self-end bg-white" />
      <SidebarContent className="bg-white">
        <div className="p-4 bg-white">
          <h2 className={`font-bold text-2xl text-gray-800 transition-opacity duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>CRM Pro</h2>
        </div>
        {/* NAVIGATION section - show all items but disable unauthorized ones */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-600 text-lg font-semibold pb-1">{t('navigation')}</SidebarGroupLabel>
          <SidebarGroupContent className="bg-white">
            <SidebarMenu>
              {navigationItems.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* HR MANAGEMENT section - show all items but disable unauthorized ones */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-600 text-lg font-semibold pb-1">{t('hr_management')}</SidebarGroupLabel>
          <SidebarGroupContent className="bg-white">
            <SidebarMenu>
              {hrNavigationItems.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}