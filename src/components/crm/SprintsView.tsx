import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar as CalendarIcon, Filter, Layers, ChevronRight, CheckCircle2 } from 'lucide-react';
import { CreateSprintModal, SprintColumn } from './SprintComponents';
import { TicketDetailView } from './TicketDetailView';
import { getSprints, getTickets, updateTicket, addTicket as addTicketApi, getUsers } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { SprintListSkeleton, KanbanBoardSkeleton, SprintHeaderSkeleton } from './SprintSkeletons';

export function SprintsView() {
    const [sprints, setSprints] = useState<any[]>([]);
    const [selectedSprint, setSelectedSprint] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sprintsLoading, setSprintsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
    const { user } = useAuth();
    const { t } = useLanguage();

    // Create Ticket Data
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assignee: '',
        estimatedTime: ''
    });

    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        loadSprints();
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    };

    useEffect(() => {
        if (selectedSprint) {
            loadTickets(selectedSprint.id);
        }
    }, [selectedSprint]);

    const loadSprints = async () => {
        setSprintsLoading(true);
        try {
            const data = await getSprints();
            setSprints(data);
            if (data.length > 0 && !selectedSprint) {
                setSelectedSprint(data[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSprintsLoading(false);
        }
    };

    const loadTickets = async (sprintId: string) => {
        setLoading(true);
        try {
            const data = await getTickets(sprintId);
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.title || !selectedSprint) return;
        try {
            await addTicketApi({
                ...newTicket,
                sprintId: selectedSprint.id,
                status: 'ToDo',
                commentCount: 0
            });
            setIsTicketDialogOpen(false);
            setNewTicket({ title: '', description: '', priority: 'Medium', assignee: '', estimatedTime: '' });
            loadTickets(selectedSprint.id);
        } catch (error) {
            console.error(error);
        }
    };

    const reorder = (list: any[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        // If dropped outside or no destination
        if (!destination) {
            return;
        }

        // Same position, no change needed
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        // Reordering within the same column
        if (destination.droppableId === source.droppableId) {
            const statusTickets = tickets.filter(t => t.status === source.droppableId);
            const otherTickets = tickets.filter(t => t.status !== source.droppableId);
            const reordered = reorder(statusTickets, source.index, destination.index);

            // Combine tickets maintaining proper order
            const newTickets = [...otherTickets, ...reordered];
            setTickets(newTickets);
            return; // No DB update needed for reordering
        }

        // Moving to a different column
        const newStatus = destination.droppableId;
        const ticket = tickets.find(t => t.id === draggableId);
        if (!ticket) return;

        // Remove from source
        const sourceTickets = tickets.filter(t => t.status === source.droppableId && t.id !== draggableId);
        const destTickets = tickets.filter(t => t.status === destination.droppableId);
        const otherTickets = tickets.filter(t => t.status !== source.droppableId && t.status !== destination.droppableId);

        // Update ticket status
        const updatedTicket = { ...ticket, status: newStatus };

        // Insert at destination index
        destTickets.splice(destination.index, 0, updatedTicket);

        // Combine all tickets
        const newTickets = [...otherTickets, ...sourceTickets, ...destTickets];
        setTickets(newTickets);

        try {
            await updateTicket(draggableId, { status: newStatus });
        } catch (error) {
            console.error(error);
            loadTickets(selectedSprint.id); // Revert on failure
        }
    };

    const ticketsByStatus = {
        ToDo: tickets.filter(t => t.status === 'ToDo'),
        InProgress: tickets.filter(t => t.status === 'InProgress'),
        Review: tickets.filter(t => t.status === 'Review'),
        Done: tickets.filter(t => t.status === 'Done'),
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
            {/* Sidebar - Sprint List */}
            <div className="w-64 bg-white border-r flex flex-col hidden md:flex">
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
                                    onClick={() => setSelectedSprint(sprint)}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedSprint?.id === sprint.id
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="truncate">
                                        <div className="truncate">{sprint.name}</div>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {sprint.endDate}
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
                            <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 z-10">
                                <div>
                                    <h1 className="text-xl font-bold flex items-center gap-2">
                                        {selectedSprint.name}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-normal border ${selectedSprint.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            {selectedSprint.status}
                                        </span>
                                    </h1>
                                    <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xl">{selectedSprint.goal}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2 mr-2">
                                        {/* Placeholder for team avatars */}
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                                        ))}
                                    </div>
                                    <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="gap-2">
                                                <Plus className="w-4 h-4" /> Add Ticket
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New Ticket</DialogTitle>
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
                                                        <Label>Time Estimate</Label>
                                                        <Input value={newTicket.estimatedTime} onChange={e => setNewTicket({ ...newTicket, estimatedTime: e.target.value })} placeholder="e.g. 2h, 4h 30m" />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleCreateTicket}>Create Ticket</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        )}

                        {/* Board */}
                        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 pb-8">
                            {loading ? (
                                <KanbanBoardSkeleton />
                            ) : (
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <div className="flex h-full gap-6 min-w-max">
                                        <SprintColumn title="To Do" status="ToDo" tickets={ticketsByStatus.ToDo} onTicketClick={setSelectedTicket} />
                                        <SprintColumn title="In Progress" status="InProgress" tickets={ticketsByStatus.InProgress} onTicketClick={setSelectedTicket} />
                                        <SprintColumn title="Review" status="Review" tickets={ticketsByStatus.Review} onTicketClick={setSelectedTicket} />
                                        <SprintColumn title="Done" status="Done" tickets={ticketsByStatus.Done} onTicketClick={setSelectedTicket} />
                                    </div>
                                </DragDropContext>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Select a sprint to view the board
                    </div>
                )}
            </div>

            <TicketDetailView
                ticket={selectedTicket}
                open={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onUpdate={() => selectedSprint && loadTickets(selectedSprint.id)}
            />
        </div>
    );
}
