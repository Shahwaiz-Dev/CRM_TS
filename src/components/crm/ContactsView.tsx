import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Search, Plus, Edit, Trash2, Phone, Mail, Building, Loader2, MapPin, Check, ChevronsUpDown, FolderPlus, MessageSquare, X } from 'lucide-react';
import { addContact, getContacts, updateContact, deleteContact, getAccounts, getProjects, addProject } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { addNotification } from '@/lib/firebase';
import { sendSms } from '@/lib/spryng';
import { sendEmail } from '@/lib/sendgrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { Checkbox } from '@/components/ui/checkbox';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  email2?: string;
  phone: string;
  phone2?: string;
  title: string;
  accountId: string;
  accountName: string;
  projectId?: string;
  projectName?: string;
  address?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Account {
  id: string;
  accountName: string;
}

interface Project {
  id: string;
  name: string;
}

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  email2: '',
  phone: '',
  phone2: '',
  title: '',
  accountId: '',
  accountName: '',
  projectId: '',
  projectName: '',
  address: '',
  language: ''
};

export function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [projectForm, setProjectForm] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterAccount, setFilterAccount] = useState('all');
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10;
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsForm, setSmsForm] = useState({ subject: '', body: '' });
  const [sendingSms, setSendingSms] = useState(false);

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
  const [emailRecipients, setEmailRecipients] = useState<Contact[]>([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setDataLoading(true);
    try {
      const [contactsData, accountsData, projectsData] = await Promise.all([
        getContacts(),
        getAccounts(),
        getProjects()
      ]);
      setContacts(contactsData as Contact[]);
      setAccounts(accountsData as Account[]);
      setProjects(projectsData as Project[]);
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
      email2: contact.email2 || '',
      phone: contact.phone || '',
      phone2: contact.phone2 || '',
      title: contact.title || '',
      accountId: contact.accountId || '',
      accountName: contact.accountName || '',
      projectId: contact.projectId || '',
      projectName: contact.projectName || '',
      address: contact.address || '',
      language: contact.language || ''
    });
    setEditId(contact.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
    setEditId(null);
    setAccountSearch('');
  }

  async function handleCreateProject() {
    if (!projectForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    setProjectSubmitting(true);
    try {
      const projectRef = await addProject({ name: projectForm.name });
      const newProject = { id: projectRef.id, name: projectForm.name };
      setProjects([...projects, newProject]);
      setForm(f => ({ ...f, projectId: projectRef.id, projectName: projectForm.name }));
      setProjectForm({ name: '' });
      setProjectModalOpen(false);
      toast({
        title: "Success",
        description: "Project created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
    setProjectSubmitting(false);
  }

  async function handleSubmit(e: FormEvent) {
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
      contact.email2?.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone2?.toLowerCase().includes(search.toLowerCase()) ||
      contact.title?.toLowerCase().includes(search.toLowerCase()) ||
      contact.accountName?.toLowerCase().includes(search.toLowerCase()) ||
      contact.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      contact.address?.toLowerCase().includes(search.toLowerCase());

    const matchesAccount = filterAccount === 'all' || contact.accountId === filterAccount;

    return matchesSearch && matchesAccount;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterAccount]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  function openEmailModal() {
    const contactsWithEmail = filteredContacts.filter(c => c.email || c.email2);

    if (contactsWithEmail.length === 0) {
      toast({
        title: "No Contacts",
        description: "No contacts available to email",
        variant: "destructive"
      });
      return;
    }
    setEmailRecipients(contactsWithEmail);
    setEmailForm({ subject: '', body: '' });
    setEmailSearch('');
    setEmailModalOpen(true);
  }

  function closeEmailModal() {
    setEmailModalOpen(false);
    setEmailForm({ subject: '', body: '' });
    setEmailRecipients([]);
    setEmailSearch('');
  }

  function removeEmailRecipient(contactId: string) {
    setEmailRecipients(prev => prev.filter(c => c.id !== contactId));
  }

  async function handleSendEmail() {
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and message body are required",
        variant: "destructive"
      });
      return;
    }

    if (emailRecipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one recipient",
        variant: "destructive"
      });
      return;
    }

    setSendingEmail(true);
    try {
      const emails = emailRecipients
        .flatMap(c => [c.email, c.email2].filter(Boolean)) as string[];

      // Unique emails
      const uniqueEmails = [...new Set(emails)];

      const result = await sendEmail({
        to: uniqueEmails,
        subject: emailForm.subject,
        text: emailForm.body,
        // html: emailForm.body.replace(/\n/g, '<br>') 
      });

      if (result.success) {
        toast({
          title: "Email Sent",
          description: `Email sent to ${uniqueEmails.length} recipients`
        });
        closeEmailModal();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive"
      });
    }
    setSendingEmail(false);
  }

  function toggleSelectContact(contactId: string) {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  }

  function toggleSelectAll() {
    const allPageContactsSelected = paginatedContacts.every(c => selectedContacts.has(c.id));
    if (allPageContactsSelected) {
      // Deselect all contacts on current page
      setSelectedContacts(prev => {
        const newSet = new Set(prev);
        paginatedContacts.forEach(c => newSet.delete(c.id));
        return newSet;
      });
    } else {
      // Select all contacts on current page
      setSelectedContacts(prev => {
        const newSet = new Set(prev);
        paginatedContacts.forEach(c => newSet.add(c.id));
        return newSet;
      });
    }
  }

  function openSmsModal() {
    if (selectedContacts.size === 0) {
      toast({
        title: "No Contacts Selected",
        description: "Please select at least one contact to send SMS",
        variant: "destructive"
      });
      return;
    }
    setSmsForm({ subject: '', body: '' });
    setSmsModalOpen(true);
  }

  function closeSmsModal() {
    setSmsModalOpen(false);
    setSmsForm({ subject: '', body: '' });
  }

  async function handleSendSms() {
    if (!smsForm.subject.trim() || !smsForm.body.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and message body are required",
        variant: "destructive"
      });
      return;
    }

    const selectedContactsData = contacts.filter(c => selectedContacts.has(c.id));
    const contactsWithPhone = selectedContactsData.filter(c => c.phone || c.phone2);

    if (contactsWithPhone.length === 0) {
      toast({
        title: "No Phone Numbers",
        description: "Selected contacts don't have phone numbers",
        variant: "destructive"
      });
      return;
    }

    setSendingSms(true);
    try {
      const phoneNumbers = contactsWithPhone
        .flatMap(c => [c.phone, c.phone2].filter(Boolean)) as string[];

      // Call Spryng SMS API
      const result = await sendSms({
        recipients: phoneNumbers,
        body: smsForm.body,
        originator: 'CRM' // Could be customizable in the future
      });

      if (result.success) {
        toast({
          title: "SMS Sent",
          description: `SMS sent to ${phoneNumbers.length} recipients`
        });
        closeSmsModal();
        setSelectedContacts(new Set());
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send SMS",
        variant: "destructive"
      });
    }
    setSendingSms(false);
  }

  if (dataLoading) {
    return (
      <motion.div
        className="p-4 md:p-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2 items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <TableSkeleton rows={5} columns={7} showAvatar={true} />
      </motion.div>
    );
  }

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
          <Button
            onClick={openSmsModal}
            size="sm"
            variant="outline"
            className="gap-1"
            disabled={selectedContacts.size === 0}
          >
            <MessageSquare className="w-4 h-4" /> Send SMS ({selectedContacts.size})
          </Button>
          <Button onClick={openEmailModal} size="sm" variant="outline" className="gap-1" disabled={filteredContacts.length === 0}>
            <Mail className="w-4 h-4" /> Email All
          </Button>
          <Button onClick={openAdd} size="sm" className="gap-1"><Plus className="w-4 h-4" /> {t('add_contact')}</Button>
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
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
        <>
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={paginatedContacts.length > 0 && paginatedContacts.every(c => selectedContacts.has(c.id))}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('title')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('phone')}</TableHead>
                  <TableHead>{t('account')}</TableHead>
                  <TableHead>{t('project')}</TableHead>
                  <TableHead>{t('language') || 'Language'}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContacts.has(contact.id)}
                        onCheckedChange={() => toggleSelectContact(contact.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {getInitials(contact.firstName, contact.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </TableCell>
                    <TableCell>{contact.title || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.email2 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{contact.email2}</span>
                          </div>
                        )}
                        {!contact.email && !contact.email2 && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.phone2 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{contact.phone2}</span>
                          </div>
                        )}
                        {!contact.phone && !contact.phone2 && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.accountName ? (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          <span>{contact.accountName}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.projectName ? (
                        <div className="flex items-center gap-1">
                          <FolderPlus className="w-3 h-3 text-gray-400" />
                          <span>{contact.projectName}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.language || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {t('showing')} {startIndex + 1} - {Math.min(endIndex, filteredContacts.length)} {t('of')} {filteredContacts.length} {t('contacts')}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  {t('previous')}
                </Button>
                <span className="text-sm text-gray-500">
                  {t('page')} {currentPage} {t('of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder={t('email')}
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              <Input
                placeholder={t('second_email')}
                type="email"
                value={form.email2}
                onChange={e => setForm(f => ({ ...f, email2: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder={t('phone')}
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
              <Input
                placeholder={t('second_phone')}
                value={form.phone2}
                onChange={e => setForm(f => ({ ...f, phone2: e.target.value }))}
              />
            </div>
            <Input
              placeholder={t('title')}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <Select
              value={form.language}
              onValueChange={val => setForm(f => ({ ...f, language: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('language') || 'Language'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Dutch">Dutch</SelectItem>
                <SelectItem value="Greek">Greek</SelectItem>
              </SelectContent>
            </Select>
            <AddressAutocomplete
              placeholder={t('full_address')}
              value={form.address}
              onChange={val => setForm(f => ({ ...f, address: val }))}
            />

            {/* Searchable Account Selector */}
            <Popover open={accountOpen} onOpenChange={setAccountOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={accountOpen}
                  className="w-full justify-between"
                >
                  {form.accountName || t('select_account')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t('search_accounts')}
                    value={accountSearch}
                    onValueChange={setAccountSearch}
                  />
                  <CommandList>
                    <CommandEmpty>{t('no_accounts_found')}</CommandEmpty>
                    <CommandGroup>
                      {accounts
                        .filter(account =>
                          account.accountName.toLowerCase().includes(accountSearch.toLowerCase())
                        )
                        .map((account) => (
                          <CommandItem
                            key={account.id}
                            value={account.id}
                            onSelect={() => {
                              setForm(f => ({
                                ...f,
                                accountId: account.id,
                                accountName: account.accountName
                              }));
                              setAccountOpen(false);
                              setAccountSearch('');
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.accountId === account.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {account.accountName}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Project Selector with Create Option */}
            <div className="flex gap-2">
              <Select
                value={form.projectId}
                onValueChange={(value) => {
                  const project = projects.find(p => p.id === value);
                  setForm(f => ({
                    ...f,
                    projectId: value,
                    projectName: project?.name || ''
                  }));
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('select_project')} />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProjectModalOpen(true)}
                className="gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                {t('new_project')}
              </Button>
            </div>

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

      {/* Create Project Modal */}
      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('create_new_project')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t('project_name')}
              value={projectForm.name}
              onChange={e => setProjectForm({ name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateProject();
                }
              }}
            />
            <DialogFooter>
              <Button
                onClick={handleCreateProject}
                disabled={projectSubmitting}
              >
                {projectSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  t('create_project')
                )}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </div>
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

      {/* Send SMS Dialog */}
      <Dialog open={smsModalOpen} onOpenChange={setSmsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send SMS to {selectedContacts.size} Contact(s)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Selected Contacts:</label>
              <div className="max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-md">
                <div className="flex flex-wrap gap-2">
                  {contacts
                    .filter(c => selectedContacts.has(c.id))
                    .map(contact => (
                      <Badge key={contact.id} variant="secondary" className="gap-1">
                        {contact.firstName} {contact.lastName}
                        {(contact.phone || contact.phone2) && (
                          <Phone className="w-3 h-3" />
                        )}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject:</label>
              <Input
                placeholder="SMS Subject"
                value={smsForm.subject}
                onChange={e => setSmsForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message:</label>
              <Textarea
                placeholder="Enter your message here..."
                value={smsForm.body}
                onChange={e => setSmsForm(f => ({ ...f, body: e.target.value }))}
                rows={6}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleSendSms}
                disabled={sendingSms || !smsForm.subject.trim() || !smsForm.body.trim()}
              >
                {sendingSms ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send SMS
                  </>
                )}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeSmsModal}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to {emailRecipients.length} Contact(s)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
              <p>You are about to send an email to {emailRecipients.length} recipients.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Recipients:</label>
                <div className="relative w-1/2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipients..."
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-md">
                <div className="flex flex-wrap gap-2">
                  {emailRecipients
                    .filter(c =>
                      c.firstName.toLowerCase().includes(emailSearch.toLowerCase()) ||
                      c.lastName.toLowerCase().includes(emailSearch.toLowerCase()) ||
                      (c.email && c.email.toLowerCase().includes(emailSearch.toLowerCase()))
                    )
                    .map(contact => (
                      <Badge key={contact.id} variant="secondary" className="gap-1 pr-1">
                        {contact.firstName} {contact.lastName}
                        <button
                          onClick={() => removeEmailRecipient(contact.id)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  {emailRecipients.length === 0 && (
                    <span className="text-sm text-gray-400 italic">No recipients selected</span>
                  )}
                  {emailRecipients.length > 0 && emailRecipients.filter(c => c.firstName.toLowerCase().includes(emailSearch.toLowerCase()) || c.lastName.toLowerCase().includes(emailSearch.toLowerCase()) || (c.email && c.email.toLowerCase().includes(emailSearch.toLowerCase()))).length === 0 && (
                    <span className="text-sm text-gray-400 italic">No recipients match your search</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject:</label>
              <Input
                placeholder="Email Subject"
                value={emailForm.subject}
                onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message:</label>
              <Textarea
                placeholder="Type your email message here..."
                value={emailForm.body}
                onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))}
                rows={10}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailForm.subject.trim() || !emailForm.body.trim()}
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeEmailModal}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
