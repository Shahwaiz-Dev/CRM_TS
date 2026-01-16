import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, User, MoreHorizontal, MessageSquare, Clock, GripVertical, CheckCircle2, Edit, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useAppSelector } from "@/store/hooks";
import { addSprint, getFileUrl } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/store/slices/languageSlice';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LabelBadge } from './labels/LabelBadge';

// --- Create Sprint Modal ---
export function CreateSprintModal({ onSprintCreated, children }: { onSprintCreated: () => void, children: React.ReactNode }) {
    const { t } = useTranslation();
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

export const SprintColumn = ({ title, status, tickets, onTicketClick, allLabels, users, isBulkMode, selectedTicketIds, onToggleSelection, isEditable, onEdit, onDelete, index, columnId }: any) => {
    return (
        <Draggable draggableId={columnId} index={index} isDragDisabled={!isEditable}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex flex-col gap-3 min-w-[280px] w-full max-w-xs h-full max-h-full"
                >
                    <div
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between px-1 shrink-0 cursor-grab active:cursor-grabbing"
                    >
                        <h3 className="font-semibold text-muted-foreground text-sm flex items-center gap-2">
                            {title}
                            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{tickets.length}</span>
                        </h3>
                        {isEditable ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={onEdit}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Column
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                                        <Trash className="w-4 h-4 mr-2" />
                                        Delete Column
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        )}

                    </div>

                    <Droppable droppableId={status} type="TICKET">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`flex flex-col gap-2 min-h-[200px] overflow-y-auto flex-1 pr-1 custom-scrollbar bg-muted/30 rounded-xl p-3 border ${snapshot.isDraggingOver ? 'border-primary bg-primary/5 shadow-lg transition-all duration-200' : 'border-border transition-colors duration-200'
                                    }`}
                            >
                                {tickets.map((ticket: any, index: number) => (
                                    <SprintCard
                                        key={ticket.id}
                                        ticket={ticket}
                                        index={index}
                                        onClick={() => onTicketClick(ticket)}
                                        allLabels={allLabels}
                                        users={users}
                                        isBulkMode={isBulkMode}
                                        isSelected={selectedTicketIds?.includes(ticket.id)}
                                        onToggleSelection={onToggleSelection}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </Draggable>
    );
};

export const SprintCard = ({ ticket, index, onClick, allLabels, users, isBulkMode, isSelected, onToggleSelection }: any) => {
    const assigneeUser = users?.find((u: any) => u.name === ticket.assignee);
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
                    className="py-1 outline-none"
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    <div
                        onClick={() => isBulkMode ? onToggleSelection(ticket.id) : onClick()}
                        className={`group bg-card p-3 rounded-lg shadow-sm border cursor-pointer relative ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary ring-opacity-50 z-50' : 'border-border hover:shadow-md hover:border-primary transition-all duration-200'
                            } ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''} ${isBulkMode ? 'scale-[0.98]' : ''}`}
                    >
                        {/* Bulk Selection Checkbox */}
                        {isBulkMode && (
                            <div className="absolute left-3 top-3 z-10">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'bg-card border-border'}`}>
                                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                            </div>
                        )}

                        {/* Drag Handle */}
                        {!isBulkMode && (
                            <div
                                {...provided.dragHandleProps}
                                className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}

                        <div className={`flex justify-between items-start mb-2 ${isBulkMode ? 'ml-8' : 'ml-6'}`}>
                            <span className="text-xs font-medium text-muted-foreground font-mono">{ticket.key || `#${ticket.id.slice(0, 4)}`}</span>
                            <div className="flex items-center gap-2">
                                {/* Assignee Avatar */}
                                {ticket.assignee ? (
                                    <Avatar className="h-5 w-5">
                                        {assigneeUser?.photoURL && <AvatarImage src={getFileUrl(assigneeUser.photoURL)} className="object-cover" />}
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                            {ticket.assignee.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <User className="h-3 w-3 text-muted" />
                                )}
                            </div>
                        </div>

                        <h4 className={`font-medium text-foreground text-sm mb-1 leading-snug group-hover:text-primary break-words ${isBulkMode ? 'ml-8' : 'ml-6'}`}>
                            {ticket.title}
                        </h4>

                        {/* Description Preview */}
                        {ticket.description && (
                            <p className={`text-xs text-muted-foreground mb-2 leading-relaxed break-words ${isBulkMode ? 'ml-8' : 'ml-6'}`}>
                                {ticket.description}
                            </p>
                        )}

                        {/* Labels Display */}
                        {ticket.labelIds && ticket.labelIds.length > 0 && (
                            <div className={`flex flex-wrap gap-1 mb-3 ${isBulkMode ? 'ml-8' : 'ml-6'}`}>
                                {ticket.labelIds.map((id: string) => {
                                    const label = allLabels?.find((l: any) => l.id === id);
                                    if (!label) return null;
                                    return <LabelBadge key={id} label={label} />;
                                })}
                            </div>
                        )}

                        <div className={`flex items-center justify-between mt-auto ${isBulkMode ? 'ml-8' : 'ml-6'}`}>
                            <Badge variant="outline" className={`text-[10px] border px-1.5 py-0 font-normal ${priorityColor}`}>
                                {ticket.priority}
                            </Badge>

                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                <MessageSquare className="h-3 w-3" />
                                <span>{ticket.commentCount || 0}</span>
                            </div>
                            {ticket.estimatedTime && (
                                <div className="flex items-center gap-1 text-muted-foreground text-xs ml-2">
                                    <Clock className="h-3 w-3" />
                                    <span>{ticket.estimatedTime}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};
