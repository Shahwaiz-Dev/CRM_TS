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
  stage: 'New' as const,
  priority: 1 as const,
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
        title: "Error",
        description: "Failed to load deals",
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
        title: "Validation Error",
        description: "Title and company are required",
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
          title: "Success",
          description: "Deal updated successfully"
        });
      } else {
        dealData.createdAt = new Date();
        await addDoc(collection(db, 'deals'), dealData);
        
        // Create notification for new deal
        await addNotification({
          title: 'New Deal Created',
          body: `A new deal "${form.title}" worth $${form.value?.toLocaleString()} has been created for ${form.company}`,
          type: 'deal'
        });
        
        toast({
          title: "Success",
          description: "Deal created successfully"
        });
      }
      closeModal();
      fetchDeals();
    } catch (error) {
      toast({
        title: "Error",
        description: editId ? "Failed to update deal" : "Failed to create deal",
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
          title: `Deal ${stage}`,
          body: `The deal "${deal.title}" has been ${stage.toLowerCase()}!`,
          type: 'deal'
        });
      }
      
      toast({
        title: "Success",
        description: `Deal marked as ${stage.toLowerCase()}`
      });
      fetchDeals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close deal",
        variant: "destructive"
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, 'deals', id));
      toast({
        title: "Success",
        description: "Deal deleted successfully"
      });
      setDeleteId(null);
      fetchDeals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive"
      });
    }
  }

  async function createSampleData() {
    const sampleDeals = [
      {
        title: "Enterprise Software License",
        company: "Tech Corp",
        value: 50000,
        stage: "Won" as const,
        priority: 2 as const,
        assignee: "John Doe",
        type: "Software",
        description: "Annual enterprise software license",
        closeDate: new Date().toISOString().split('T')[0],
        closedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Consulting Services",
        company: "Global Solutions",
        value: 25000,
        stage: "Won" as const,
        priority: 1 as const,
        assignee: "Jane Smith",
        type: "Services",
        description: "3-month consulting engagement",
        closeDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        closedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Hardware Implementation",
        company: "Manufacturing Inc",
        value: 75000,
        stage: "Negotiation" as const,
        priority: 3 as const,
        assignee: "Mike Johnson",
        type: "Hardware",
        description: "Complete hardware infrastructure setup",
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
        title: "Success",
        description: "Sample deals created successfully"
      });
      fetchDeals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sample deals",
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

  // Remove the early return for loading state

  return (
    <motion.div
      className="p-4 md:p-4"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Deals Management</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
            icon={<Search className="w-4 h-4" />}
          />
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Proposition">Proposition</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="1">Low</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">High</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            New Deal
          </Button>
          {deals.length === 0 && (
            <Button onClick={createSampleData} variant="outline" className="gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Sample Data
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
            <h3 className="font-semibold">Total Value</h3>
          </div>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Won Value</h3>
          </div>
          <p className="text-2xl font-bold">${wonValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Active Deals</h3>
          </div>
          <p className="text-2xl font-bold">{activeDeals}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Total Deals</h3>
          </div>
          <p className="text-2xl font-bold">{deals.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-500 mb-4">
              {search || filterStage !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first deal to get started'
              }
            </p>
            {!search && filterStage === 'all' && filterPriority === 'all' && (
              <Button onClick={openAdd}>Create First Deal</Button>
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
                        {priorityLabels[deal.priority]}
                      </Badge>
                      <Badge className={stageColors[deal.stage]}>
                        {deal.stage}
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
            <DialogTitle>{editId ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Deal Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <Input
              placeholder="Company"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Value ($)"
                type="number"
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
              />
              <Input
                placeholder="Close Date"
                type="date"
                value={form.closeDate}
                onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select value={form.stage} onValueChange={val => setForm(f => ({ ...f, stage: val as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposition">Proposition</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Won">Won</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.priority.toString()} onValueChange={val => setForm(f => ({ ...f, priority: parseInt(val) as any }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Low</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Assignee"
              value={form.assignee}
              onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
            />
            <Input
              placeholder="Type"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            />
            <textarea
              placeholder="Description"
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
                    {editId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editId ? 'Update Deal' : 'Create Deal'
                )}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this deal? This action cannot be undone.</p>
            <DialogFooter>
              <Button 
                variant="destructive" 
                onClick={() => deleteId && handleDelete(deleteId)}
              >
                Delete
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 