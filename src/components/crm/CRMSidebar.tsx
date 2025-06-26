import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Users, User, List, Calendar, Trophy } from 'lucide-react';
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
    <Sidebar className="border-r" collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <div className="p-4">
          <h2 className={`font-bold text-2xl text-white transition-opacity duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            CRM Pro
          </h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-white text-lg font-semibold">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon className="h-7 w-7 flex-shrink-0 text-white" />
                      <span className={`text-white text-lg font-semibold transition-opacity duration-200 ${collapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
