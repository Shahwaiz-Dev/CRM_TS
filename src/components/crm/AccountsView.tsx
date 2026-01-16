import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AccountDetailView } from './AccountDetailView';
import { getAccounts, addAccount } from '@/lib/firebase';
import { AlertTriangle, ExternalLink, Building, Phone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "@/store/slices/languageSlice";

const ACCOUNT_TYPES = ['Prospect', 'Customer', 'Partner', 'Competitor'];
const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other'];

const initialForm = {
  accountName: '',
  type: 'Prospect',
  industry: 'Technology',
  phone: '',
  website: '',
  billingAddress: '',
  owner: '',
  annualRevenue: '',
  employees: '',
};

export function AccountsView() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateAccounts, setDuplicateAccounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Debug: Monitor duplicate modal state
  useEffect(() => {
    console.log('Duplicate modal state changed:', duplicateModalOpen);
    console.log('Duplicate accounts:', duplicateAccounts);
  }, [duplicateModalOpen, duplicateAccounts]);

  async function fetchAccounts() {
    setDataLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDataLoading(false);
    }
  }

  function openAdd() {
    setForm(initialForm);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
  }

  // Check for duplicate accounts when account name changes
  const handleAccountNameChange = (accountName) => {
    setForm(f => ({ ...f, accountName }));

    if (accountName.trim().length > 2) {
      console.log('Checking for duplicates with:', accountName);
      console.log('Available accounts:', accounts);

      const duplicates = accounts.filter(account => {
        const existingName = account.accountName?.toLowerCase().trim();
        const newName = accountName.toLowerCase().trim();

        if (!existingName || !newName) return false;

        // Check for exact match
        if (existingName === newName) {
          console.log('Exact match found:', existingName);
          return true;
        }

        // Check if new name contains existing name (e.g., "Microsoft Corp" vs "Microsoft")
        if (newName.includes(existingName) && existingName.length > 3) {
          console.log('New name contains existing:', existingName);
          return true;
        }

        // Check if existing name contains new name (e.g., "Microsoft" vs "Microsoft Corp")
        if (existingName.includes(newName) && newName.length > 3) {
          console.log('Existing name contains new:', existingName);
          return true;
        }

        return false;
      });

      console.log('Found duplicates:', duplicates);

      if (duplicates.length > 0) {
        console.log('Setting duplicate modal to open with accounts:', duplicates);
        setDuplicateAccounts(duplicates);
        setDuplicateModalOpen(true);
      } else {
        console.log('No duplicates found, closing modal if open');
        setDuplicateModalOpen(false);
      }
    }
  };

  const handleViewExistingAccount = (account) => {
    setSelectedAccount(account);
    setDuplicateModalOpen(false);
    setModalOpen(false);
    setForm(initialForm);
  };

  const handleContinueCreating = () => {
    setDuplicateModalOpen(false);
    // Continue with the current form
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addAccount(form);
      setSubmitting(false);
      closeModal();
      fetchAccounts();
    } catch (error) {
      setSubmitting(false);
      console.error('Error saving account:', error);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-card rounded-lg border p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
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
      {accounts.length === 0 ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('no_accounts_found')}</h2>
          <p className="text-muted-foreground mb-6">{t('create_first_account_to_get_started')}</p>
          <Button onClick={openAdd} size="lg">{t('create_first_account')}</Button>
        </div>
      ) : (
        <>
          {/* Account Selector and Add Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Select value={selectedAccount?.id} onValueChange={(id) => {
                const account = accounts.find(a => a.id === id);
                setSelectedAccount(account);
              }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder={t('select_account')} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>{account.accountName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">({accounts.length} {t('accounts')})</span>
            </div>
            <Button onClick={openAdd}>{t('new_account')}</Button>
          </div>

          {/* Account Detail View */}
          {selectedAccount && <AccountDetailView account={selectedAccount} onUpdate={fetchAccounts} />}
        </>
      )}

      {/* Add Account Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('add_new_account')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder={t('account_name')}
              value={form.accountName}
              onChange={e => handleAccountNameChange(e.target.value)}
              required
            />
            <Select value={form.type} onValueChange={val => setForm(f => ({ ...f, type: val }))} required>
              <SelectTrigger>
                <SelectValue placeholder={t('type')} />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{t(type.toLowerCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={form.industry} onValueChange={val => setForm(f => ({ ...f, industry: val }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('industry')} />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(industry => (
                  <SelectItem key={industry} value={industry}>{t(industry.toLowerCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={t('phone')}
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
            <Input
              placeholder={t('website')}
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
            />
            <Input
              placeholder={t('billing_address')}
              value={form.billingAddress}
              onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
            />
            <Input
              placeholder={t('owner')}
              value={form.owner}
              onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
            />
            <Input
              placeholder={t('annual_revenue')}
              value={form.annualRevenue}
              onChange={e => setForm(f => ({ ...f, annualRevenue: e.target.value }))}
            />
            <Input
              placeholder={t('number_of_employees')}
              value={form.employees}
              onChange={e => setForm(f => ({ ...f, employees: e.target.value }))}
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

      {/* Duplicate Detection Modal */}
      <Dialog open={duplicateModalOpen} onOpenChange={setDuplicateModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              {t('similar_account_found')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('found_similar_accounts', { count: duplicateAccounts.length })}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {duplicateAccounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-medium text-foreground truncate">{account.accountName}</h3>
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded flex-shrink-0">
                          {t(account.type.toLowerCase())}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {account.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span className="truncate">{account.phone}</span>
                          </div>
                        )}
                        {account.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span className="truncate">{account.website}</span>
                          </div>
                        )}
                        {account.industry && (
                          <span className="text-muted-foreground"> 202 {t(account.industry.toLowerCase())}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewExistingAccount(account)}
                      className="flex items-center gap-1 ml-2 flex-shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t('view')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleContinueCreating}
                className="flex-1 text-sm"
              >
                {t('continue_creating_new_account')}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" size="sm">{t('cancel')}</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
