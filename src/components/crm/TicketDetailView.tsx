import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { addComment, getComments, updateTicket, getUsers, getFileUrl } from '@/lib/firebase';
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { format } from 'date-fns';
import { CommentsSkeleton, TicketDetailHeaderSkeleton } from './SprintSkeletons';
import { LabelSelector } from './labels/LabelSelector';
import { LabelBadge } from './labels/LabelBadge';
import { getLabels } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import { modifyTicket, removeTicket, incrementCommentCount, decrementCommentCount } from "@/store/slices/sprintTicketsSlice";
import { fetchColumns } from "@/store/slices/columnSlice";


import { isValid, parseISO } from 'date-fns';

const safeDateFormat = (dateInput: any, formatString: string) => {
    if (!dateInput) return '';
    try {
        let date;
        if (dateInput.seconds) {
            date = new Date(dateInput.seconds * 1000);
        } else if (typeof dateInput === 'string') {
            date = parseISO(dateInput);
        } else {
            date = new Date(dateInput);
        }

        if (isValid(date)) {
            return format(date, formatString);
        }
        return '';
    } catch (e) {
        return '';
    }
};


export function TicketDetailView({ ticket, open, onClose, onUpdate }: any) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [status, setStatus] = useState(ticket?.status || 'ToDo');
    const [editTitle, setEditTitle] = useState(ticket?.title || '');
    const [editDescription, setEditDescription] = useState(ticket?.description || '');
    const [isEditing, setIsEditing] = useState(false);
    const [sending, setSending] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [loadingTicket, setLoadingTicket] = useState(false);
    const [allLabels, setAllLabels] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const user = useAppSelector((state) => state.auth.user);
    const columns = useAppSelector((state) => state.columns.columns);
    const dispatch = useAppDispatch();

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (columns.length === 0) {
            dispatch(fetchColumns());
        }
    }, [dispatch]);


    useEffect(() => {
        if (ticket?.id) {
            setLoadingTicket(true);
            loadComments();
            loadLabelData();
            loadUsers();
            setStatus(ticket.status);
            setEditTitle(ticket.title);
            setEditDescription(ticket.description);
            setIsEditing(false);
            // Simulate slight delay for smooth transition
            setTimeout(() => setLoadingTicket(false), 300);
        }
    }, [ticket]);

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadLabelData = async () => {
        try {
            const data = await getLabels();
            setAllLabels(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Auto-scroll to bottom of comments
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments]);

    const loadComments = async () => {
        if (!ticket?.id) return;
        setLoadingComments(true);
        try {
            const data = await getComments(ticket.id);
            setComments(data);
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        setSending(true);
        try {
            await addComment({
                ticketId: ticket.id,
                userId: user?.id || 'anonymous',
                userName: user?.email || 'Anonymous', // Ideally use display name
                content: newComment,
                type: 'text'
            });
            setNewComment('');
            dispatch(incrementCommentCount(ticket.id));
            loadComments();
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
            if (onUpdate) onUpdate();
        }
    };

    const handleLabelsChange = async (newLabelIds: string[]) => {
        try {
            await dispatch(modifyTicket({
                id: ticket.id,
                data: { labelIds: newLabelIds },
                sprintId: ticket.sprintId
            })).unwrap();
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus);
        try {
            await dispatch(modifyTicket({
                id: ticket.id,
                data: { status: newStatus },
                sprintId: ticket.sprintId
            })).unwrap();

            // Add system comment
            await addComment({
                ticketId: ticket.id,
                userId: 'system',
                userName: 'System',
                content: `changed status to ${newStatus}`,
                type: 'system'
            });
            loadComments();
        } catch (error) {
            console.error(error);
            setStatus(ticket.status); // Revert on error
        }
    };

    const handleSave = async () => {
        try {
            await dispatch(modifyTicket({
                id: ticket.id,
                data: {
                    title: editTitle,
                    description: editDescription
                },
                sprintId: ticket.sprintId
            })).unwrap();
            setIsEditing(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this ticket?')) return;
        try {
            await dispatch(removeTicket(ticket.id)).unwrap();
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    if (!ticket) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                {/* Header */}
                {loadingTicket ? (
                    <TicketDetailHeaderSkeleton />
                ) : (
                    <div className="p-6 border-b bg-muted/30">
                        <div className="flex flex-col gap-4">
                            {/* Buttons row */}
                            <div className="flex justify-end items-center gap-2">
                                {!isEditing ? (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={handleDelete}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={handleSave}>
                                            <Save className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                            setIsEditing(false);
                                            setEditTitle(ticket.title);
                                            setEditDescription(ticket.description);
                                        }}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                                <Select value={status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columns.map(col => (
                                            <SelectItem key={col.id} value={col.status}>{col.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Title row */}
                            <div>
                                {isEditing ? (
                                    <Input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="text-lg font-semibold"
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-foreground break-words">{ticket.title}</p>
                                )}
                            </div>

                            <div className="mt-1">
                                {isEditing ? (
                                    <Textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="text-sm text-muted-foreground min-h-[100px] bg-card"
                                        placeholder="Add details..."
                                    />
                                ) : (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                        {ticket.description || "No description provided."}
                                    </p>
                                )}
                            </div>

                            {/* Labels prominent display */}
                            {ticket.labelIds && ticket.labelIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {ticket.labelIds.map((id: string) => {
                                        const label = allLabels.find(l => l.id === id);
                                        if (!label) return null;
                                        return <LabelBadge key={id} label={label} />;
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 text-xs text-muted-foreground mt-4">
                            <div className="flex items-center gap-2">
                                {users.find(u => u.name === ticket.assignee || u.email === ticket.assignee)?.photoURL ? (
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={getFileUrl(users.find(u => u.name === ticket.assignee || u.email === ticket.assignee)?.photoURL)} className="object-cover" />
                                        <AvatarFallback className="text-[8px] bg-blue-50 text-blue-600">
                                            {ticket.assignee?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <User className="w-3 h-3" />
                                )}
                                <span>{ticket.assignee || "Unassigned"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span className={`capitalize ${ticket.priority === 'High' ? 'text-red-600 font-medium' : ''}`}>
                                    {ticket.priority} Priority
                                </span>
                            </div>
                            {ticket.estimatedTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{ticket.estimatedTime}</span>
                                </div>
                            )}
                        </div>

                        {/* Labels Section */}
                        <div className="mt-4 flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Labels</span>
                            <LabelSelector
                                selectedLabelIds={ticket.labelIds || []}
                                onChange={handleLabelsChange}
                            />
                        </div>
                    </div>
                )}

                {/* Chat / Activity Feed */}
                <ScrollArea className="flex-1 p-6 bg-card">
                    {loadingComments ? (
                        <CommentsSkeleton />
                    ) : (
                        <div className="space-y-6">
                            <div className="relative flex items-center justify-center">
                                <Separator className="absolute w-full" />
                                <span className="bg-card px-2 text-xs text-muted-foreground relative z-10">
                                    Created {ticket.createdAt ? safeDateFormat(ticket.createdAt, 'MMM d, yyyy') : 'recently'}
                                </span>

                            </div>

                            {comments.map((comment) => {
                                const commentUser = users.find(u => u.id === comment.userId || u.email === comment.userName);
                                return (
                                    <div key={comment.id} className={`flex gap-3 ${comment.type === 'system' ? 'justify-center' : ''}`}>
                                        {comment.type !== 'system' && (
                                            <Avatar className="h-8 w-8 mt-1">
                                                {commentUser?.photoURL && <AvatarImage src={getFileUrl(commentUser.photoURL)} className="object-cover" />}
                                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                                    {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>

                                        )}

                                        <div className={`flex flex-col flex-1 min-w-0 ${comment.type === 'system' ? 'items-center' : ''}`}>
                                            {comment.type !== 'system' && (
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xs font-bold text-foreground">{comment.userName}</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {safeDateFormat(comment.createdAt, 'h:mm a')}
                                                    </span>
                                                </div>

                                            )}

                                            {comment.type === 'system' ? (
                                                <div className="text-xs text-muted-foreground italic flex items-center gap-1 my-2">
                                                    <Clock className="w-3 h-3" />
                                                    {comment.content}
                                                </div>
                                            ) : (
                                                <div className="bg-muted/50 rounded-lg rounded-tl-none p-3 text-sm text-foreground shadow-sm border border-border mt-1 break-words max-w-full overflow-hidden">
                                                    {comment.content}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>

                {/* Footer Input */}
                <div className="p-4 border-t bg-card">
                    <div className="flex gap-2 items-end">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Reply..."
                            className="resize-none min-h-[40px] max-h-[120px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendComment();
                                }
                            }}
                        />
                        <Button size="icon" disabled={sending || !newComment.trim()} onClick={handleSendComment} className="h-10 w-10 shrink-0">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet >
    );
}
