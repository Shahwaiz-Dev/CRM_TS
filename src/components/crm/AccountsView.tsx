import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AccountDetailView } from './AccountDetailView';
import { getAccounts, addAccount } from '@/lib/firebase';


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
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setDataLoading(true);
    const data = await getAccounts();
    setAccounts(data);
    if (data.length > 0 && !selectedAccount) {
      setSelectedAccount(data[0]);
    }
    setDataLoading(false);
  }

  function openAdd() {
    setForm(initialForm);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(initialForm);
  }

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
    return <div className="p-8 text-center text-gray-500">Loading accounts...</div>;
  }

  return (
    <div className="p-6 md:p-10">
        {accounts.length === 0 ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Accounts Found</h2>
            <p className="text-gray-600 mb-6">Create your first account to get started.</p>
            <Button onClick={openAdd} size="lg">Create First Account</Button>
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
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>{account.accountName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-gray-500">({accounts.length} accounts)</span>
              </div>
              <Button onClick={openAdd}>New Account</Button>
            </div>

            {/* Account Detail View */}
            {selectedAccount && <AccountDetailView account={selectedAccount} onUpdate={fetchAccounts} />}
          </>
        )}

        {/* Add Account Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Account Name"
                  value={form.accountName}
                  onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))}
                  required
                />
                <Select value={form.type} onValueChange={val => setForm(f => ({ ...f, type: val }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={form.industry} onValueChange={val => setForm(f => ({ ...f, industry: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
                <Input
                  placeholder="Website"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                />
                <Input
                  placeholder="Billing Address"
                  value={form.billingAddress}
                  onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
                />
                <Input
                  placeholder="Owner"
                  value={form.owner}
                  onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                />
                <Input
                  placeholder="Annual Revenue"
                  value={form.annualRevenue}
                  onChange={e => setForm(f => ({ ...f, annualRevenue: e.target.value }))}
                />
                <Input
                  placeholder="Number of Employees"
                  value={form.employees}
                  onChange={e => setForm(f => ({ ...f, employees: e.target.value }))}
                />
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
  );
}
