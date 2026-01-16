import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, addUser, updateUser, deleteUser, getFileUrl } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/store/slices/languageSlice";

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'sales' | 'hr';
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  permissions: string[];
}

const rolePermissions = {
  admin: ['View All', 'Edit All', 'Delete', 'Admin Panel', 'User Management'],
  sales: ['View Accounts', 'Edit Accounts', 'View Pipeline', 'Edit Pipeline', 'View Tasks', 'Edit Tasks'],
  hr: ['View Employees', 'Edit Employees', 'View Payroll', 'Edit Payroll', 'View Attendance', 'Edit Attendance']
};

export function UsersView() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<User>({
    id: '', name: '', email: '', photoURL: '', role: 'sales', department: '', status: 'Active', lastLogin: '', permissions: rolePermissions['sales']
  });

  // Fetch users from Firestore on mount
  React.useEffect(() => {
    const fetchUsers = async () => {
      setDataLoading(true);
      try {
        const usersData = await getUsers() as User[];
        setUsers(usersData);
      } finally {
        setDataLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/10 text-purple-600 border-purple-200/20';
      case 'sales': return 'bg-blue-500/10 text-blue-600 border-blue-200/20';
      case 'hr': return 'bg-green-500/10 text-green-600 border-green-200/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-600 border-green-200/20';
      case 'Inactive': return 'bg-red-500/10 text-red-600 border-red-200/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Update user status in Firestore
  const updateUserStatus = async (userId: string, newStatus: 'Active' | 'Inactive') => {
    await updateUser(userId, { status: newStatus });
    setUsers(users.map(user => user.id === userId ? { ...user, status: newStatus } : user));
  };

  // Update user role in Firestore
  const updateUserRole = async (userId: string, newRole: 'admin' | 'sales' | 'hr') => {
    await updateUser(userId, { role: newRole, permissions: rolePermissions[newRole] });
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole, permissions: rolePermissions[newRole] } : user));
  };

  // Add user
  const handleAddUser = async () => {
    const userToAdd = { ...newUser, permissions: rolePermissions[newUser.role] };
    await addUser(userToAdd);
    const usersData = await getUsers() as User[];
    setUsers(usersData);
    setModalOpen(false);
    setNewUser({ id: '', name: '', email: '', photoURL: '', role: 'sales', department: '', status: 'Active', lastLogin: '', permissions: rolePermissions['sales'] });
  };
  // Edit user
  const handleEditUser = async () => {
    if (!editUser) return;
    await updateUser(editUser.id, { ...editUser, permissions: rolePermissions[editUser.role] });
    const usersData = await getUsers() as User[];
    setUsers(usersData);
    setModalOpen(false);
    setEditUser(null);
  };
  // Delete user
  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    const usersData = await getUsers() as User[];
    setUsers(usersData);
  };

  if (dataLoading) {
    return (
      <div className="p-4 md:p-4">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <TableSkeleton rows={5} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-4">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">{t('userAndRoleManagement')}</h1>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setModalMode('add'); setEditUser(null); }}>{t('addNewUser')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{modalMode === 'add' ? t('addNewUser') : t('editUser')}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <input placeholder={t('name')} value={modalMode === 'add' ? newUser.name : editUser?.name || ''} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, name: e.target.value }) : setEditUser(editUser && { ...editUser, name: e.target.value })} className="border p-1 rounded" />
                <input placeholder={t('email')} value={modalMode === 'add' ? newUser.email : editUser?.email || ''} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, email: e.target.value }) : setEditUser(editUser && { ...editUser, email: e.target.value })} className="border p-1 rounded" />
                <input placeholder={t('profile_picture_url')} value={modalMode === 'add' ? newUser.photoURL : editUser?.photoURL || ''} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, photoURL: e.target.value }) : setEditUser(editUser && { ...editUser, photoURL: e.target.value })} className="border p-1 rounded" />
                <input placeholder={t('department')} value={modalMode === 'add' ? newUser.department : editUser?.department || ''} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, department: e.target.value }) : setEditUser(editUser && { ...editUser, department: e.target.value })} className="border p-1 rounded" />
                <select value={modalMode === 'add' ? newUser.role : editUser?.role || 'sales'} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, role: e.target.value as any }) : setEditUser(editUser && { ...editUser, role: e.target.value as any })} className="border p-1 rounded">
                  <option value="admin">{t('admin')}</option>
                  <option value="sales">{t('sales')}</option>
                  <option value="hr">{t('hr')}</option>
                </select>
                <select value={modalMode === 'add' ? newUser.status : editUser?.status || 'Active'} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, status: e.target.value as any }) : setEditUser(editUser && { ...editUser, status: e.target.value as any })} className="border p-1 rounded">
                  <option value="Active">{t('active')}</option>
                  <option value="Inactive">{t('inactive')}</option>
                </select>
                <div className="flex gap-2 mt-2">
                  <Button onClick={modalMode === 'add' ? handleAddUser : handleEditUser}>{modalMode === 'add' ? t('add') : t('save')}</Button>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>{t('cancel')}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('totalUsers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('activeUsers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'Active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('salesTeam')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'sales').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('admins')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('filterUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('filterByRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allRoles')}</SelectItem>
                  <SelectItem value="admin">{t('admin')}</SelectItem>
                  <SelectItem value="sales">{t('sales')}</SelectItem>
                  <SelectItem value="hr">{t('hr')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatus')}</SelectItem>
                  <SelectItem value="Active">{t('active')}</SelectItem>
                  <SelectItem value="Inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('users')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('department')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('lastLogin')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.photoURL ? (
                          <img src={getFileUrl(user.photoURL)} alt={user.name} className="w-8 h-8 rounded-full object-cover border" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold border text-muted-foreground">
                            {user.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>{t(user.role)}</Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{t(user.status ? user.status.toLowerCase() : 'active')}</Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditUser(user);
                              setModalMode('edit');
                              setModalOpen(true);
                            }}
                          >
                            {t('edit')}
                          </Button>
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => updateUserRole(user.id, newRole as any)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">{t('admin')}</SelectItem>
                              <SelectItem value="sales">{t('sales')}</SelectItem>
                              <SelectItem value="hr">{t('hr')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={user.status}
                            onValueChange={(newStatus) => updateUserStatus(user.id, newStatus as any)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">{t('active')}</SelectItem>
                              <SelectItem value="Inactive">{t('inactive')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            {t('delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
