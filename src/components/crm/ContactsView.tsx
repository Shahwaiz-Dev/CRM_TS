import React, { useState, useEffect } from 'react';
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
import { User, Search, Plus, Edit, Trash2, Phone, Mail, Building, Loader2, MapPin, Check, ChevronsUpDown, FolderPlus } from 'lucide-react';
import { addContact, getContacts, updateContact, deleteContact, getAccounts, getProjects, addProject } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { addNotification } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

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

  function handleEmailAll() {
    const emails = filteredContacts
      .flatMap(c => [c.email, c.email2].filter(Boolean))
      .join(',');

    if (emails) {
      window.location.href = `mailto:${emails}`;
    } else {
      toast({
        title: "No Emails",
        description: "No contacts have email addresses",
        variant: "destructive"
      });
    }
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
          <Button onClick={handleEmailAll} size="sm" variant="outline" className="gap-1" disabled={filteredContacts.length === 0}>
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
    </motion.div>
  );
}
