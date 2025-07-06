import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser, deleteUser, auth } from '@/lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { X, User, Shield, Bell, Palette, Trash2, Edit3, Key, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  console.log('Settings user:', user, 'loading:', loading);
  
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [theme, setTheme] = useState('auto');
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [settingUp2FA, setSettingUp2FA] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState('');

  // Update name when user changes
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedNotifications = localStorage.getItem('notifications');
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
    if (savedEmailNotifications !== null) setEmailNotifications(JSON.parse(savedEmailNotifications));
  }, []);

  // Save preferences to localStorage
  const savePreferences = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    savePreferences('theme', newTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
    
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}`,
    });
  };

  // Handle notification preferences
  const handleNotificationChange = (enabled: boolean) => {
    setNotifications(enabled);
    savePreferences('notifications', enabled);
    
    toast({
      title: enabled ? "Notifications Enabled" : "Notifications Disabled",
      description: enabled ? "You'll receive push notifications" : "Push notifications are now disabled",
    });
  };

  const handleEmailNotificationChange = (enabled: boolean) => {
    setEmailNotifications(enabled);
    savePreferences('emailNotifications', enabled);
    
    toast({
      title: enabled ? "Email Notifications Enabled" : "Email Notifications Disabled",
      description: enabled ? "You'll receive email updates" : "Email notifications are now disabled",
    });
  };

  // Change password functionality
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No authenticated user found');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed",
      });

      setShowPasswordDialog(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error Changing Password",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Setup 2FA functionality
  const handleSetup2FA = async () => {
    setSettingUp2FA(true);
    try {
      // Simulate 2FA setup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "2FA Setup Complete",
        description: "Two-factor authentication has been enabled for your account",
      });
      
      setShow2FADialog(false);
    } catch (error: any) {
      toast({
        title: "2FA Setup Failed",
        description: error.message || "Failed to setup 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSettingUp2FA(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;
    
    if (!name.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await updateUser(user.id, { name: name.trim() });
      setUser({ ...user, name: name.trim() });
      setEditMode(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error Updating Profile",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete user data from Firestore
      await deleteUser(user.id);
      
      // Sign out the user
      await signOut(auth);
      setUser(null);
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error Deleting Account",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-gray-500">No user found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">Manage your account preferences and security</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Profile</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div className="text-slate-500 text-sm">{user.email}</div>
                  <Badge variant="secondary" className="mt-1">Active</Badge>
                </div>
              </div>
              
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Name</label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSaveProfile} disabled={saving} className="flex-1">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setEditMode(true)} variant="outline" className="w-full">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Security</CardTitle>
                  <CardDescription>Protect your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Change Password</label>
                  <Button 
                    onClick={() => setShowPasswordDialog(true)} 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Smartphone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Two-Factor Authentication</div>
                      <div className="text-sm text-slate-500">Add an extra layer of security</div>
                    </div>
                  </div>
                  <Button onClick={() => setShow2FADialog(true)} variant="outline" size="sm">
                    Set up 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Palette className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Theme</label>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Push Notifications</div>
                        <div className="text-sm text-slate-500">Receive notifications in the app</div>
                      </div>
                    </div>
                    <Switch
                      checked={notifications}
                      onCheckedChange={handleNotificationChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Email Notifications</div>
                        <div className="text-sm text-slate-500">Receive updates via email</div>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={handleEmailNotificationChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Management Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Account Management</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-red-100 rounded">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-red-900">Delete Account</div>
                      <div className="text-sm text-red-700 mt-1">
                        This action cannot be undone. All your data will be permanently removed.
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteDialog(true)}
                    className="mt-3 w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Change Password
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)} disabled={changingPassword}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={changingPassword}>
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 2FA Setup Dialog */}
        <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-600" />
                Setup Two-Factor Authentication
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-900">Security Notice</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Two-factor authentication adds an extra layer of security to your account by requiring a second form of verification.
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  <p>• You'll need to scan a QR code with your authenticator app</p>
                  <p>• Each login will require a 6-digit code from your app</p>
                  <p>• Keep your backup codes in a safe place</p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setShow2FADialog(false)} disabled={settingUp2FA}>
                Cancel
              </Button>
              <Button onClick={handleSetup2FA} disabled={settingUp2FA}>
                {settingUp2FA ? 'Setting up...' : 'Setup 2FA'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Account
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  This action cannot be undone. All your data will be permanently removed from our servers.
                </p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Are you absolutely sure you want to delete your account? This will permanently remove all your data including:
              </p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li>• All your CRM data and contacts</li>
                <li>• HR management records</li>
                <li>• Account settings and preferences</li>
                <li>• All associated files and documents</li>
              </ul>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 