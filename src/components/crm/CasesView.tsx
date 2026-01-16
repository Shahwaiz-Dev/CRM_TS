import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Edit, Trash2, AlertCircle, Clock, CheckCircle, XCircle, Loader2, Building } from 'lucide-react';
import { addCase, getCases, updateCase, deleteCase, getAccounts } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { addNotification } from '@/lib/firebase';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/store/slices/languageSlice";
import { fetchCases, createNewCase, modifyCase, removeCase } from "@/store/slices/casesSlice";

interface Case {
  id: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'Working' | 'Escalated' | 'Closed';
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
  subject: '',
  description: '',
  priority: 'Medium' as const,
  status: 'New' as const,
  accountId: '',
  accountName: ''
};

const priorityColors = {
  Low: 'bg-green-500/10 text-green-600 border-green-200/20',
  Medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-200/20',
  High: 'bg-orange-500/10 text-orange-600 border-orange-200/20',
  Critical: 'bg-red-500/10 text-red-600 border-red-200/20'
};

const statusColors = {
  New: 'bg-blue-500/10 text-blue-600 border-blue-200/20',
  Working: 'bg-yellow-500/10 text-yellow-600 border-yellow-200/20',
  Escalated: 'bg-orange-500/10 text-orange-600 border-orange-200/20',
  Closed: 'bg-muted text-muted-foreground'
};

const statusIcons = {
  New: Clock,
  Working: AlertCircle,
  Escalated: AlertCircle,
  Closed: CheckCircle
};

export function CasesView() {
  const dispatch = useAppDispatch();
  const cases = useAppSelector((state) => state.cases.cases);
  const dataLoading = useAppSelector((state) => state.cases.loading);
  const slicesError = useAppSelector((state) => state.cases.error);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchCases());
    // Fetch accounts separately as they are not managed by casesSlice
    const fetchAccountsData = async () => {
      try {
        const accountsData = await getAccounts();
        setAccounts(accountsData as Account[]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load accounts",
          variant: "destructive"
        });
      }
    };
    fetchAccountsData();
  }, [dispatch]);

  function openAdd() {
    setForm(initialForm);
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(caseItem: Case) {
    setForm({
      subject: caseItem.subject || '',
      description: caseItem.description || '',
      priority: (caseItem.priority as any) || 'Medium',
      status: (caseItem.status as any) || 'New',
      accountId: caseItem.accountId || '',
      accountName: caseItem.accountName || ''
    });
    setEditId(caseItem.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject || !form.description) {
      toast({
        title: "Validation Error",
        description: "Subject and description are required",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await dispatch(modifyCase({ id: editId, data: form })).unwrap();
        toast({
          title: t('success'),
          description: t('case_updated_successfully')
        });
      } else {
        await dispatch(createNewCase(form)).unwrap();
        // Create notification for new case (if still needed, consider moving to thunk)
        await addNotification({
          title: 'New Case Created',
          body: `A new case "${form.subject}" has been created`,
          type: 'task'
        });
        toast({
          title: t('success'),
          description: t('case_created_successfully')
        });
      }
      closeModal();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || (editId ? t('failed_to_update_case') : t('failed_to_create_case')),
        variant: "destructive"
      });
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    try {
      await dispatch(removeCase(id)).unwrap();
      toast({
        title: t('success'),
        description: t('case_deleted_successfully')
      });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failed_to_delete_case'),
        variant: "destructive"
      });
    }
  }

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch =
      caseItem.subject?.toLowerCase().includes(search.toLowerCase()) ||
      caseItem.description?.toLowerCase().includes(search.toLowerCase()) ||
      caseItem.accountName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || caseItem.priority === filterPriority;
    const matchesAccount = filterAccount === 'all' || caseItem.accountId === filterAccount;

    return matchesSearch && matchesStatus && matchesPriority && matchesAccount;
  });

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;
    return <Icon className="w-4 h-4" />;
  };

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
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <TableSkeleton rows={5} columns={6} />
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
        <h1 className="text-2xl font-bold">{t('all_cases')}</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder={t('search_cases')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_status')}</SelectItem>
              <SelectItem value="New">{t('new')}</SelectItem>
              <SelectItem value="Working">{t('working')}</SelectItem>
              <SelectItem value="Escalated">{t('escalated')}</SelectItem>
              <SelectItem value="Closed">{t('closed')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_priority')}</SelectItem>
              <SelectItem value="Low">{t('low')}</SelectItem>
              <SelectItem value="Medium">{t('medium')}</SelectItem>
              <SelectItem value="High">{t('high')}</SelectItem>
              <SelectItem value="Critical">{t('critical')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('account')} />
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
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('new_case')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('no_cases_found')}</h3>
            <p className="text-muted-foreground mb-4">
              {search || filterStatus !== 'all' || filterPriority !== 'all' || filterAccount !== 'all'
                ? t('try_adjusting_search_or_filters')
                : t('create_first_case_to_get_started')
              }
            </p>
            {!search && filterStatus === 'all' && filterPriority === 'all' && filterAccount === 'all' && (
              <Button onClick={openAdd}>{t('create_first_case')}</Button>
            )}
          </div>
        ) : (
          filteredCases.map((caseItem) => (
            <div key={caseItem.id} className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{caseItem.subject}</h3>
                      <Badge className={priorityColors[caseItem.priority]}>{t(caseItem.priority.toLowerCase())}</Badge>
                      <Badge className={statusColors[caseItem.status]}>{getStatusIcon(caseItem.status)}{t(caseItem.status.toLowerCase())}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{caseItem.description}</p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(caseItem)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(caseItem.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {caseItem.accountName && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{caseItem.accountName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(caseItem.createdAt).toLocaleDateString()}</span>
                  </div>
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
            <DialogTitle>{editId ? t('edit_case') : t('add_new_case')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={t('subject')}
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              required
            />
            <Textarea
              placeholder={t('description')}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={form.priority} onValueChange={val => setForm(f => ({ ...f, priority: val as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">{t('low')}</SelectItem>
                  <SelectItem value="Medium">{t('medium')}</SelectItem>
                  <SelectItem value="High">{t('high')}</SelectItem>
                  <SelectItem value="Critical">{t('critical')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.status} onValueChange={val => setForm(f => ({ ...f, status: val as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">{t('new')}</SelectItem>
                  <SelectItem value="Working">{t('working')}</SelectItem>
                  <SelectItem value="Escalated">{t('escalated')}</SelectItem>
                  <SelectItem value="Closed">{t('closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  editId ? t('update_case') : t('create_case')
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
            <DialogTitle>{t('delete_case')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{t('are_you_sure_delete_case')}</p>
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