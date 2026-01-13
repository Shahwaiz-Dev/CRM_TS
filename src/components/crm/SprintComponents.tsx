import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, User, MoreHorizontal, MessageSquare, Clock, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { addSprint } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Create Sprint Modal ---
export function CreateSprintModal({ onSprintCreated, children }: { onSprintCreated: () => void, children: React.ReactNode }) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        status: 'planned'
    });

    const handleSubmit = async () => {
        if (!formData.name || !formData.startDate || !formData.endDate) return;
        setLoading(true);
        try {
            await addSprint(formData);
            setOpen(false);
            onSprintCreated();
            setFormData({ name: '', goal: '', startDate: '', endDate: '', status: 'planned' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Sprint</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. Sprint 24"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="goal" className="text-right">Goal</Label>
                        <Textarea
                            id="goal"
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            className="col-span-3"
                            placeholder="Main objective..."
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start" className="text-right">Start</Label>
                        <Input
                            id="start"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end" className="text-right">End</Label>
                        <Input
                            id="end"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creating..." : "Create Sprint"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Kanban Components (using @hello-pangea/dnd for smooth animations) ---

import { Droppable, Draggable } from '@hello-pangea/dnd';

export const SprintColumn = ({ title, status, tickets, onTicketClick }: any) => {
    return (
        <Droppable droppableId={status}>
            {(provided, snapshot) => (
                <div className="flex flex-col gap-3 min-w-[280px] w-full max-w-xs h-full max-h-full">
                    <div className="flex items-center justify-between px-1 shrink-0">
                        <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                            {title}
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tickets.length}</span>
                        </h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </Button>
                    </div>

                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col gap-2 min-h-[200px] overflow-y-auto flex-1 pr-1 custom-scrollbar bg-gray-50/50 rounded-xl p-3 border transition-all duration-200 ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50/30 shadow-lg' : 'border-gray-100'
                            }`}
                    >
                        {tickets.map((ticket: any, index: number) => (
                            <SprintCard
                                key={ticket.id}
                                ticket={ticket}
                                index={index}
                                onClick={() => onTicketClick(ticket)}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                </div>
            )}
        </Droppable>
    );
};

export const SprintCard = ({ ticket, index, onClick }: any) => {
    const priorityColor = {
        High: "bg-red-50 text-red-600 border-red-100",
        Medium: "bg-yellow-50 text-yellow-600 border-yellow-100",
        Low: "bg-blue-50 text-blue-600 border-blue-100"
    }[ticket.priority as string] || "bg-gray-50 text-gray-600";

    return (
        <Draggable draggableId={ticket.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onClick={onClick}
                    className={`group bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-shadow duration-200 cursor-pointer relative ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-400 ring-opacity-50 rotate-2' : ''
                        }`}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    {/* Drag Handle */}
                    <div
                        {...provided.dragHandleProps}
                        className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex justify-between items-start mb-2 ml-6">
                        <span className="text-xs font-medium text-gray-500 font-mono">#{ticket.id.slice(0, 4)}</span>
                        <div className="flex items-center gap-2">
                            {/* Assignee Avatar */}
                            {ticket.assignee ? (
                                <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                                        {ticket.assignee.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <User className="h-3 w-3 text-gray-300" />
                            )}
                        </div>
                    </div>

                    <h4 className="font-medium text-gray-800 text-sm mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 ml-6">
                        {ticket.title}
                    </h4>

                    <div className="flex items-center justify-between mt-auto ml-6">
                        <Badge variant="outline" className={`text-[10px] border px-1.5 py-0 font-normal ${priorityColor}`}>
                            {ticket.priority}
                        </Badge>

                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            <span>{ticket.commentCount || 0}</span>
                        </div>
                        {ticket.estimatedTime && (
                            <div className="flex items-center gap-1 text-gray-400 text-xs ml-2">
                                <Clock className="h-3 w-3" />
                                <span>{ticket.estimatedTime}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};
