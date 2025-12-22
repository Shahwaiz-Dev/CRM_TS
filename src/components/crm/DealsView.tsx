import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, Edit, Trash2, DollarSign, Calendar, Building, User, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { addDoc, getDocs, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { addNotification } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: 'New' | 'Qualified' | 'Proposition' | 'Negotiation' | 'Won' | 'Lost';
  priority: 1 | 2 | 3;
  assignee: string;
  type: string;
  description: string;
  closeDate: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const initialForm = {
  title: '',
  company: '',
  value: 0,
  stage: 'New',
  priority: 1,
  assignee: '',
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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    setDataLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'deals'));
      const dealsData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Deal[];
      setDeals(dealsData);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_load_deals'),
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

  function openEdit(deal: Deal) {
    setForm({
      title: deal.title || '',
      company: deal.company || '',
      value: deal.value || 0,
      stage: deal.stage || 'New',
      priority: deal.priority || 1,
      assignee: deal.assignee || '',
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
    if (!form.title || !form.company) {
      toast({
        title: t('validation_error'),
        description: t('title_and_company_required'),
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const dealData = {
        ...form,
        updatedAt: new Date()
      };

      if (editId) {
        await updateDoc(doc(db, 'deals', editId), dealData);
        toast({
          title: t('success'),
          description: t('deal_updated_successfully')
        });
      } else {
        dealData.createdAt = new Date();
        await addDoc(collection(db, 'deals'), dealData);
        
        // Create notification for new deal
        await addNotification({
          title: t('new_deal_created'),
          body: `${t('new_deal')} "${form.title}" ${t('worth')} $${form.value?.toLocaleString()} ${t('has_been_created_for')} ${form.company}`,
          type: 'deal'
        });
        
        toast({
          title: t('success'),
          description: t('deal_created_successfully')
        });
      }
      closeModal();
      fetchDeals();
    } catch (error) {
      toast({
        title: t('error'),
        description: editId ? t('failed_to_update_deal') : t('failed_to_create_deal'),
        variant: "destructive"
      });
    }
    setSubmitting(false);
  }

  async function handleCloseDeal(dealId: string, stage: 'Won' | 'Lost') {
    try {
      await updateDoc(doc(db, 'deals', dealId), {
        stage,
        closedAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create notification for deal closure
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        await addNotification({
          title: `${t('deal')} ${stage}`,
          body: `${t('deal')} "${deal.title}" ${t('has_been')} ${stage.toLowerCase()}!`,
          type: 'deal'
        });
      }
      
      toast({
        title: t('success'),
        description: `${t('deal_marked_as')} ${stage.toLowerCase()}`
      });
      fetchDeals();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_close_deal'),
        variant: "destructive"
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, 'deals', id));
      toast({
        title: t('success'),
        description: t('deal_deleted_successfully')
      });
      setDeleteId(null);
      fetchDeals();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_delete_deal'),
        variant: "destructive"
      });
    }
  }

  async function createSampleData() {
    const sampleDeals = [
      {
        title: t('enterprise_software_license'),
        company: t('tech_corp'),
        value: 50000,
        stage: "Won" as const,
        priority: 2 as const,
        assignee: t('john_doe'),
        type: t('software'),
        description: t('annual_enterprise_software_license'),
        closeDate: new Date().toISOString().split('T')[0],
        closedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: t('consulting_services'),
        company: t('global_solutions'),
        value: 25000,
        stage: "Won" as const,
        priority: 1 as const,
        assignee: t('jane_smith'),
        type: t('services'),
        description: t('3_month_consulting_engagement'),
        closeDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        closedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: t('hardware_implementation'),
        company: t('manufacturing_inc'),
        value: 75000,
        stage: "Negotiation" as const,
        priority: 3 as const,
        assignee: t('mike_johnson'),
        type: t('hardware'),
        description: t('complete_hardware_infrastructure_setup'),
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setSubmitting(true);
    try {
      for (const deal of sampleDeals) {
        await addDoc(collection(db, 'deals'), deal);
      }
      toast({
        title: t('success'),
        description: t('sample_deals_created_successfully')
      });
      fetchDeals();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_to_create_sample_deals'),
        variant: "destructive"
      });
    }
    setSubmitting(false);
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title?.toLowerCase().includes(search.toLowerCase()) ||
      deal.company?.toLowerCase().includes(search.toLowerCase()) ||
      deal.assignee?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStage = filterStage === 'all' || deal.stage === filterStage;
    const matchesPriority = filterPriority === 'all' || deal.priority.toString() === filterPriority;
    
    return matchesSearch && matchesStage && matchesPriority;
  });

  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonValue = deals.filter(d => d.stage === 'Won').reduce((sum, deal) => sum + (deal.value || 0), 0);
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
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">{t('total_value')}</h3>
          </div>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">{t('won_value')}</h3>
          </div>
          <p className="text-2xl font-bold">${wonValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">{t('active_deals')}</h3>
          </div>
          <p className="text-2xl font-bold">{activeDeals}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">{t('total_deals')}</h3>
          </div>
          <p className="text-2xl font-bold">{deals.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('no_deals_found')}</h3>
            <p className="text-gray-500 mb-4">
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
            <div key={deal.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                      <Badge className={priorityColors[deal.priority]}>
                        {t(priorityLabels[deal.priority].toLowerCase())}
                      </Badge>
                      <Badge className={stageColors[deal.stage]}>
                        {t(`stage_${deal.stage.toLowerCase()}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        <span>{deal.company}</span>
                      </div>
                      {deal.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{deal.assignee}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${deal.value?.toLocaleString()}</span>
                      </div>
                      {deal.closeDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(deal.closeDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {deal.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{deal.description}</p>
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
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <Input
              placeholder={t('company')}
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder={t('value_dollar')}
                type="number"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
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
              value={form.assignee}
              onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
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