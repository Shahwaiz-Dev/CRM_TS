import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardHeader() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login', { replace: true });
  };
  return (
    <header className="h-auto min-h-16 border-b bg-white flex flex-col md:flex-row items-start md:items-center justify-between px-2 md:px-6 py-2 md:py-0 transition-colors gap-2 md:gap-0">
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
        <SidebarTrigger />
        <Input 
          placeholder="Search customers, deals, tasks..." 
          className="w-full md:w-80 min-w-0"
        />
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-end">
        <Button variant="outline" size="sm" className="w-full md:w-auto">
          <User className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">John Doe</span>
        </Button>
        <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full md:w-auto">
          Logout
        </Button>
      </div>
    </header>
  );
}
