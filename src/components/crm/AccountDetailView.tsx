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
      const accountContacts = contactsData.filter(contact => contact.accountId === account.id);
      const accountCases = casesData.filter(caseItem => caseItem.accountId === account.id);
      
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
    return <div className="p-8 text-center text-gray-500">No account selected</div>;
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
              <span className="uppercase text-xs text-gray-500 font-semibold tracking-widest">Account</span>
              <Badge variant="outline" className="ml-2">{details.type}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{details.accountName}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
          <Button size="sm" onClick={() => setModal('follow')} variant={followStatus ? "default" : "outline"}>
            {followStatus ? "✓ Following" : "+ Follow"}
          </Button>
          <Button size="sm" onClick={() => setModal('newcontact')}>New Contact</Button>
          <Button size="sm" onClick={() => setModal('newcase')}>New Case</Button>
          <Button size="sm" onClick={() => setModal('newnote')}>New Note</Button>
          <Button size="sm" onClick={() => setModal('newopportunity')}>New Opportunity</Button>
          <Button variant="outline" size="sm" onClick={() => setModal('edit')}><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </div>
      {/* Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4 border-b">
        <div>
          <div className="text-xs text-gray-500">Type</div>
          <div className="font-medium">{details.type}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Phone</div>
          <div className="font-medium">{details.phone}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Website</div>
          <div className="font-medium text-blue-600 underline cursor-pointer">{details.website}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Billing Address</div>
          <div className="font-medium">{details.billingAddress}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Open Opportunities Amount Lifetime</div>
          <div className="font-medium">$0.00</div>
        </div>
      </div>
      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList className="flex gap-2 border-b mb-4">
          <TabsTrigger value="details" className="px-4 py-2">DETAILS</TabsTrigger>
          <TabsTrigger value="related" className="px-4 py-2">RELATED</TabsTrigger>
          <TabsTrigger value="news" className="px-4 py-2">NEWS</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left column */}
            <div className="space-y-4">
              <Field label="Account Owner" value={details.owner} onEdit={() => handleEdit('owner', details.owner)} editing={editField==='owner'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Account Name" value={details.accountName} onEdit={() => handleEdit('accountName', details.accountName)} editing={editField==='accountName'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Parent Account" value={details.parentAccount} onEdit={() => handleEdit('parentAccount', details.parentAccount)} editing={editField==='parentAccount'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Account Number" value={details.accountNumber} onEdit={() => handleEdit('accountNumber', details.accountNumber)} editing={editField==='accountNumber'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Type" value={details.type} onEdit={() => handleEdit('type', details.type)} editing={editField==='type'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Industry" value={details.industry} onEdit={() => handleEdit('industry', details.industry)} editing={editField==='industry'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Annual Revenue" value={details.annualRevenue} onEdit={() => handleEdit('annualRevenue', details.annualRevenue)} editing={editField==='annualRevenue'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Billing Address" value={details.billingAddress} onEdit={() => handleEdit('billingAddress', details.billingAddress)} editing={editField==='billingAddress'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
            </div>
            {/* Right column */}
            <div className="space-y-4">
              <Field label="Phone" value={details.phone} onEdit={() => handleEdit('phone', details.phone)} editing={editField==='phone'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Fax" value={details.fax} onEdit={() => handleEdit('fax', details.fax)} editing={editField==='fax'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Website" value={details.website} onEdit={() => handleEdit('website', details.website)} editing={editField==='website'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Ticker Symbol" value={details.tickerSymbol} onEdit={() => handleEdit('tickerSymbol', details.tickerSymbol)} editing={editField==='tickerSymbol'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Ownership" value={details.ownership} onEdit={() => handleEdit('ownership', details.ownership)} editing={editField==='ownership'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Number of Locations" value={details.numberOfLocations} onEdit={() => handleEdit('numberOfLocations', details.numberOfLocations)} editing={editField==='numberOfLocations'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Employees" value={details.employees} onEdit={() => handleEdit('employees', details.employees)} editing={editField==='employees'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
              <Field label="Shipping Address" value={details.shippingAddress} onEdit={() => handleEdit('shippingAddress', details.shippingAddress)} editing={editField==='shippingAddress'} editValue={editValue} setEditValue={setEditValue} onSave={handleEditSave} onCancel={()=>setEditField(null)} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="related">
          <div className="space-y-6">
            {/* Contacts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contacts ({relatedContacts.length})</h3>
                <Button size="sm" onClick={() => setModal('newcontact')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
              {relatedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : relatedContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No contacts found for this account</p>
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
                        View All Contacts ({relatedContacts.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cases Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Cases ({relatedCases.length})</h3>
                <Button size="sm" onClick={() => setModal('newcase')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Case
                </Button>
              </div>
              {relatedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : relatedCases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No cases found for this account</p>
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
                        View All Cases ({relatedCases.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="news">
          <div className="text-gray-500 p-8 text-center">News coming soon...</div>
        </TabsContent>
      </Tabs>
      {/* Activity/Chatter */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Section */}
        <div className="md:col-span-2">
          <Tabs value={activityTab} onValueChange={setActivityTab} className="mb-2">
            <TabsList className="flex gap-2 border-b mb-2">
              <TabsTrigger value="newtask" className="px-3 py-1">New Task</TabsTrigger>
              <TabsTrigger value="logcall" className="px-3 py-1">Log a Call</TabsTrigger>
              <TabsTrigger value="newevent" className="px-3 py-1">New Event</TabsTrigger>
              <TabsTrigger value="email" className="px-3 py-1">Email</TabsTrigger>
            </TabsList>
            <TabsContent value={activityTab}>
              <div className="flex gap-2 items-center mb-2">
                <Input
                  placeholder={`Recap your ${activityTab === 'logcall' ? 'call' : activityTab === 'newtask' ? 'task' : activityTab === 'newevent' ? 'event' : 'email'}...`}
                  value={activityInput}
                  onChange={e => setActivityInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleActivityAdd}>Add</Button>
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
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('call')}>
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('email')}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('schedule')}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => handleQuickAction('quote')}>
              <FileText className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Follow Modal */}
      <Dialog open={modal === 'follow'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Follow Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Would you like to follow updates for {details.accountName}?</p>
            <DialogFooter>
              <Button onClick={handleFollow}>
                {followStatus ? 'Unfollow' : 'Follow'}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Contact Modal */}
      <Dialog open={modal === 'newcontact'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNewContact(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={contactForm.firstName}
                onChange={e => setContactForm(f => ({ ...f, firstName: e.target.value }))}
                required
              />
              <Input
                placeholder="Last Name"
                value={contactForm.lastName}
                onChange={e => setContactForm(f => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={contactForm.email}
              onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={contactForm.phone}
              onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
            />
            <Input
              placeholder="Title"
              value={contactForm.title}
              onChange={e => setContactForm(f => ({ ...f, title: e.target.value }))}
            />
            <DialogFooter>
              <Button type="submit">Create Contact</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Case Modal */}
      <Dialog open={modal === 'newcase'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Case</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNewCase(); }} className="space-y-4">
            <Input
              placeholder="Subject"
              value={caseForm.subject}
              onChange={e => setCaseForm(f => ({ ...f, subject: e.target.value }))}
              required
            />
            <Textarea
              placeholder="Description"
              value={caseForm.description}
              onChange={e => setCaseForm(f => ({ ...f, description: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select value={caseForm.priority} onValueChange={val => setCaseForm(f => ({ ...f, priority: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={caseForm.status} onValueChange={val => setCaseForm(f => ({ ...f, status: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Working">Working</SelectItem>
                  <SelectItem value="Escalated">Escalated</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Create Case</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Note Modal */}
      <Dialog open={modal === 'newnote'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNewNote(); }} className="space-y-4">
            <Input
              placeholder="Note Title"
              value={noteForm.title}
              onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <Textarea
              placeholder="Note Content"
              value={noteForm.content}
              onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
              required
            />
            <DialogFooter>
              <Button type="submit">Create Note</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Opportunity Modal */}
      <Dialog open={modal === 'newopportunity'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Opportunity</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleNewOpportunity(); }} className="space-y-4">
            <Input
              placeholder="Opportunity Name"
              value={opportunityForm.name}
              onChange={e => setOpportunityForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              placeholder="Amount"
              type="number"
              value={opportunityForm.amount}
              onChange={e => setOpportunityForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
            <Input
              placeholder="Close Date"
              type="date"
              value={opportunityForm.closeDate}
              onChange={e => setOpportunityForm(f => ({ ...f, closeDate: e.target.value }))}
            />
            <Select value={opportunityForm.stage} onValueChange={val => setOpportunityForm(f => ({ ...f, stage: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Qualify">Qualify</SelectItem>
                <SelectItem value="Meet & Present">Meet & Present</SelectItem>
                <SelectItem value="Propose">Propose</SelectItem>
                <SelectItem value="Negotiate">Negotiate</SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button type="submit">Create Opportunity</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={modal === 'edit'} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Account editing is available inline. Click the edit icon next to any field to modify it.</p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function Field({ label, value, onEdit, editing, editValue, setEditValue, onSave, onCancel }: any) {
  if (editing) {
    return (
      <div>
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex gap-2 mt-1">
          <Input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={onSave}>Save</Button>
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
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
