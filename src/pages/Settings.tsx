import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { updateUser, deleteUser } from '@/lib/firebase';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, setUser, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  console.log('Settings user:', user, 'loading:', loading);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [theme, setTheme] = useState('auto');
  const [notifications, setNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');

  // Placeholder for password change
  const handleChangePassword = () => {
    setPasswordChangeMsg('Password change feature coming soon.');
  };

  // Placeholder for 2FA
  const handleSetup2FA = () => {
    alert('Two-factor authentication setup coming soon.');
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUser(user.id, { name });
      setUser({ ...user, name });
      setEditMode(false);
    } catch (e) {
      alert('Error updating profile.');
    }
    setSaving(false);
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUser(user.id);
      setUser(null);
    } catch (e) {
      alert('Error deleting account.');
    }
    setDeleting(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">{t('loading')}</div>;
  if (!user) return <div className="p-8 text-center text-gray-500">{t('no_user_found')}</div>;

  return (
    <div className="p-4 md:p-4 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('settings')}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Profile Section */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">{t('profile')}</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold border">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-gray-500 text-sm">{user.email}</div>
            </div>
          </div>
          {editMode ? (
            <div className="space-y-2 mt-4">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('name')}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={saving}>{saving ? t('saving') : t('save')}</Button>
                <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>{t('cancel')}</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setEditMode(true)} variant="outline">{t('edit_profile')}</Button>
          )}
        </section>

        {/* Security Section */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">{t('security')}</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">{t('change_password')}</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="password"
                  placeholder={t('new_password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled
                />
                <Button onClick={handleChangePassword} disabled>{t('change')}</Button>
              </div>
              {passwordChangeMsg && <div className="text-xs text-gray-500 mt-1">{passwordChangeMsg}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium">{t('two_factor_authentication')}</label>
              <Button onClick={handleSetup2FA} variant="outline" size="sm" disabled>
                {t('set_up_2fa')}
              </Button>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">{t('preferences')}</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('theme')}</label>
              <select
                className="border rounded px-2 py-1"
                value={theme}
                onChange={e => setTheme(e.target.value)}
              >
                <option value="auto">{t('auto')}</option>
                <option value="light">{t('light')}</option>
                <option value="dark">{t('dark')}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifications}
                onChange={e => setNotifications(e.target.checked)}
                id="notifications"
              />
              <label htmlFor="notifications" className="text-sm">{t('enable_notifications')}</label>
            </div>
          </div>
        </section>

        {/* Account Management Section */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">{t('account_management')}</h2>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            {t('delete_account')}
          </Button>
        </section>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('delete_account')}</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <p className="text-sm text-gray-700">
                {t('delete_account_confirm')}
              </p>
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? t('deleting') : t('yes_delete_my_account')}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                {t('cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 