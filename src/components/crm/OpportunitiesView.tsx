import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getOpportunities, addOpportunity, updateOpportunity, deleteOpportunity } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/store/slices/languageSlice";
import { fetchOpportunities, createNewOpportunity, modifyOpportunity, removeOpportunity } from "@/store/slices/opportunitiesSlice";

const STAGES = [
  'Qualify',
  'Meet & Present',
  'Propose',
  'Negotiate',
  'Closed Won',
  'Closed Lost',
];

const initialForm = {
  name: '',
  account: '',
  amount: '',
  closeDate: '',
  stage: '',
  owner: '',
  companyName: '',
  companyBillingAddress: '',
};

export function OpportunitiesView() {
  const dispatch = useAppDispatch();
  const opportunities = useAppSelector((state) => state.opportunities.opportunities);
  const dataLoading = useAppSelector((state) => state.opportunities.loading);
  const slicesError = useAppSelector((state) => state.opportunities.error);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchOpportunities());
  }, [dispatch]);

  const fetchOpportunitiesData = async () => {
    dispatch(fetchOpportunities());
  };

  function openAdd() {
    setForm(initialForm);
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(opp) {
    setForm({
      name: opp.name || '',
      account: opp.account || '',
      amount: opp.amount?.toString() || '',
      closeDate: opp.closeDate || '',
      stage: opp.stage || '',
      owner: opp.owner || '',
      companyName: opp.companyName || '',
      companyBillingAddress: opp.companyBillingAddress || '',
    });
    setEditId(opp.id);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
    setEditId(null);
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };
      if (editId) {
        await dispatch(modifyOpportunity({ id: editId, data: payload })).unwrap();
        toast({
          title: t('success'),
          description: t('opportunity_updated_successfully')
        });
      } else {
        await dispatch(createNewOpportunity(payload)).unwrap();
        toast({
          title: t('success'),
          description: t('opportunity_created_successfully')
        });
      }
      closeModal();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || (editId ? t('failed_to_update_opportunity') : t('failed_to_create_opportunity')),
        variant: "destructive"
      });
    }
    setSubmitting(false);
  }
  async function handleDelete(id) {
    try {
      await dispatch(removeOpportunity(id)).unwrap();
      toast({
        title: t('success'),
        description: t('opportunity_deleted_successfully')
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('failed_to_delete_opportunity'),
        variant: "destructive"
      });
    }
    setDeleteId(null);
  }

  const filtered = opportunities.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.account?.toLowerCase().includes(search.toLowerCase()) ||
    o.owner?.toLowerCase().includes(search.toLowerCase()) ||
    o.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  if (dataLoading) {
    return (
      <motion.div
        className="p-4 md:p-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2 items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <TableSkeleton rows={5} columns={9} />
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">{t('all_opportunities')}</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder={t('search_this_list')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={openAdd}>{t('new')}</Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">{t('opportunity_name')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('account_name')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('company_name')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('company_billing_address')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('amount')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('close_date')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('stage')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('opportunity_owner_alias')}</th>
              <th className="px-4 py-2 text-left font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8">{t('no_opportunities_found')}</td></tr>
            ) : (
              filtered.map((o, i) => (
                <tr key={o.id || o.name} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 text-primary font-medium cursor-pointer hover:underline">{o.name}</td>
                  <td className="px-4 py-2">{o.account}</td>
                  <td className="px-4 py-2">{o.companyName}</td>
                  <td className="px-4 py-2">{o.companyBillingAddress}</td>
                  <td className="px-4 py-2">${o.amount?.toLocaleString()}</td>
                  <td className="px-4 py-2">{o.closeDate}</td>
                  <td className="px-4 py-2">{o.stage ? t(`stage_${o.stage.toLowerCase().replace(/ /g, '_')}`) : o.stage}</td>
                  <td className="px-4 py-2 text-primary font-medium cursor-pointer hover:underline">{o.owner}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(o)}>{t('edit')}</Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(o.id)}>{t('delete')}</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? t('edit_opportunity') : t('add_opportunity')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={t('opportunity_name')}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              placeholder={t('account_name')}
              value={form.account}
              onChange={e => setForm(f => ({ ...f, account: e.target.value }))}
              required
            />
            <Input
              placeholder={t('company_name')}
              value={form.companyName}
              onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
              required
            />
            <Input
              placeholder={t('company_billing_address')}
              value={form.companyBillingAddress}
              onChange={e => setForm(f => ({ ...f, companyBillingAddress: e.target.value }))}
              required
            />
            <Input
              placeholder={t('amount')}
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
            <Input
              placeholder={t('close_date')}
              type="date"
              value={form.closeDate}
              onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))}
              required
            />
            <Select value={form.stage} onValueChange={val => setForm(f => ({ ...f, stage: val }))} required>
              <SelectTrigger>
                <SelectValue placeholder={t('stage')} />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map(stage => (
                  <SelectItem key={stage} value={stage}>{t(`stage_${stage.toLowerCase().replace(/ /g, '_')}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={t('owner_alias')}
              value={form.owner}
              onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
              required
            />
            <DialogFooter>
              <Button type="submit" disabled={submitting}>{submitting ? t('saving') : t('save')}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_opportunity')}</DialogTitle>
          </DialogHeader>
          <div>{t('are_you_sure_you_want_to_delete_this_opportunity')}</div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => handleDelete(deleteId)}>{t('delete')}</Button>
            <DialogClose asChild>
              <Button variant="outline">{t('cancel')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 