import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreHorizontal, Grid3X3, List, BarChart3, Calendar, Plus, Pencil, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: string;
  priority: number;
  assignee: string;
  type: string;
  description?: string;
  avatar: string;
}

const stageNames = ['New', 'Qualified', 'Proposition', 'Negotiation', 'Won'];
const stageColors = {
  'New': 'bg-green-500',
  'Qualified': 'bg-red-500',
  'Proposition': 'bg-blue-500',
  'Negotiation': 'bg-purple-500',
  'Won': 'bg-orange-500'
};

export function PipelineView() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDeal, setNewDeal] = useState({
    title: '',
    company: '',
    value: 0,
    stage: 'New',
    priority: 1,
    assignee: '',
    type: '',
    avatar: '👤',
    description: ''
  });
  const [showAdd, setShowAdd] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [editDealData, setEditDealData] = useState({
    title: '',
    company: '',
    value: 0,
    stage: 'New',
    priority: 1,
    assignee: '',
    type: '',
    avatar: '👤',
    description: ''
  });
  const [showEdit, setShowEdit] = useState(false);
  const [loadingDealId, setLoadingDealId] = useState<string | null>(null);

  // Fetch deals from Firestore
  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'deals'));
      setDeals(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
    } catch (e: any) {
      setError(e.message || 'Failed to fetch deals');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Add a new deal
  const handleAddDeal = async () => {
    if (!newDeal.title || !newDeal.company) return;
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'deals'), newDeal);
      setNewDeal({ title: '', company: '', value: 0, stage: 'New', priority: 1, assignee: '', type: '', avatar: '👤', description: '' });
      setShowAdd(false);
      fetchDeals();
    } catch (e: any) {
      setError(e.message || 'Failed to add deal');
    }
    setLoading(false);
  };

  // Update deal stage on drag
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    const deal = deals.find(d => d.id === draggableId);
    if (!deal) return;
    setLoadingDealId(deal.id);
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'deals', deal.id), { stage: destination.droppableId });
      fetchDeals();
    } catch (e: any) {
      setError(e.message || 'Failed to update deal');
    }
    setLoading(false);
    setLoadingDealId(null);
  };

  const getPriorityStars = (priority: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`text-sm ${i < priority ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getStageDeals = (stageName: string) => deals.filter(d => d.stage === stageName);

  // Open edit dialog with deal data
  const handleEditClick = (deal: Deal) => {
    setEditDeal(deal);
    setEditDealData({
      title: deal.title,
      company: deal.company,
      value: deal.value,
      stage: deal.stage,
      priority: deal.priority,
      assignee: deal.assignee,
      type: deal.type,
      avatar: deal.avatar,
      description: deal.description || ''
    });
    setShowEdit(true);
  };

  // Update deal in Firestore
  const handleEditDeal = async () => {
    if (!editDeal) return;
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'deals', editDeal.id), editDealData);
      setShowEdit(false);
      setEditDeal(null);
      fetchDeals();
    } catch (e: any) {
      setError(e.message || 'Failed to update deal');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Pipeline</h1>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Deal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Input placeholder="Title" value={newDeal.title} onChange={e => setNewDeal(d => ({ ...d, title: e.target.value }))} />
              <Input placeholder="Company" value={newDeal.company} onChange={e => setNewDeal(d => ({ ...d, company: e.target.value }))} />
              <Input placeholder="Value" type="number" value={newDeal.value} onChange={e => setNewDeal(d => ({ ...d, value: Number(e.target.value) }))} />
              <Input placeholder="Type" value={newDeal.type} onChange={e => setNewDeal(d => ({ ...d, type: e.target.value }))} />
              <Input placeholder="Assignee" value={newDeal.assignee} onChange={e => setNewDeal(d => ({ ...d, assignee: e.target.value }))} />
              <Input placeholder="Description" value={newDeal.description} onChange={e => setNewDeal(d => ({ ...d, description: e.target.value }))} />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={async () => { await handleAddDeal(); setShowAdd(false); }} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="mb-4">Loading...</div>}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input placeholder="Title" value={editDealData.title} onChange={e => setEditDealData(d => ({ ...d, title: e.target.value }))} />
            <Input placeholder="Company" value={editDealData.company} onChange={e => setEditDealData(d => ({ ...d, company: e.target.value }))} />
            <Input placeholder="Value" type="number" value={editDealData.value} onChange={e => setEditDealData(d => ({ ...d, value: Number(e.target.value) }))} />
            <Input placeholder="Type" value={editDealData.type} onChange={e => setEditDealData(d => ({ ...d, type: e.target.value }))} />
            <Input placeholder="Assignee" value={editDealData.assignee} onChange={e => setEditDealData(d => ({ ...d, assignee: e.target.value }))} />
            <Input placeholder="Description" value={editDealData.description} onChange={e => setEditDealData(d => ({ ...d, description: e.target.value }))} />
            <Input placeholder="Priority (1-3)" type="number" min={1} max={3} value={editDealData.priority} onChange={e => setEditDealData(d => ({ ...d, priority: Math.max(1, Math.min(3, Number(e.target.value))) }))} />
            <select className="border rounded px-2 py-1" value={editDealData.stage} onChange={e => setEditDealData(d => ({ ...d, stage: e.target.value }))}>
              {stageNames.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={async () => { await handleEditDeal(); setShowEdit(false); }} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          {stageNames.map(stage => (
            <Droppable droppableId={stage} key={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-80 flex-shrink-0 bg-white rounded-lg border p-4 transition-colors duration-200 min-h-[400px] ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`}
                >
                  <h3 className={`font-semibold mb-4 text-lg ${stageColors[stage]} text-center`}>{stage}</h3>
                  <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto min-h-[60px]">
                    {getStageDeals(stage).map((deal, idx) => (
                      <Draggable draggableId={deal.id} index={idx} key={deal.id}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 hover:shadow-md transition-shadow cursor-pointer bg-white relative ${snapshot.isDragging ? 'opacity-70' : ''}`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm leading-tight">{deal.title}</span>
                                  <Badge className="text-xs">{deal.type}</Badge>
                                </div>
                                <div className="text-xs text-gray-600">{deal.company}</div>
                                <div className="text-xs text-gray-600">${deal.value.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{deal.assignee}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {getPriorityStars(deal.priority)}
                                </div>
                                <div className="text-xs text-gray-500">{deal.description}</div>
                                {!snapshot.isDragging && (
                                  <Button size="icon" variant="ghost" className="absolute bottom-2 right-2" onClick={e => { e.stopPropagation(); handleEditClick(deal); }}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                )}
                                {loadingDealId === deal.id && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg z-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
