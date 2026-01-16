import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, Edit, Trash2, DollarSign, Calendar, Building, User, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { addDeal, getDeals, updateDeal, deleteDeal } from '@/lib/firebase';
import { addNotification } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/store/slices/languageSlice";
import { fetchDeals, createDeal, modifyDeal, removeDeal } from "@/store/slices/dealsSlice";

interface Deal {
  id: string;
  name: string;
  companyName: string;
  amount: number;
  stage: string;
  priority: 1 | 2 | 3;
  owner: string;
  type: string;
  description: string;
  closeDate?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const initialForm = {
  name: '',
  companyName: '',
  amount: 0,
  stage: 'New',
  priority: 1,
  owner: '',
  type: '',
  description: '',
  closeDate: ''
};

const priorityLabels = {
  1: 'Low',
  2: 'Medium',
  3: 'High'
};

const priorityColors = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-red-100 text-red-800'
};

const stageColors = {
  New: 'bg-blue-100 text-blue-800',
  Qualified: 'bg-yellow-100 text-yellow-800',
  Proposition: 'bg-orange-100 text-orange-800',
  Negotiation: 'bg-purple-100 text-purple-800',
  Won: 'bg-green-100 text-green-800',
  Lost: 'bg-red-100 text-red-800'
};

export function DealsView() {
  const dispatch = useAppDispatch();
  const deals = useAppSelector((state) => state.deals.deals);
  const dataLoading = useAppSelector((state) => state.deals.loading);
  const slicesError = useAppSelector((state) => state.deals.error);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchDeals());
  }, [dispatch]);

  async function fetchDealsData() {
    dispatch(fetchDeals());
  }

  function openAdd() {
    setForm(initialForm);
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(deal: Deal) {
    setForm({
      name: deal.name || '',
      companyName: deal.companyName || '',
      amount: deal.amount || 0,
      stage: deal.stage || 'New',
      priority: deal.priority || 1,
      owner: deal.owner || '',
      type: deal.type || '',
      description: deal.description || '',
      closeDate: deal.closeDate || ''
    });
    setEditId(deal.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.companyName) {
      toast({
        title: t('validation_error'),
        description: t('title_and_company_required'),
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    setSubmitting(true);
    try {
      if (editId) {
        await dispatch(modifyDeal({ id: editId, data: form })).unwrap();
        toast({
          title: t('success'),
          description: t('deal_updated_successfully')
        });
      } else {
        await dispatch(createDeal(form)).unwrap();
        toast({
          title: t('success'),
          description: t('deal_created_successfully')
        });
      }
      closeModal();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error || (editId ? t('failed_to_update_deal') : t('failed_to_create_deal')),
        variant: "destructive"
      });
    }
    setSubmitting(false);
  }

  async function handleCloseDeal(dealId: string, stage: 'Won' | 'Lost') {
    try {
      await dispatch(modifyDeal({ id: dealId, data: { stage, closedAt: new Date() } })).unwrap();
      toast({
        title: t('success'),
        description: `${t('deal_marked_as')} ${stage.toLowerCase()}`
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error || t('failed_to_close_deal'),
        variant: "destructive"
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await dispatch(removeDeal(id)).unwrap();
      toast({
        title: t('success'),
        description: t('deal_deleted_successfully')
      });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error || t('failed_to_delete_deal'),
        variant: "destructive"
      });
    }
  }

  async function createSampleData() {
    const sampleDeals = [
      {
        name: t('enterprise_software_license'),
        companyName: t('tech_corp'),
        amount: 50000,
        stage: "Won",
        priority: 2,
        owner: t('john_doe'),
        type: t('software'),
        description: t('annual_enterprise_software_license'),
        closeDate: new Date().toISOString().split('T')[0],
      },
      {
        name: t('consulting_services'),
        companyName: t('global_solutions'),
        amount: 25000,
        stage: "Won",
        priority: 1,
        owner: t('jane_smith'),
        type: t('services'),
        description: t('3_month_consulting_engagement'),
        closeDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        name: t('hardware_implementation'),
        companyName: t('manufacturing_inc'),
        amount: 75000,
        stage: "Negotiation",
        priority: 3,
        owner: t('mike_johnson'),
        type: t('hardware'),
        description: t('complete_hardware_infrastructure_setup'),
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
    ];

    setSubmitting(true);
    try {
      for (const deal of sampleDeals) {
        await dispatch(createDeal(deal)).unwrap();
      }
      toast({
        title: t('success'),
        description: t('sample_deals_created_successfully')
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error || t('failed_to_create_sample_deals'),
        variant: "destructive"
      });
    }
    setSubmitting(false);
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch =
      deal.name?.toLowerCase().includes(search.toLowerCase()) ||
      deal.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      deal.owner?.toLowerCase().includes(search.toLowerCase());

    const matchesStage = filterStage === 'all' || deal.stage === filterStage;
    const matchesPriority = filterPriority === 'all' || deal.priority.toString() === filterPriority;

    return matchesSearch && matchesStage && matchesPriority;
  });

  const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const wonValue = deals.filter(d => d.stage === 'Won').reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;

  if (dataLoading) {
    return (
      <motion.div
        className="p-4 md:p-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2 items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <TableSkeleton rows={5} columns={8} />
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
        <h1 className="text-2xl font-bold">{t('deals_management')}</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder={t('search_deals')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('stage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_stages')}</SelectItem>
              <SelectItem value="New">{t('new')}</SelectItem>
              <SelectItem value="Qualified">{t('qualified')}</SelectItem>
              <SelectItem value="Proposition">{t('proposition')}</SelectItem>
              <SelectItem value="Negotiation">{t('negotiation')}</SelectItem>
              <SelectItem value="Won">{t('won')}</SelectItem>
              <SelectItem value="Lost">{t('lost')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t('priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_priority')}</SelectItem>
              <SelectItem value="1">{t('low')}</SelectItem>
              <SelectItem value="2">{t('medium')}</SelectItem>
              <SelectItem value="3">{t('high')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-2">{t('new_deal')}</Button>
          {deals.length === 0 && (
            <Button onClick={createSampleData} variant="outline" className="gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('creating')}...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t('create_sample_data')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t('total_value')}</h3>
          </div>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t('won_value')}</h3>
          </div>
          <p className="text-2xl font-bold">${wonValue.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t('active_deals')}</h3>
          </div>
          <p className="text-2xl font-bold">{activeDeals}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{t('total_deals')}</h3>
          </div>
          <p className="text-2xl font-bold">{deals.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('no_deals_found')}</h3>
            <p className="text-muted-foreground mb-4">
              {search || filterStage !== 'all' || filterPriority !== 'all'
                ? t('try_adjusting_search_or_filters')
                : t('create_your_first_deal_to_get_started')
              }
            </p>
            {!search && filterStage === 'all' && filterPriority === 'all' && (
              <Button onClick={openAdd}>{t('create_first_deal')}</Button>
            )}
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <div key={deal.id} className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{deal.name}</h3>
                      <Badge className={priorityColors[deal.priority as keyof typeof priorityColors]}>
                        {t(priorityLabels[deal.priority as keyof typeof priorityLabels].toLowerCase())}
                      </Badge>
                      <Badge className={stageColors[deal.stage]}>
                        {t(`stage_${deal.stage.toLowerCase()}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        <span>{deal.companyName}</span>
                      </div>
                      {deal.owner && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{deal.owner}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${deal.amount?.toLocaleString()}</span>
                      </div>
                      {deal.closeDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(deal.closeDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {deal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{deal.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-4">
                    {deal.stage !== 'Won' && deal.stage !== 'Lost' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCloseDeal(deal.id, 'Won')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCloseDeal(deal.id, 'Lost')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(deal)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(deal.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
            <DialogTitle>{editId ? t('edit_deal') : t('add_new_deal')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={t('deal_title')}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              placeholder={t('company')}
              value={form.companyName}
              onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder={t('value_dollar')}
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                placeholder={t('close_date')}
                type="date"
                value={form.closeDate}
                onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select value={form.stage} onValueChange={val => setForm(f => ({ ...f, stage: val as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('stage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">{t('new')}</SelectItem>
                  <SelectItem value="Qualified">{t('qualified')}</SelectItem>
                  <SelectItem value="Proposition">{t('proposition')}</SelectItem>
                  <SelectItem value="Negotiation">{t('negotiation')}</SelectItem>
                  <SelectItem value="Won">{t('won')}</SelectItem>
                  <SelectItem value="Lost">{t('lost')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.priority.toString()} onValueChange={val => setForm(f => ({ ...f, priority: parseInt(val) as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('low')}</SelectItem>
                  <SelectItem value="2">{t('medium')}</SelectItem>
                  <SelectItem value="3">{t('high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder={t('assignee')}
              value={form.owner}
              onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
            />
            <Input
              placeholder={t('type')}
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            />
            <textarea
              placeholder={t('description')}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editId ? t('updating') : t('creating')}...
                  </>
                ) : (
                  editId ? t('update_deal') : t('create_deal')
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
            <DialogTitle>{t('delete_deal')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{t('are_you_sure_you_want_to_delete_this_deal')}</p>
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