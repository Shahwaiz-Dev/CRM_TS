import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';
import { updateUser, deleteUser, uploadProfilePicture, getFileUrl } from '@/lib/firebase';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, logout } from "@/store/slices/authSlice";
import { setLanguage, useTranslation } from "@/store/slices/languageSlice";
import { setTheme as setGlobalTheme } from "@/store/slices/uiSlice";

export default function Settings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [email] = useState(user?.email || '');
  const theme = useAppSelector((state) => state.ui.theme);
  const [notifications, setNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      await updateUser(user.id, { name, photoURL });
      dispatch(setCredentials({ ...user, name, photoURL }));
      setEditMode(false);
    } catch (e) {
      alert('Error updating profile.');
    }
    setSaving(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const url = await uploadProfilePicture(user.id, file);
      setPhotoURL(url);
      // Auto-save if not in explicit edit mode, or just update the state
      if (!editMode) {
        await updateUser(user.id, { photoURL: url });
        dispatch(setCredentials({ ...user, photoURL: url }));
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUser(user.id);
      dispatch(logout());
    } catch (e) {
      alert('Error deleting account.');
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-4 flex justify-center">
        <div className="w-full max-w-2xl space-y-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded" />
          </div>
          <section className="bg-card rounded-lg shadow border p-6 space-y-4 transition-colors">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </section>
          <section className="bg-card rounded-lg shadow border p-6 space-y-4 transition-colors">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </section>
          <section className="bg-card rounded-lg shadow border p-6 space-y-4 transition-colors">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-48" />
            </div>
          </section>
          <section className="bg-card rounded-lg shadow border p-6 space-y-4 transition-colors">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-10 w-40" />
          </section>
        </div>
      </div>
    );
  }
  if (!user) return <div className="p-8 text-center text-muted-foreground">{t('no_user_found')}</div>;

  return (
    <div className="p-4 md:p-4 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground transition-colors">{t('settings')}</h1>
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
        <section className="bg-card rounded-lg shadow border p-6 space-y-4 transition-colors">
          <h2 className="text-lg font-semibold mb-2 text-foreground">{t('profile')}</h2>
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img src={getFileUrl(user.photoURL)} alt={user.name} className="w-16 h-16 rounded-full object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold border text-muted-foreground">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <div className="font-medium text-foreground transition-colors">{user.name}</div>
              <div className="text-muted-foreground text-sm transition-colors">{user.email}</div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? t('uploading') : t('upload_from_device')}
              </Button>
            </div>
          </div>
          {editMode ? (
            <div className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">{t('name')}</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('name')}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">{t('profile_picture_url')}</label>
                <Input
                  value={photoURL}
                  onChange={e => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveProfile} disabled={saving}>{saving ? t('saving') : t('save')}</Button>
                <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>{t('cancel')}</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setEditMode(true)} variant="outline">{t('edit_profile')}</Button>
          )}
        </section>

        {/* Security Section */}
        <section className="bg-card rounded-lg shadow border p-6 space-y-4 transition-colors">
          <h2 className="text-lg font-semibold mb-2 text-foreground">{t('security')}</h2>
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
              {passwordChangeMsg && <div className="text-xs text-muted-foreground mt-1 transition-colors">{passwordChangeMsg}</div>}
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
        <section className="bg-card rounded-lg shadow border p-6 space-y-4 transition-colors">
          <h2 className="text-lg font-semibold mb-2 text-foreground">{t('preferences')}</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('theme')}</label>
              <select
                className="border rounded px-2 py-1 bg-background text-foreground"
                value={theme}
                onChange={e => dispatch(setGlobalTheme(e.target.value as 'light' | 'dark' | 'system'))}
              >
                <option value="system">{t('auto')}</option>
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
        <section className="bg-card rounded-lg shadow border p-6 space-y-4 border-destructive/20 transition-colors">
          <h2 className="text-lg font-semibold mb-2 text-foreground">{t('account_management')}</h2>
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
              <p className="text-sm text-muted-foreground">
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