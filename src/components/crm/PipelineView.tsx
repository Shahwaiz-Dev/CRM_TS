// Fixed PipelineView component with smooth drag and drop

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

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

const stageNames = ['Qualify', 'Meet & Present', 'Propose', 'Negotiate', 'Closed Won', 'Closed Lost'];

export function PipelineView() {
  const { user, loading } = useAuth();
  // Remove useAuth and Navigate imports and any role-checking logic at the top of the component.

  const [deals, setDeals] = useState<Deal[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDeal, setNewDeal] = useState({
    title: '',
    company: '',
    value: 0,
    stage: 'Qualify',
    priority: 1,
    assignee: '',
    type: '',
    avatar: '👤',
    description: ''
  });
  const [showAdd, setShowAdd] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [editDealData, setEditDealData] = useState(newDeal);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingDealId, setLoadingDealId] = useState<string | null>(null);
  const [deleteDealId, setDeleteDealId] = useState<string | null>(null);

  const fetchDeals = async () => {
    setDataLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'deals'));
      setDeals(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
    } catch (e: any) {
      setError(e.message || 'Failed to fetch deals');
    }
    setDataLoading(false);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleAddDeal = async () => {
    if (!newDeal.title || !newDeal.company) return;
    setDataLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'deals'), newDeal);
      setNewDeal({ ...newDeal, title: '', company: '', value: 0, assignee: '', type: '', description: '' });
      setShowAdd(false);
      fetchDeals();
    } catch (e: any) {
      setError(e.message || 'Failed to add deal');
    }
    setDataLoading(false);
  };

  const handleDeleteDeal = async (dealId: string) => {
    setDataLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'deals', dealId));
      setDeleteDealId(null);
      fetchDeals();
    } catch (e: any) {
      setError(e.message || 'Failed to delete deal');
    }
    setDataLoading(false);
  };

  const getTotalValue = () => deals.reduce((sum, d) => sum + (d.value || 0), 0);

  const reorder = (list: Deal[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside or no destination, do nothing
    if (!destination) {
      return;
    }
    
    // Same column reorder
    if (destination.droppableId === source.droppableId && destination.index !== source.index) {
      const stageDeals = getStageDeals(source.droppableId);
      const reordered = reorder(stageDeals, source.index, destination.index);
      setDeals(prev => {
        const others = prev.filter(d => d.stage !== source.droppableId);
        return [...others, ...reordered];
      });
      return;
    }
    
    // Different column move
    if (destination.droppableId !== source.droppableId) {
      const deal = deals.find(d => d.id === draggableId);
      if (!deal) return;
      
      // Optimistic update
      setDeals(prev => prev.map(d => 
        d.id === draggableId ? { ...d, stage: destination.droppableId } : d
      ));
      
      setLoadingDealId(deal.id);
      try {
        await updateDoc(doc(db, 'deals', deal.id), { stage: destination.droppableId });
      } catch (e: any) {
        setError(e.message || 'Failed to update deal');
        // Revert on error
        fetchDeals();
      } finally {
        setLoadingDealId(null);
      }
    }
  };

  const getPriorityStars = (priority: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`text-sm ${i < priority ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ));
  };

  const getStageDeals = (stageName: string) => deals.filter(d => d.stage === stageName);
  const getStageTotal = (stageName: string) => getStageDeals(stageName).reduce((sum, d) => sum + (d.value || 0), 0);
  const getMaxStageTotal = () => Math.max(...stageNames.map(getStageTotal), 1);
  const getAssigneeAvatar = (assignee: string) => assignee?.trim()?.charAt(0)?.toUpperCase() || 'A';

  const handleEditClick = (deal: Deal) => {
    setEditDeal(deal);
    const { id, description = '', ...rest } = deal;
    setEditDealData({ ...rest, description });
    setShowEdit(true);
  };

  const handleEditDeal = async () => {
    if (!editDeal) return;
    setDataLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'deals', editDeal.id), editDealData);
      setShowEdit(false);
      setEditDeal(null);
      fetchDeals();
    } catch (e: any) {
      setError(e.message || 'Failed to update deal');
    }
    setDataLoading(false);
  };

  return (
    <div className="p-6 md:p-10 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Sales Pipeline</h1>
        <div className="text-xl font-bold text-green-600">Total: ${getTotalValue().toLocaleString()}</div>
      </div>
      
      <div className="flex items-center mb-6">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-6 py-2 text-lg shadow mr-4">
              <Plus className="w-5 h-5" /> Add Deal
            </Button>
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
                <Button size="sm" onClick={async () => { await handleAddDeal(); setShowAdd(false); }} disabled={dataLoading}>
                  {dataLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

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
              <Button size="sm" onClick={async () => { await handleEditDeal(); setShowEdit(false); }} disabled={dataLoading}>
                {dataLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDealId} onOpenChange={(open) => !open && setDeleteDealId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this deal? This action cannot be undone.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="destructive" 
              onClick={() => deleteDealId && handleDeleteDeal(deleteDealId)}
              disabled={dataLoading}
            >
              {dataLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteDealId(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
          {stageNames.map(stage => {
            const stageTotal = getStageTotal(stage);
            const maxTotal = getMaxStageTotal();
            return (
              <Droppable droppableId={stage} key={stage}>
                {(provided, snapshot) => (
                  <div className="w-80 flex-shrink-0 flex flex-col h-full">
                    <div className="px-4 pt-4 pb-2 border-b bg-gray-50 rounded-t-lg border border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-lg text-gray-900">{stage}</span>
                        <span className="text-gray-500 text-sm font-semibold">${stageTotal.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.round((stageTotal / maxTotal) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 bg-white rounded-b-lg border border-t-0 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`}
                    >
                      <div className="p-2 h-full overflow-y-auto">
                        <div className="flex flex-col gap-3 min-h-full">
                          {getStageDeals(stage).map((deal, idx) => (
                            <Draggable draggableId={deal.id} index={idx} key={deal.id}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing group ${
                                    snapshot.isDragging ? 'shadow-lg transform rotate-2 z-50' : ''
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    minHeight: 120,
                                    transform: snapshot.isDragging 
                                      ? `${provided.draggableProps.style?.transform} rotate(5deg)` 
                                      : provided.draggableProps.style?.transform
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-base text-gray-900 truncate pr-2 flex-1">{deal.title}</span>
                                    <span className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-gray-700 flex-shrink-0">{getAssigneeAvatar(deal.assignee)}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mb-1">{deal.type} • {deal.company}</div>
                                  <div className="text-green-600 font-bold text-lg mb-1">${deal.value.toLocaleString()}</div>
                                  <div className="flex items-center gap-1 text-xs mb-1">{getPriorityStars(deal.priority)}</div>
                                  
                                  {/* Action Buttons */}
                                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8" 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        e.preventDefault(); 
                                        handleEditClick(deal); 
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-red-500 hover:text-red-700" 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        e.preventDefault(); 
                                        setDeleteDealId(deal.id); 
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  {loadingDealId === deal.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg z-10">
                                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}