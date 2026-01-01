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
    const baseClasses = "relative flex items-center gap-3 w-full p-2.5 rounded-xl transition-all duration-300 group overflow-hidden";
    const isCurrentlyActive = isActive(path);

    if (!hasPermission) {
      return `${baseClasses} text-gray-400 cursor-not-allowed opacity-50`;
    }

    if (isCurrentlyActive) {
      return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25`;
    }

    return `${baseClasses} text-gray-600 hover:bg-blue-50/80 hover:text-blue-600 hover:shadow-sm`;
  };

  const getIconClassName = (path, hasPermission = true) => {
    const baseClasses = "h-5 w-5 flex-shrink-0 transition-all duration-300";
    const isCurrentlyActive = isActive(path);

    if (!hasPermission) {
      return `${baseClasses} text-gray-400`;
    }

    if (isCurrentlyActive) {
      return `${baseClasses} text-white scale-110`;
    }

    return `${baseClasses} text-gray-400 group-hover:text-blue-600 group-hover:scale-110`;
  };

  const getTextClassName = (path, hasPermission = true) => {
    const baseClasses = `text-[15px] font-medium tracking-wide transition-all duration-300 ${collapsed ? 'opacity-0 w-0 translate-x-4' : 'opacity-100 translate-x-0'}`;
    const isCurrentlyActive = isActive(path);

    if (!hasPermission) {
      return `${baseClasses} text-gray-400`;
    }

    if (isCurrentlyActive) {
      return `${baseClasses} text-white`;
    }

    return `${baseClasses} text-gray-600 group-hover:text-blue-700`;
  };

  const renderNavigationItem = (item) => {
    const hasPermission = item.roles.includes(role);

    if (hasPermission) {
      return (
        <SidebarMenuItem key={item.title} className="mb-1">
          <NavLink to={item.url} end className={getLinkClassName(item.url, true)}>
            <item.icon className={getIconClassName(item.url, true)} />
            <span className={getTextClassName(item.url, true)}>
              {item.title}
            </span>
            {isActive(item.url) && !collapsed && (
              <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
            )}
          </NavLink>
        </SidebarMenuItem>
      );
    } else {
      return (
        <TooltipProvider key={item.title}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuItem className="mb-1">
                <div className={getLinkClassName(item.url, false)}>
                  <item.icon className={getIconClassName(item.url, false)} />
                  <span className={getTextClassName(item.url, false)}>
                    {item.title}
                  </span>
                </div>
              </SidebarMenuItem>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-white/90 backdrop-blur-sm border-blue-100 text-blue-900">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>{t('requires')}: {item.roles.map(r => t(r.replace(/ /g, '_'))).join(', ')}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  };

  return (
    <Sidebar
      className="border-r border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl transition-all duration-500"
      collapsible="icon"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
      <SidebarTrigger className="m-3 self-end text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors z-10" />
      <SidebarContent className="bg-transparent px-3 py-2">
        <div className={`mb-8 px-2 transition-all duration-500 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
          <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent tracking-tight">
            CRM Pro
          </h2>
          <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-1">Enterprise Edition</p>
        </div>

        {/* NAVIGATION section */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 ${collapsed ? 'hidden' : 'block'}`}>
            {t('navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* HR MANAGEMENT section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 ${collapsed ? 'hidden' : 'block'}`}>
            {t('hr_management')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hrNavigationItems.map(renderNavigationItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}