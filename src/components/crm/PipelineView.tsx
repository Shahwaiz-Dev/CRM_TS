// Fixed PipelineView component with smooth drag and drop

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Loader2, Filter, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { KanbanSkeleton } from '@/components/ui/KanbanSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { t } = useLanguage();
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
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    stage: 'all',
    assignee: 'all',
    minValue: '',
    maxValue: '',
    search: ''
  });

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
    
    // If dropped outside or no destination, the library will automatically revert
    // the visual position, so we just return without any state changes
    if (!destination) {
      return;
    }
    
    // Same position, no change needed
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
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
        // Revert on error by refetching
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

  const getAssigneeAvatar = (assignee: string) => assignee?.trim()?.charAt(0)?.toUpperCase() || 'A';

  const getFilteredDeals = () => {
    return deals.filter(deal => {
      // Stage filter
      if (filters.stage !== 'all' && deal.stage !== filters.stage) return false;
      
      // Assignee filter
      if (filters.assignee !== 'all' && deal.assignee !== filters.assignee) return false;
      
      // Value range filter
      if (filters.minValue && deal.value < Number(filters.minValue)) return false;
      if (filters.maxValue && deal.value > Number(filters.maxValue)) return false;
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${deal.title} ${deal.company} ${deal.assignee} ${deal.type}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  };

  const getStageDeals = (stageName: string) => getFilteredDeals().filter(d => d.stage === stageName);
  const getStageTotal = (stageName: string) => getStageDeals(stageName).reduce((sum, d) => sum + (d.value || 0), 0);
  const getMaxStageTotal = () => Math.max(...stageNames.map(getStageTotal), 1);

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

  if (dataLoading) {
    return (
      <motion.div
        className="p-4 md:p-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <KanbanSkeleton columns={6} cardsPerColumn={3} />
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{t('sales_pipeline')}</h1>
        <div className="text-xl font-bold text-green-600">{t('total')}: ${getTotalValue().toLocaleString()}</div>
      </div>
      
      <div className="flex items-center mb-6">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-6 py-2 text-lg shadow mr-4">
              <Plus className="w-5 h-5" /> {t('add_deal')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_new_deal')}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Input placeholder={t('title')} value={newDeal.title} onChange={e => setNewDeal(d => ({ ...d, title: e.target.value }))} />
              <Input placeholder={t('company')} value={newDeal.company} onChange={e => setNewDeal(d => ({ ...d, company: e.target.value }))} />
              <Input placeholder={t('value')} type="number" value={newDeal.value} onChange={e => setNewDeal(d => ({ ...d, value: Number(e.target.value) }))} />
              <Input placeholder={t('type')} value={newDeal.type} onChange={e => setNewDeal(d => ({ ...d, type: e.target.value }))} />
              <Input placeholder={t('assignee')} value={newDeal.assignee} onChange={e => setNewDeal(d => ({ ...d, assignee: e.target.value }))} />
              <Input placeholder={t('description')} value={newDeal.description} onChange={e => setNewDeal(d => ({ ...d, description: e.target.value }))} />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={async () => { await handleAddDeal(); setShowAdd(false); }} disabled={dataLoading}>
                  {dataLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t('save')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>{t('cancel')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showFilter} onOpenChange={setShowFilter}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="gap-2">
              <Filter className="w-5 h-5" /> {t('filter')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('filter_deals')}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input 
                placeholder={t('search_deals')} 
                value={filters.search} 
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('stage')}</label>
                  <Select value={filters.stage} onValueChange={val => setFilters(f => ({ ...f, stage: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('all_stages')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_stages')}</SelectItem>
                      {stageNames.map(stage => (
                        <SelectItem key={stage} value={stage}>{t(`stage_${stage.toLowerCase().replace(/ /g, '_')}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('assignee')}</label>
                  <Select value={filters.assignee} onValueChange={val => setFilters(f => ({ ...f, assignee: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('all_assignees')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_assignees')}</SelectItem>
                      {Array.from(new Set(deals.map(d => d.assignee).filter(Boolean))).map(assignee => (
                        <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('min_value')}</label>
                  <Input 
                    type="number" 
                    placeholder={t('min_value')} 
                    value={filters.minValue} 
                    onChange={e => setFilters(f => ({ ...f, minValue: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('max_value')}</label>
                  <Input 
                    type="number" 
                    placeholder={t('max_value')} 
                    value={filters.maxValue} 
                    onChange={e => setFilters(f => ({ ...f, maxValue: e.target.value }))} 
                  />
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    stage: 'all',
                    assignee: 'all',
                    minValue: '',
                    maxValue: '',
                    search: ''
                  })}
                >
                  {t('clear_filters')}
                </Button>
                <Button onClick={() => setShowFilter(false)}>{t('apply_filters')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('edit_deal')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input placeholder={t('title')} value={editDealData.title} onChange={e => setEditDealData(d => ({ ...d, title: e.target.value }))} />
            <Input placeholder={t('company')} value={editDealData.company} onChange={e => setEditDealData(d => ({ ...d, company: e.target.value }))} />
            <Input placeholder={t('value')} type="number" value={editDealData.value} onChange={e => setEditDealData(d => ({ ...d, value: Number(e.target.value) }))} />
            <Input placeholder={t('type')} value={editDealData.type} onChange={e => setEditDealData(d => ({ ...d, type: e.target.value }))} />
            <Input placeholder={t('assignee')} value={editDealData.assignee} onChange={e => setEditDealData(d => ({ ...d, assignee: e.target.value }))} />
            <Input placeholder={t('description')} value={editDealData.description} onChange={e => setEditDealData(d => ({ ...d, description: e.target.value }))} />
            <Input placeholder={t('priority')} type="number" min={1} max={3} value={editDealData.priority} onChange={e => setEditDealData(d => ({ ...d, priority: Math.max(1, Math.min(3, Number(e.target.value))) }))} />
            <select className="border rounded px-2 py-1" value={editDealData.stage} onChange={e => setEditDealData(d => ({ ...d, stage: e.target.value }))}>
              {stageNames.map(stage => (
                <option key={stage} value={stage}>{t(`stage_${stage.toLowerCase().replace(/ /g, '_')}`)}</option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={async () => { await handleEditDeal(); setShowEdit(false); }} disabled={dataLoading}>
                {dataLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('save')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowEdit(false)}>{t('cancel')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDealId} onOpenChange={(open) => !open && setDeleteDealId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_deal')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('delete_deal_confirmation')}</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="destructive" 
              onClick={() => deleteDealId && handleDeleteDeal(deleteDealId)}
              disabled={dataLoading}
            >
              {dataLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('delete')}
            </Button>
            <Button variant="outline" onClick={() => setDeleteDealId(null)}>{t('cancel')}</Button>
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
                        <span className="font-semibold text-lg text-gray-900">{t(`stage_${stage.toLowerCase().replace(/ /g, '_')}`)}</span>
                        <span className="text-gray-500 text-sm font-semibold">${stageTotal.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.round((stageTotal / maxTotal) * 100)}%` }}></div>
                      </div>
                    </div>

                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 bg-white rounded-b-lg border border-t-0 transition-colors duration-200 min-h-[400px] ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`}
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
                                  className={`relative bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing group ${
                                    snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-400 ring-opacity-50' : ''
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    minHeight: 120,
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
    </motion.div>
  );
}