import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User, Bell, LogOut, Settings, HelpCircle, ClipboardList, Briefcase, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { collection, getDocs, updateDoc, doc, onSnapshot, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleLogout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    navigate('/login', { replace: true });
  };
  
  // Get name and email from context (fallback to localStorage for legacy support)
  const name = user?.name || localStorage.getItem('name');
  const email = user?.email || localStorage.getItem('email');
  // Use name if available, otherwise fallback to username from email
  const username = name || (email ? email.split('@')[0] : 'User');
  // Get initials for avatar
  const initials = (name || username || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  
  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Set up Firestore onSnapshot listener directly here
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc'), 
      limit(50)
    );
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          title: doc.data().title || 'New Notification',
          body: doc.data().body || '',
          type: doc.data().type || 'general',
          read: doc.data().read || false,
          createdAt: doc.data().createdAt || new Date()
        }));
        setNotifications(notifs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (notifOpen && unreadCount > 0) {
      const markAsRead = async () => {
        try {
          const unreadNotifs = notifications.filter(n => !n.read);
          const promises = unreadNotifs.map(n => 
            updateDoc(doc(db, 'notifications', n.id), { read: true })
          );
          await Promise.all(promises);
          
          // Update local state
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
          console.error('Error marking notifications as read:', err);
        }
      };
      
      markAsRead();
    }
  }, [notifOpen, unreadCount]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    try {
      let date;
      if (timestamp?.toDate) {
        // Firestore timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return '';
      }
      
      return date.toLocaleString();
    } catch (err) {
      return '';
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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
      
      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        {/* Bell icon with notification badge and dropdown */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative focus:outline-none hover:bg-gray-100 p-2 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <div className="px-4 py-2 font-semibold text-sm border-b flex items-center justify-between">
              <span>Notifications</span>
              {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
            </div>
            
            {error && (
              <div className="px-4 py-4 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {!loading && !error && notifications.length === 0 && (
              <div className="px-4 py-8 text-gray-500 text-sm text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <div>No notifications yet</div>
                <div className="text-xs mt-1">We'll notify you when something happens</div>
              </div>
            )}
            
            {!loading && !error && notifications.map((notif, idx) => (
              <div 
                key={notif.id || idx} 
                className={`p-3 ${!notif.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-white'}`}
              >
                <div className="flex items-start gap-3 w-full">
                  {/* Icon by type */}
                  {notif.type === 'task' ? (
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                  ) : notif.type === 'deal' ? (
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 flex-shrink-0">
                      <Bell className="w-4 h-4" />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-tight">{notif.title}</div>
                    {notif.body && <div className="text-xs text-gray-600 mt-1 leading-tight">{notif.body}</div>}
                    <div className="text-xs text-gray-400 mt-2">{formatTime(notif.createdAt || notif.time)}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notif.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User avatar and dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-gray-700 text-base ml-2 focus:outline-none hover:bg-gray-200 transition-colors">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-0">
            <div className="px-4 py-3 border-b">
              <div className="font-semibold text-sm">{name || username}</div>
              <div className="text-xs text-gray-500">{email}</div>
            </div>
            <DropdownMenuItem className="gap-2 cursor-pointer"><User className="w-4 h-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings')}><Settings className="w-4 h-4" /> Settings</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer"><HelpCircle className="w-4 h-4" /> Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-red-600 cursor-pointer" onClick={handleLogout}><LogOut className="w-4 h-4" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}