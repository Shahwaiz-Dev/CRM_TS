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
import { motion } from 'framer-motion';
import { addNotification } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();

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
      setContacts(contactsData as Contact[]);
      setAccounts(accountsData as Account[]);
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
        
        // Create notification for new contact
        await addNotification({
          title: 'New Contact Added',
          body: `${form.firstName} ${form.lastName} has been added as a new contact`,
          type: 'general'
        });
        
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

  // Remove the early return for loading state

  return (
    <motion.div
      className="p-4 md:p-4"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('all_contacts')}</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder={t('search_contacts')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('filter_by_account')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_accounts')}</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} size="sm" className="gap-1"><Plus className="w-4 h-4" /> {t('add_contact')}</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('no_contacts_found')}</h3>
            <p className="text-gray-500 mb-4">
              {search || filterAccount !== 'all' 
                ? t('try_adjusting_search_or_filters')
                : t('create_first_contact_to_get_started')
              }
            </p>
            {!search && filterAccount === 'all' && (
              <Button onClick={openAdd}>{t('create_first_contact')}</Button>
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
            <DialogTitle>{editId ? t('edit_contact') : t('add_new_contact')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder={t('first_name')}
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                required
              />
              <Input
                placeholder={t('last_name')}
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
            <Input
              placeholder={t('email')}
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              placeholder={t('phone')}
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
            <Input
              placeholder={t('title')}
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
                <SelectValue placeholder={t('select_account')} />
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
                    {editId ? t('updating') : t('creating')}
                  </>
                ) : (
                  editId ? t('update_contact') : t('create_contact')
                )}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_contact')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{t('are_you_sure_delete_contact')}</p>
            <DialogFooter>
              <Button 
                variant="destructive" 
                onClick={() => deleteId && handleDelete(deleteId)}
              >
                {t('delete')}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 