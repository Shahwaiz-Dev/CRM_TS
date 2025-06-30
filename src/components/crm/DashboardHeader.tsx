import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login', { replace: true });
  };
  return (
    <header className="h-16 border-b bg-white dark:bg-zinc-900 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Input 
          placeholder="Search customers, deals, tasks..." 
          className="w-80"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          John Doe
        </Button>
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
