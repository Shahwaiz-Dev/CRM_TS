import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User, Bell, LogOut, Settings, HelpCircle, ClipboardList, Briefcase, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { getNotifications, updateNotification, deleteNotification, getFileUrl } from '@/lib/firebase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { setLanguage, useTranslation } from '@/store/slices/languageSlice';
import { ThemeToggle } from '../ThemeToggle';

export function DashboardHeader() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { t, language } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  // Get name and email from state
  const name = user?.name;
  const email = user?.email;
  // Use name if available, otherwise fallback to username from email
  const username = name || (email ? email.split('@')[0] : 'User');
  // Get initials for avatar
  const initials = (name || username || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds as a simple fallback for real-time
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.map((n: any) => ({
        ...n,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date()
      })));
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (notifOpen && unreadCount > 0) {
      const markAsRead = async () => {
        try {
          const unreadNotifs = notifications.filter(n => !n.read);
          const promises = unreadNotifs.map(n =>
            updateNotification(n.id, { read: true })
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
    try {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (err) {
      return '';
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <header className="h-auto min-h-16 border-b bg-background flex flex-col md:flex-row items-start md:items-center justify-between px-2 md:px-6 py-2 md:py-0 transition-colors gap-2 md:gap-0">
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
        <SidebarTrigger />
        <Input
          placeholder={t('search_placeholder')}
          className="w-full md:w-80 min-w-0"
        />
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        {/* Language Switcher */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={() => dispatch(setLanguage('en'))}
            className={`px-2 py-1 rounded text-sm font-medium border ${language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            aria-label="Switch to English"
          >
            EN
          </button>
          <button
            onClick={() => dispatch(setLanguage('el'))}
            className={`px-2 py-1 rounded text-sm font-medium border ${language === 'el' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}
            aria-label="Switch to Greek"
          >
            ΕΛ
          </button>
        </div>

        <ThemeToggle />

        {/* Bell icon with notification badge and dropdown */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <button className="relative focus:outline-none hover:bg-muted p-2 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <div className="px-4 py-2 font-semibold text-sm border-b flex items-center justify-between">
              <span>{t('notifications')}</span>
              {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
            </div>

            {error && (
              <div className="px-4 py-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="px-4 py-8 text-muted-foreground text-sm text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-muted" />
                <div>{t('no_notifications')}</div>
                <div className="text-xs mt-1">{t('notify_when')}</div>
              </div>
            )}

            {!loading && !error && notifications.map((notif, idx) => (
              <div
                key={notif.id || idx}
                className={`p-3 ${!notif.read ? 'bg-primary/5 border-l-4 border-primary' : 'bg-card'}`}
              >
                <div className="flex items-start gap-3 w-full">
                  {/* Icon by type */}
                  {notif.type === 'task' ? (
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                  ) : notif.type === 'deal' ? (
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 flex-shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground flex-shrink-0">
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
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notif.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title={t('delete_notification')}
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
            <button className="w-9 h-9 rounded-full bg-muted border flex items-center justify-center font-bold text-foreground text-base ml-2 focus:outline-none hover:bg-accent transition-colors overflow-hidden">
              {user?.photoURL ? (
                <img src={getFileUrl(user.photoURL)} alt={username} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-0">
            <div className="px-4 py-3 border-b">
              <div className="font-semibold text-sm">{name || username}</div>
              <div className="text-xs text-gray-500">{email}</div>
            </div>
            <DropdownMenuItem className="gap-2 cursor-pointer"><User className="w-4 h-4" /> {t('profile')}</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings')}><Settings className="w-4 h-4" /> {t('settings')}</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer"><HelpCircle className="w-4 h-4" /> {t('support')}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-red-600 cursor-pointer" onClick={handleLogout}><LogOut className="w-4 h-4" /> {t('logout')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}