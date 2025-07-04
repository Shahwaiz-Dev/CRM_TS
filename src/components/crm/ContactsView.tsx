import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Search, Plus, Edit, Trash2, Phone, Mail, Building, Loader2 } from 'lucide-react';
import { addContact, getContacts, updateContact, deleteContact, getAccounts } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  accountId: string;
  accountName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Account {
  id: string;
  accountName: string;
}

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  accountId: '',
  accountName: ''
};

export function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterAccount, setFilterAccount] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setDataLoading(true);
    try {
      const [contactsData, accountsData] = await Promise.all([
        getContacts(),
        getAccounts()
      ]);
      setContacts(contactsData);
      setAccounts(accountsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      });
    }
    setDataLoading(false);
  }

  function openAdd() {
    setForm(initialForm);
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(contact: Contact) {
    setForm({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      title: contact.title || '',
      accountId: contact.accountId || '',
      accountName: contact.accountName || ''
    });
    setEditId(contact.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await updateContact(editId, form);
        toast({
          title: "Success",
          description: "Contact updated successfully"
        });
      } else {
        await addContact(form);
        toast({
          title: "Success", 
          description: "Contact created successfully"
        });
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: editId ? "Failed to update contact" : "Failed to create contact",
        variant: "destructive"
      });
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteContact(id);
      toast({
        title: "Success",
        description: "Contact deleted successfully"
      });
      setDeleteId(null);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive"
      });
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      contact.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      contact.email?.toLowerCase().includes(search.toLowerCase()) ||
      contact.title?.toLowerCase().includes(search.toLowerCase()) ||
      contact.accountName?.toLowerCase().includes(search.toLowerCase());
    
    const matchesAccount = filterAccount === 'all' || contact.accountId === filterAccount;
    
    return matchesSearch && matchesAccount;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (dataLoading) {
    return (
      <div className="p-6 md:p-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">All Contacts</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
            icon={<Search className="w-4 h-4" />}
          />
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            New Contact
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500 mb-4">
              {search || filterAccount !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first contact to get started'
              }
            </p>
            {!search && filterAccount === 'all' && (
              <Button onClick={openAdd}>Create First Contact</Button>
            )}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(contact.firstName, contact.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{contact.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(contact.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.phone}</span>
                    </div>
                  )}
                  {contact.accountName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{contact.accountName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                required
              />
              <Input
                placeholder="Last Name"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
            <Input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <Select 
              value={form.accountId} 
              onValueChange={(value) => {
                const account = accounts.find(a => a.id === value);
                setForm(f => ({ 
                  ...f, 
                  accountId: value,
                  accountName: account?.accountName || ''
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editId ? 'Update Contact' : 'Create Contact'
                )}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this contact? This action cannot be undone.</p>
            <DialogFooter>
              <Button 
                variant="destructive" 
                onClick={() => deleteId && handleDelete(deleteId)}
              >
                Delete
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 