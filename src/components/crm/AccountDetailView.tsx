import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Phone, Globe, MapPin, Edit, MoreHorizontal, Plus, Mail, FileText, MessageSquare, Calendar, Users, ChevronDown, RefreshCw, CheckCircle, X } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';


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

  // Update details when account prop changes
  useEffect(() => {
    if (account) {
      setDetails({ ...initialDetails, ...account });
    }
  }, [account]);

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

  if (!account) {
    return <div className="p-8 text-center text-gray-500">No account selected</div>;
  }

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
          <Button size="sm" onClick={() => setModal('follow')}>+ Follow</Button>
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
          <div className="text-gray-500 p-8 text-center">Related info coming soon...</div>
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
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
          </div>
        </div>
      </div>
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
