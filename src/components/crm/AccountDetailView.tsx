import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Phone, Globe, MapPin, Edit, MoreHorizontal, Plus, Mail, FileText, MessageSquare, Calendar, Users, ChevronDown, RefreshCw, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { addContact, addCase, getContacts, getCases } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

const priorityColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800'
};

const statusColors = {
  New: 'bg-blue-100 text-blue-800',
  Working: 'bg-yellow-100 text-yellow-800',
  Escalated: 'bg-orange-100 text-orange-800',
  Closed: 'bg-gray-100 text-gray-800'
};

const initialDetails = {
  owner: '',
  phone: '',
  accountName: '',
  parentAccount: '',
  accountNumber: '',
  type: 'Prospect',
  industry: 'Technology',
  annualRevenue: '',
  billingAddress: '',
  shippingAddress: '',
  fax: '',
  website: '',
  tickerSymbol: '',
  ownership: '',
  numberOfLocations: '',
  employees: '',
};

export function AccountDetailView({ account, onUpdate }) {
  const [tab, setTab] = useState('details');
  const [activityTab, setActivityTab] = useState('logcall');
  const [details, setDetails] = useState(initialDetails);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activityLog, setActivityLog] = useState<any[]>([{ type: 'call', text: 'You logged a call', date: 'Today' }]);
  const [activityInput, setActivityInput] = useState('');
  const [modal, setModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal form states
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', title: '' });
  const [caseForm, setCaseForm] = useState({ subject: '', description: '', priority: 'Medium', status: 'New' });
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [opportunityForm, setOpportunityForm] = useState({ name: '', amount: '', closeDate: '', stage: 'Qualify' });
  const [followStatus, setFollowStatus] = useState(false);

  // Related data states
  const [relatedContacts, setRelatedContacts] = useState([]);
  const [relatedCases, setRelatedCases] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const { t } = useLanguage();

  // Update details when account prop changes
  useEffect(() => {
    if (account) {
      setDetails({ ...initialDetails, ...account });
    }
  }, [account]);

  // Fetch related data when account changes
  useEffect(() => {
    if (account?.id) {
      fetchRelatedData();
    }
  }, [account?.id]);

  const fetchRelatedData = async () => {
    setRelatedLoading(true);
    try {
      const [contactsData, casesData] = await Promise.all([
        getContacts(),
        getCases()
      ]);

      // Filter contacts and cases for this account
      const accountContacts = (contactsData as Array<{ id: string; accountId?: string }>).filter(contact => contact.accountId === account.id);
      const accountCases = (casesData as Array<{ id: string; accountId?: string }>).filter(caseItem => caseItem.accountId === account.id);

      setRelatedContacts(accountContacts);
      setRelatedCases(accountCases);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    } finally {
      setRelatedLoading(false);
    }
  };

  const handleEdit = (field: string, value: string) => {
    setEditField(field);
    setEditValue(value);
  };

  const handleEditSave = async () => {
    if (!account?.id) return;
    setLoading(true);
    try {
      const updatedDetails = { ...details, [editField!]: editValue };
      setDetails(updatedDetails);
      setEditField(null);
      await updateDoc(doc(db, 'accounts', account.id), updatedDetails);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error('Failed to update account:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityAdd = () => {
    if (activityInput.trim()) {
      setActivityLog([{ type: activityTab, text: activityInput, date: 'Today' }, ...activityLog]);
      setActivityInput('');
    }
  };

  const handleFollow = () => {
    setFollowStatus(!followStatus);
    setModal(null);
  };

  const handleNewContact = async () => {
    if (!contactForm.firstName || !contactForm.lastName) return;

    setLoading(true);
    try {
      const contactData = {
        ...contactForm,
        accountId: account.id,
        accountName: account.accountName
      };

      await addContact(contactData);
      console.log('Contact created successfully');

      // Reset form and close modal
      setContactForm({ firstName: '', lastName: '', email: '', phone: '', title: '' });
      setModal(null);

      // Optionally refresh account data or show success message
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to create contact:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleNewCase = async () => {
    if (!caseForm.subject || !caseForm.description) return;

    setLoading(true);
    try {
      const caseData = {
        ...caseForm,
        accountId: account.id,
        accountName: account.accountName
      };

      await addCase(caseData);
      console.log('Case created successfully');

      // Reset form and close modal
      setCaseForm({ subject: '', description: '', priority: 'Medium', status: 'New' });
      setModal(null);

      // Optionally refresh account data or show success message
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to create case:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleNewNote = async () => {
    if (!noteForm.title || !noteForm.content) return;
    // Here you would typically save to Firebase
    console.log('New note:', noteForm);
    setNoteForm({ title: '', content: '' });
    setModal(null);
  };

  const handleNewOpportunity = async () => {
    if (!opportunityForm.name || !opportunityForm.amount) return;
    // Here you would typically save to Firebase
    console.log('New opportunity:', opportunityForm);
    setOpportunityForm({ name: '', amount: '', closeDate: '', stage: 'Qualify' });
    setModal(null);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'call':
        window.open(`tel:${details.phone}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${details.owner}`, '_self');
        break;
      case 'schedule':
        // Open calendar scheduling
        console.log('Schedule meeting for:', details.accountName);
        break;
      case 'quote':
        // Create quote functionality
        console.log('Create quote for:', details.accountName);
        break;
    }
  };

  if (!account) {
    return <div className="p-8 text-center text-gray-500">{t('no_account_selected')}</div>;
  }

  const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    New: 'bg-blue-100 text-blue-800',
    Working: 'bg-purple-100 text-purple-800',
    Escalated: 'bg-red-100 text-red-800',
    Closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="uppercase text-xs text-gray-500 font-semibold tracking-widest">{t('account')}</span>
              <Badge variant="outline" className="ml-2">{t(details.type.toLowerCase())}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{details.accountName}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
          <Button size="sm" onClick={() => setModal('follow')} variant={followStatus ? "default" : "outline"}>
            {followStatus ? "✓ Following" : "+ Follow"}
          </Button>
          <Button size="sm" onClick={() => setModal('newcontact')}>{t('new_contact')}</Button>
          <Button size="sm" onClick={() => setModal('newcase')}>{t('new_case')}</Button>
          <Button size="sm" onClick={() => setModal('newnote')}>{t('new_note')}</Button>
          <Button size="sm" onClick={() => setModal('newopportunity')}>{t('new_opportunity')}</Button>
          <Button variant="outline" size="sm" onClick={() => setModal('edit')}><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </div>
      {/* Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4 border-b">
        <div>
          <div className="text-xs text-gray-500">{t('type')}</div>
          <div className="font-medium">{t(details.type.toLowerCase())}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('phone')}</div>
          <div className="font-medium">{details.phone}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('website')}</div>
          <div className="font-medium text-blue-600 underline cursor-pointer">{details.website}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('billing_address')}</div>
          <div className="font-medium">{details.billingAddress}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('open_opportunities_amount_lifetime')}</div>
          <div className="font-medium">$0.00</div>
        </div>
      </div>
      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList className="flex gap-2 border-b mb-4">
          <TabsTrigger value="details" className="px-4 py-2">{t('details')}</TabsTrigger>
          <TabsTrigger value="related" className="px-4 py-2">{t('related')}</TabsTrigger>
          <TabsTrigger value="news" className="px-4 py-2">{t('news')}</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left column */}
            <div className="space-y-4">
              <Field label={t('account_owner')} value={details.owner} onEdit={() => handleEdit('owner', details.owner)} editing={editField === 'owner'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('account_name')} value={details.accountName} onEdit={() => handleEdit('accountName', details.accountName)} editing={editField === 'accountName'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('parent_account')} value={details.parentAccount} onEdit={() => handleEdit('parentAccount', details.parentAccount)} editing={editField === 'parentAccount'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('account_number')} value={details.accountNumber} onEdit={() => handleEdit('accountNumber', details.accountNumber)} editing={editField === 'accountNumber'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('type')} value={details.type} onEdit={() => handleEdit('type', details.type)} editing={editField === 'type'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('industry')} value={details.industry} onEdit={() => handleEdit('industry', details.industry)} editing={editField === 'industry'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('annual_revenue')} value={details.annualRevenue} onEdit={() => handleEdit('annualRevenue', details.annualRevenue)} editing={editField === 'annualRevenue'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('billing_address')} value={details.billingAddress} onEdit={() => handleEdit('billingAddress', details.billingAddress)} editing={editField === 'billingAddress'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} isAddress />
            </div>
            {/* Right column */}
            <div className="space-y-4">
              <Field label={t('phone')} value={details.phone} onEdit={() => handleEdit('phone', details.phone)} editing={editField === 'phone'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('fax')} value={details.fax} onEdit={() => handleEdit('fax', details.fax)} editing={editField === 'fax'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('website')} value={details.website} onEdit={() => handleEdit('website', details.website)} editing={editField === 'website'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('ticker_symbol')} value={details.tickerSymbol} onEdit={() => handleEdit('tickerSymbol', details.tickerSymbol)} editing={editField === 'tickerSymbol'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('ownership')} value={details.ownership} onEdit={() => handleEdit('ownership', details.ownership)} editing={editField === 'ownership'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('number_of_locations')} value={details.numberOfLocations} onEdit={() => handleEdit('numberOfLocations', details.numberOfLocations)} editing={editField === 'numberOfLocations'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('employees')} value={details.employees} onEdit={() => handleEdit('employees', details.employees)} editing={editField === 'employees'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} />
              <Field label={t('shipping_address')} value={details.shippingAddress} onEdit={() => handleEdit('shippingAddress', details.shippingAddress)} editing={editField === 'shippingAddress'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={() => setEditField(null)} isAddress />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="related">
          <div className="space-y-6">
            {/* Contacts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('contacts')} ({relatedContacts.length})</h3>
                <Button size="sm" onClick={() => setModal('newcontact')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add_contact')}
                </Button>
              </div>
              {relatedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : relatedContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>{t('no_contacts_found_for_this_account')}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {relatedContacts.slice(0, 5).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                            {contact.firstName?.charAt(0)}{contact.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{contact.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {contact.email && <Mail className="w-3 h-3" />}
                        {contact.phone && <Phone className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                  {relatedContacts.length > 5 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/contacts'}>
                        {t('view_all_contacts', { count: relatedContacts.length })}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cases Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('cases')} ({relatedCases.length})</h3>
                <Button size="sm" onClick={() => setModal('newcase')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add_case')}
                </Button>
              </div>
              {relatedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : relatedCases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>{t('no_cases_found_for_this_account')}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {relatedCases.slice(0, 5).map((caseItem) => (
                    <div key={caseItem.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{caseItem.subject}</h4>
                        <div className="flex gap-1">
                          <Badge className={`text-xs ${priorityColors[caseItem.priority]}`}>
                            {caseItem.priority}
                          </Badge>
                          <Badge className={`text-xs ${statusColors[caseItem.status]}`}>
                            {caseItem.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{caseItem.description}</p>
                    </div>
                  ))}
                  {relatedCases.length > 5 && (
                    <div className="text-center">
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/cases'}>
                        {t('view_all_cases', { count: relatedCases.length })}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="news">
          <div className="text-gray-500 p-8 text-center">{t('news_coming_soon')}</div>
        </TabsContent>
      </Tabs>
      {/* Activity/Chatter */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Section */}
        <div className="md:col-span-2">
          <Tabs value={activityTab} onValueChange={setActivityTab} className="mb-2">
            <TabsList className="flex gap-2 border-b mb-2">
              <TabsTrigger value="newtask" className="px-3 py-1">{t('new_task')}</TabsTrigger>
              <TabsTrigger value="logcall" className="px-3 py-1">{t('log_a_call')}</TabsTrigger>
              <TabsTrigger value="newevent" className="px-3 py-1">{t('new_event')}</TabsTrigger>
              <TabsTrigger value="email" className="px-3 py-1">{t('email')}</TabsTrigger>
            </TabsList>
            <TabsContent value={activityTab}>
              <div className="flex gap-2 items-center mb-2">
                <Input
                  placeholder={t('recap_your', { type: t(activityTab) })}
                  value={activityInput}
                  onChange={e => setActivityInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleActivityAdd}>{t('add')}</Button>
              </div>
              <div className="space-y-2">
                {activityLog.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Quick Actions */}
        <div>
          <h3 className="font-semibold mb-3">{t('quick_actions')}</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('call')}>
              <Phone className="w-4 h-4 mr-2" />
              {t('call')}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('email')}>
              <Mail className="w-4 h-4 mr-2" />
              {t('email')}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('schedule')}>
              <Calendar className="w-4 h-4 mr-2" />
              {t('schedule_meeting')}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('quote')}>
              <FileText className="w-4 h-4 mr-2" />
              {t('create_quote')}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Follow Modal */}
      <Dialog open={modal === 'follow'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('follow_account')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{t('would_you_like_to_follow_updates_for', { name: details.accountName })}</p>
            <DialogFooter>
              <Button onClick={handleFollow}>
                {followStatus ? t('unfollow') : t('follow')}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Contact Modal */}
      <Dialog open={modal === 'newcontact'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('new_contact')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNewContact(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder={t('first_name')}
                value={contactForm.firstName}
                onChange={e => setContactForm(f => ({ ...f, firstName: e.target.value }))}
                required
              />
              <Input
                placeholder={t('last_name')}
                value={contactForm.lastName}
                onChange={e => setContactForm(f => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
            <Input
              placeholder={t('email')}
              type="email"
              value={contactForm.email}
              onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              placeholder={t('phone')}
              value={contactForm.phone}
              onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
            />
            <Input
              placeholder={t('title')}
              value={contactForm.title}
              onChange={e => setContactForm(f => ({ ...f, title: e.target.value }))}
            />
            <DialogFooter>
              <Button type="submit">{t('create_contact')}</Button>
              <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Case Modal */}
      <Dialog open={modal === 'newcase'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('new_case')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNewCase(); }} className="space-y-4">
            <Input
              placeholder={t('subject')}
              value={caseForm.subject}
              onChange={e => setCaseForm(f => ({ ...f, subject: e.target.value }))}
              required
            />
            <Textarea
              placeholder={t('description')}
              value={caseForm.description}
              onChange={e => setCaseForm(f => ({ ...f, description: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={caseForm.priority} onValueChange={val => setCaseForm(f => ({ ...f, priority: val }))}>
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
              <Select value={caseForm.status} onValueChange={val => setCaseForm(f => ({ ...f, status: val }))}>
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
            <DialogFooter>
              <Button type="submit">{t('create_case')}</Button>
              <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Note Modal */}
      <Dialog open={modal === 'newnote'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('new_note')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNewNote(); }} className="space-y-4">
            <Input
              placeholder={t('note_title')}
              value={noteForm.title}
              onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <Textarea
              placeholder={t('note_content')}
              value={noteForm.content}
              onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
              required
            />
            <DialogFooter>
              <Button type="submit">{t('create_note')}</Button>
              <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Opportunity Modal */}
      <Dialog open={modal === 'newopportunity'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('new_opportunity')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNewOpportunity(); }} className="space-y-4">
            <Input
              placeholder={t('opportunity_name')}
              value={opportunityForm.name}
              onChange={e => setOpportunityForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              placeholder={t('amount')}
              type="number"
              value={opportunityForm.amount}
              onChange={e => setOpportunityForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
            <Input
              placeholder={t('close_date')}
              type="date"
              value={opportunityForm.closeDate}
              onChange={e => setOpportunityForm(f => ({ ...f, closeDate: e.target.value }))}
            />
            <Select value={opportunityForm.stage} onValueChange={val => setOpportunityForm(f => ({ ...f, stage: val }))}>
              <SelectTrigger>
                <SelectValue placeholder={t('stage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Qualify">{t('qualify')}</SelectItem>
                <SelectItem value="Meet & Present">{t('meet_and_present')}</SelectItem>
                <SelectItem value="Propose">{t('propose')}</SelectItem>
                <SelectItem value="Negotiate">{t('negotiate')}</SelectItem>
                <SelectItem value="Closed Won">{t('closed_won')}</SelectItem>
                <SelectItem value="Closed Lost">{t('closed_lost')}</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="submit">{t('create_opportunity')}</Button>
              <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={modal === 'edit'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('edit_account')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{t('account_editing_inline')}</p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t('close')}</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function Field({ label, value, onEdit, editing, editValue, setEditValue, onSave, onCancel, isAddress }: any) {
  const { t } = useLanguage();

  if (editing) {
    return (
      <div>
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex gap-2 mt-1">
          {isAddress ? (
            <AddressAutocomplete
              value={editValue}
              onChange={setEditValue}
              className="flex-1"
            />
          ) : (
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="flex-1"
            />
          )}
          <Button size="sm" onClick={onSave}>{t('save')}</Button>
          <Button size="sm" variant="outline" onClick={onCancel}>{t('cancel')}</Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="flex items-center justify-between group">
        <div className="font-medium">{value || '-'}</div>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEdit}
        >
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
