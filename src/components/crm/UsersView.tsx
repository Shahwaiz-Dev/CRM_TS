import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface User {
  id: string;
  name: string;
  email: string;
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
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<User>({
    id: '', name: '', email: '', role: 'sales', department: '', status: 'Active', lastLogin: '', permissions: rolePermissions['sales']
  });

  // Fetch users from Firestore on mount
  React.useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await getUsers() as User[];
      setUsers(usersData);
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
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'hr': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    setNewUser({ id: '', name: '', email: '', role: 'sales', department: '', status: 'Active', lastLogin: '', permissions: rolePermissions['sales'] });
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

  return (
    <div className="p-4 md:p-4">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">User & Role Management</h1>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setModalMode('add'); setEditUser(null); }}>Add New User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <input placeholder="Name" value={modalMode === 'add' ? newUser.name : editUser?.name || ''} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, name: e.target.value }) : setEditUser(editUser && { ...editUser, name: e.target.value })} className="border p-1 rounded" />
                <input placeholder="Email" value={modalMode === 'add' ? newUser.email : editUser?.email || ''} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, email: e.target.value }) : setEditUser(editUser && { ...editUser, email: e.target.value })} className="border p-1 rounded" />
                <input placeholder="Department" value={modalMode === 'add' ? newUser.department : editUser?.department || ''} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, department: e.target.value }) : setEditUser(editUser && { ...editUser, department: e.target.value })} className="border p-1 rounded" />
                <select value={modalMode === 'add' ? newUser.role : editUser?.role || 'sales'} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, role: e.target.value as any }) : setEditUser(editUser && { ...editUser, role: e.target.value as any })} className="border p-1 rounded">
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="hr">HR</option>
                </select>
                <select value={modalMode === 'add' ? newUser.status : editUser?.status || 'Active'} onChange={e => modalMode === 'add' ? setNewUser({ ...newUser, status: e.target.value as any }) : setEditUser(editUser && { ...editUser, status: e.target.value as any })} className="border p-1 rounded">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <div className="flex gap-2 mt-2">
                  <Button onClick={modalMode === 'add' ? handleAddUser : handleEditUser}>{modalMode === 'add' ? 'Add' : 'Save'}</Button>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'Active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sales Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'sales').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
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
            <CardTitle>Filter Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
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
                            Edit
                          </Button>
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => updateUserRole(user.id, newRole as any)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
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
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
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
