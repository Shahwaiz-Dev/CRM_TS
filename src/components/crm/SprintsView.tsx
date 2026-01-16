import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar as CalendarIcon, Filter, Layers, ChevronRight, CheckCircle2, Tag, Loader2 } from 'lucide-react';
import { CreateSprintModal, SprintColumn } from './SprintComponents';
import { TicketDetailView } from './TicketDetailView';
import { getSprints, getTickets, updateTicket, addTicket as addTicketApi, getUsers, getLabels, getFileUrl } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchSprints, fetchTickets, createSprint, createTicket, modifyTicket, setSelectedSprintId, removeSprint } from "@/store/slices/sprintTicketsSlice";
import { fetchColumns, createColumn, modifyColumn, removeColumn, updateColumnOrder } from "@/store/slices/columnSlice";
import { useTranslation } from "@/store/slices/languageSlice";
import { format } from 'date-fns';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { SprintListSkeleton, KanbanBoardSkeleton, SprintHeaderSkeleton } from './SprintSkeletons';
import { LabelSelector } from './labels/LabelSelector';
import { LabelManager } from './labels/LabelManager';
import { TemplateSelector } from './templates/TemplateSelector';
import { TemplateManager } from './templates/TemplateManager';
import { FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User } from 'lucide-react';

import { Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function SprintsView() {
    const dispatch = useAppDispatch();
    const sprints = useAppSelector((state) => state.sprintTickets.sprints);
    const tickets = useAppSelector((state) => state.sprintTickets.tickets);
    const selectedSprintId = useAppSelector((state) => state.sprintTickets.selectedSprintId);
    const loading = useAppSelector((state) => state.sprintTickets.loading);
    const sprintsLoading = useAppSelector((state) => state.sprintTickets.sprintsLoading);
    const columns = useAppSelector((state) => state.columns.columns);
    const columnsLoading = useAppSelector((state) => state.columns.loading);
    const selectedSprint = sprints.find(s => s.id === selectedSprintId);

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
    const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
    const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
    const user = useAppSelector((state) => state.auth.user);
    const { t } = useTranslation();

    const [allLabels, setAllLabels] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        search: '',
        priority: 'All',
        assignee: 'All',
        labels: [] as string[]
    });
    const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);

    // Create Ticket Data
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assignee: '',
        estimatedTime: '',
        labelIds: [] as string[]
    });

    const [users, setUsers] = useState<any[]>([]);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<any>(null);
    const [columnFormData, setColumnFormData] = useState({ title: '', status: '', order: 0 });


    useEffect(() => {
        dispatch(fetchSprints());
        dispatch(fetchColumns());
        loadUsers();
        loadLabels();
    }, [dispatch]);

    const loadLabels = async () => {
        try {
            const data = await getLabels();
            setAllLabels(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    };

    useEffect(() => {
        if (selectedSprintId) {
            dispatch(fetchTickets(selectedSprintId));
        }
    }, [selectedSprintId, dispatch]);

    const loadSprints = async () => {
        dispatch(fetchSprints());
    };

    const loadTickets = async (sprintId: string) => {
        dispatch(fetchTickets(sprintId));
    };

    const handleApplyTemplate = (template: any) => {
        setNewTicket({
            ...newTicket,
            title: template.defaultTitle || '',
            description: template.defaultDescription || '',
            priority: template.defaultPriority || 'Medium'
        });
    };

    const handleCreateTicket = async () => {
        if (!newTicket.title || !selectedSprintId) return;
        setIsCreatingTicket(true);
        try {
            await dispatch(createTicket({
                ...newTicket,
                sprintId: selectedSprintId,
                status: columns[0]?.status || 'Todo',
                commentCount: 0
            })).unwrap();
            setIsTicketDialogOpen(false);
            setNewTicket({
                title: '',
                description: '',
                priority: 'Medium',
                assignee: '',
                estimatedTime: '',
                labelIds: []
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreatingTicket(false);
        }
    };

    const reorder = (list: any[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const handleBulkUpdate = async (data: any) => {
        try {
            await Promise.all(selectedTicketIds.map(id => updateTicket(id, data)));
            if (selectedSprintId) dispatch(fetchTickets(selectedSprintId));
            setSelectedTicketIds([]);
            setIsBulkMode(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedTicketIds.length} tickets?`)) return;
        try {
            // Soft delete by moving to a dummy sprint or just actual delete if API supports it
            await Promise.all(selectedTicketIds.map(id => updateTicket(id, { sprintId: 'deleted' })));
            if (selectedSprintId) dispatch(fetchTickets(selectedSprintId));
            setSelectedTicketIds([]);
            setIsBulkMode(false);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleTicketSelection = (id: string) => {
        setSelectedTicketIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const calculateNewPosition = (items: any[], index: number) => {
        const getPos = (item: any) => item.position !== undefined ? item.position : item.order || 0;

        if (items.length === 0) return 1000;
        if (index === 0) return getPos(items[0]) / 2;
        if (index >= items.length) return getPos(items[items.length - 1]) + 1000;
        const prev = getPos(items[index - 1]);
        const next = getPos(items[index]);
        return (prev + next) / 2;
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Column Reordering
        if (type === 'COLUMN') {
            // Sort columns by order first to ensure correct index calculations
            const sortedColumns = [...columns].sort((a, b) => (a.order || 0) - (b.order || 0));

            // draggableId is now the column's id field
            const remainingColumns = sortedColumns
                .filter(c => c.id !== draggableId)
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            const newOrder = calculateNewPosition(remainingColumns, destination.index);

            // IMMEDIATE optimistic update - dispatch synchronous action BEFORE async call
            dispatch(updateColumnOrder({ id: draggableId, order: newOrder }));

            // Then persist to backend (no await needed - UI already updated)
            dispatch(modifyColumn({
                id: draggableId,
                data: { order: newOrder }
            })).unwrap().catch((error) => {
                console.error(error);
                // Refetch on error to revert optimistic update
                dispatch(fetchColumns());
            });

            return;
        }

        // Ticket Reordering
        const ticket = tickets.find(t => t.id === draggableId);
        if (!ticket) return;

        // Get all tickets in the destination column, sorted by position
        const destColumnTickets = tickets
            .filter(t => t.status === destination.droppableId && t.id !== draggableId)
            .sort((a, b) => (a.position || 0) - (b.position || 0));

        const newPosition = calculateNewPosition(destColumnTickets, destination.index);
        const newStatus = destination.droppableId;

        try {
            await dispatch(modifyTicket({
                id: draggableId,
                data: { status: newStatus, position: newPosition },
                sprintId: selectedSprintId!
            })).unwrap();
        } catch (error) {
            console.error(error);
            dispatch(fetchTickets(selectedSprintId!));
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            ticket.description?.toLowerCase().includes(filters.search.toLowerCase());
        const matchesPriority = filters.priority === 'All' || ticket.priority === filters.priority;
        const matchesAssignee = filters.assignee === 'All' || ticket.assignee === filters.assignee;
        const matchesLabels = filters.labels.length === 0 ||
            (ticket.labelIds && filters.labels.every((id: string) => ticket.labelIds.includes(id)));

        return matchesSearch && matchesPriority && matchesAssignee && matchesLabels;
    }).sort((a, b) => (a.position || 0) - (b.position || 0));

    const handleDeleteColumn = async (id: string) => {
        if (!confirm('Are you sure you want to delete this column? Tickets in this column will be hidden unless you re-create a column with the same status.')) return;
        try {
            await dispatch(removeColumn(id)).unwrap();
        } catch (error) {
            console.error(error);
        }
    };

    const handleColumnSubmit = async () => {
        if (!columnFormData.title || !columnFormData.status) return;
        try {
            if (editingColumn) {
                await dispatch(modifyColumn({ id: editingColumn.id, data: columnFormData })).unwrap();
            } else {
                await dispatch(createColumn({ ...columnFormData, order: columns.length })).unwrap();
            }
            setIsColumnModalOpen(false);
            setEditingColumn(null);
            setColumnFormData({ title: '', status: '', order: 0 });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (editingColumn) {
            setColumnFormData({
                title: editingColumn.title,
                status: editingColumn.status,
                order: editingColumn.order
            });
        } else {
            setColumnFormData({ title: '', status: '', order: 0 });
        }
    }, [editingColumn]);


    const ticketsByStatus = columns.reduce((acc, column) => {
        acc[column.status] = filteredTickets.filter(t => t.status === column.status);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">
            {/* Sidebar - Sprint List */}
            <div className="w-64 bg-background border-r flex flex-col hidden md:flex">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-600" />
                            Sprints
                        </h2>
                        {user?.role === 'admin' && (
                            <CreateSprintModal onSprintCreated={loadSprints}>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </CreateSprintModal>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sprintsLoading ? (
                        <SprintListSkeleton />
                    ) : (
                        <>
                            {sprints.map(sprint => (
                                <button
                                    key={sprint.id}
                                    onClick={() => dispatch(setSelectedSprintId(sprint.id))}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedSprintId === sprint.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    <div className="truncate">
                                        <div className="truncate">{sprint.name}</div>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {sprint.startDate && sprint.endDate ? (
                                                <span>
                                                    {sprint.startDate}
                                                    <span className="ml-1">
                                                        -{sprint.endDate.split('-').slice(1).join('-')}
                                                    </span>
                                                </span>
                                            ) : (
                                                sprint.endDate || sprint.startDate || 'No date'
                                            )}
                                        </div>
                                    </div>
                                    {selectedSprint?.id === sprint.id && <ChevronRight className="w-4 h-4 opacity-50" />}
                                </button>
                            ))}
                            {sprints.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    No sprints found. <br /> Create one to get started.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Main Content - Kanban Board */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedSprint ? (
                    <>
                        {/* Header */}
                        {sprintsLoading ? (
                            <SprintHeaderSkeleton />
                        ) : (
                            <div className="h-16 border-b bg-background flex items-center justify-between px-6 shrink-0 z-10">
                                <div>
                                    <h1 className="text-xl font-bold flex items-center gap-2">
                                        {selectedSprint.name}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-normal border ${selectedSprint.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            {selectedSprint.status}
                                        </span>
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-xl">{selectedSprint.goal}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2 mr-2">
                                        {users.slice(0, 5).map(u => (
                                            <Avatar key={u.id} className="w-8 h-8 border-2 border-white">
                                                {u.photoURL && <AvatarImage src={getFileUrl(u.photoURL)} className="object-cover" />}
                                                <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600">
                                                    {u.name?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {users.length > 5 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 z-10">
                                                +{users.length - 5}
                                            </div>
                                        )}
                                    </div>

                                    <Dialog open={isLabelManagerOpen} onOpenChange={setIsLabelManagerOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" title="Manage Labels">
                                                <Tag className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Labels Management</DialogTitle>
                                            </DialogHeader>
                                            <LabelManager />
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={isTemplateManagerOpen} onOpenChange={setIsTemplateManagerOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" title="Manage Templates">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Ticket Templates Management</DialogTitle>
                                            </DialogHeader>
                                            <TemplateManager />
                                        </DialogContent>
                                    </Dialog>

                                    {user?.role === 'admin' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this sprint?')) {
                                                    dispatch(removeSprint(selectedSprint.id));
                                                }
                                            }}
                                            className="text-muted-foreground hover:text-destructive"
                                            title="Delete Sprint"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}

                                    <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="gap-2">
                                                <Plus className="w-4 h-4" /> Add Ticket
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader className="flex flex-row items-center justify-between">
                                                <DialogTitle>Create New Ticket</DialogTitle>
                                                <div className="mr-8">
                                                    <TemplateSelector onSelect={handleApplyTemplate} />
                                                </div>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label>Title</Label>
                                                    <Input value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })} placeholder="What needs to be done?" />
                                                </div>
                                                <div>
                                                    <Label>Description</Label>
                                                    <Textarea value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} placeholder="Add details..." />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Priority</Label>
                                                        <Select value={newTicket.priority} onValueChange={v => setNewTicket({ ...newTicket, priority: v })}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="High">High</SelectItem>
                                                                <SelectItem value="Medium">Medium</SelectItem>
                                                                <SelectItem value="Low">Low</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Assignee</Label>
                                                        <Select value={newTicket.assignee} onValueChange={v => setNewTicket({ ...newTicket, assignee: v })}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select user" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {users.map((u: any) => (
                                                                    <SelectItem key={u.id} value={u.email || u.name}>
                                                                        {u.name} ({u.role})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label>Labels</Label>
                                                        <LabelSelector
                                                            selectedLabelIds={newTicket.labelIds}
                                                            onChange={ids => setNewTicket({ ...newTicket, labelIds: ids })}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Label>Time Estimate</Label>
                                                        <Input value={newTicket.estimatedTime} onChange={e => setNewTicket({ ...newTicket, estimatedTime: e.target.value })} placeholder="e.g. 2h, 4h 30m" />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleCreateTicket} disabled={isCreatingTicket}>
                                                    {isCreatingTicket ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    {isCreatingTicket ? "Creating..." : "Create Ticket"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3 p-4 border-b bg-background">
                            <div className="relative flex-1 min-w-[180px] max-w-full sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-10 h-9"
                                    placeholder="Search tickets..."
                                    value={filters.search}
                                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Select value={filters.priority} onValueChange={v => setFilters({ ...filters, priority: v })}>
                                    <SelectTrigger className="w-auto min-w-[110px] h-9 text-xs">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <Filter className="w-3 h-3" />
                                            <SelectValue placeholder="Priority" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Priority</SelectItem>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={filters.assignee} onValueChange={v => setFilters({ ...filters, assignee: v })}>
                                    <SelectTrigger className="w-auto min-w-[130px] h-9 text-xs">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <User className="w-3 h-3" />
                                            <SelectValue placeholder="Assignee" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Assignees</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.email}>{u.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9 gap-2 whitespace-nowrap">
                                            <Tag className="w-3 h-3" />
                                            <span className="text-xs">Labels {filters.labels.length > 0 && `(${filters.labels.length})`}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0" align="end">
                                        <div className="p-2">
                                            <div className="flex items-center justify-between mb-2 px-2">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Filter Labels</span>
                                                {filters.labels.length > 0 && (
                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => setFilters({ ...filters, labels: [] })}>
                                                        Clear
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                {allLabels.map(label => (
                                                    <div
                                                        key={label.id}
                                                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer"
                                                        onClick={() => {
                                                            const newLabels = filters.labels.includes(label.id)
                                                                ? filters.labels.filter(id => id !== label.id)
                                                                : [...filters.labels, label.id];
                                                            setFilters({ ...filters, labels: newLabels });
                                                        }}
                                                    >
                                                        <div
                                                            className={`w-3 h-3 rounded-full border ${filters.labels.includes(label.id) ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                                                            style={{ backgroundColor: label.color }}
                                                        />
                                                        <span className="text-sm flex-1">{label.name}</span>
                                                        {filters.labels.includes(label.id) && <CheckCircle2 className="w-3 h-3 text-primary" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {(filters.search || filters.priority !== 'All' || filters.assignee !== 'All' || filters.labels.length > 0) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-3 text-xs text-muted-foreground hover:text-destructive whitespace-nowrap"
                                        onClick={() => setFilters({ search: '', priority: 'All', assignee: 'All', labels: [] })}
                                    >
                                        Reset
                                    </Button>
                                )}
                                <Separator orientation="vertical" className="h-6 mx-2" />
                                <Button
                                    variant={isBulkMode ? "default" : "outline"}
                                    size="sm"
                                    className="h-9 gap-2 whitespace-nowrap"
                                    onClick={() => {
                                        setIsBulkMode(!isBulkMode);
                                        setSelectedTicketIds([]);
                                    }}
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {isBulkMode ? "Exit Bulk Mode" : "Bulk Actions"}
                                </Button>
                            </div>
                        </div>

                        {isBulkMode && selectedTicketIds.length > 0 && (
                            <div className="bg-blue-600 text-white px-6 py-2 flex items-center justify-between animate-in slide-in-from-top duration-200">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-sm">{selectedTicketIds.length} tickets selected</span>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 h-8" onClick={() => handleBulkUpdate({ status: 'Todo' })}>To Do</Button>
                                        <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 h-8" onClick={() => handleBulkUpdate({ status: 'InProgress' })}>In Progress</Button>
                                        <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 h-8" onClick={() => handleBulkUpdate({ status: 'Done' })}>Done</Button>
                                    </div>
                                    <Separator orientation="vertical" className="h-4 bg-blue-400" />
                                    <Select onValueChange={v => handleBulkUpdate({ priority: v })}>
                                        <SelectTrigger className="h-8 bg-blue-700 border-none text-white w-32">
                                            <SelectValue placeholder="Set Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button variant="ghost" size="sm" className="text-white hover:bg-red-500 h-8 gap-2" onClick={handleBulkDelete}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                </Button>
                            </div>
                        )}

                        {/* Board */}
                        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 pb-8">
                            {loading ? (
                                <KanbanBoardSkeleton />
                            ) : (
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="board" direction="horizontal" type="COLUMN">
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="flex h-full gap-6 min-w-max"
                                            >
                                                {[...columns].sort((a, b) => (a.order || 0) - (b.order || 0)).map((column, index) => (
                                                    <SprintColumn
                                                        key={column.id}
                                                        columnId={column.id}
                                                        title={column.title}
                                                        status={column.status}
                                                        tickets={ticketsByStatus[column.status] || []}
                                                        onTicketClick={(ticket: any) => setSelectedTicketId(ticket.id)}
                                                        allLabels={allLabels}
                                                        users={users}
                                                        isBulkMode={isBulkMode}
                                                        selectedTicketIds={selectedTicketIds}
                                                        onToggleSelection={toggleTicketSelection}
                                                        isEditable={user?.role === 'admin'}
                                                        onEdit={() => {
                                                            setEditingColumn(column);
                                                            setIsColumnModalOpen(true);
                                                        }}
                                                        onDelete={() => handleDeleteColumn(column.id)}
                                                        index={index}
                                                    />
                                                ))}
                                                {provided.placeholder}

                                                {user?.role === 'admin' && (
                                                    <div className="min-w-[280px] w-full max-w-xs h-full flex items-start pt-11">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full border-dashed border-2 h-12 text-muted-foreground hover:text-primary hover:border-primary transition-all"
                                                            onClick={() => {
                                                                setEditingColumn(null);
                                                                setIsColumnModalOpen(true);
                                                            }}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" />
                                                            Add Column
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>

                                </DragDropContext>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a sprint to view the board
                    </div>
                )}
            </div>

            <TicketDetailView
                ticket={selectedTicket}
                open={!!selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
                onUpdate={() => {
                    // Updates are now handled by Redux for a silent experience
                }}
            />

            {/* Column Modal */}
            <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingColumn ? 'Edit Column' : 'Add New Column'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input
                                id="title"
                                value={columnFormData.title}
                                onChange={(e) => setColumnFormData({ ...columnFormData, title: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g. QA Review"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status ID</Label>
                            <Input
                                id="status"
                                value={columnFormData.status}
                                onChange={(e) => setColumnFormData({ ...columnFormData, status: e.target.value })}
                                className="col-span-3"
                                placeholder="e.g. QA (Must be unique)"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsColumnModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleColumnSubmit}>{editingColumn ? 'Save Changes' : 'Create Column'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    );
}
