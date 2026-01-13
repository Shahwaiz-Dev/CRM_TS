import React, { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { addComment, getComments, updateTicket } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { CommentsSkeleton, TicketDetailHeaderSkeleton } from './SprintSkeletons';

export function TicketDetailView({ ticket, open, onClose, onUpdate }: any) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [status, setStatus] = useState(ticket?.status || 'ToDo');
    const [sending, setSending] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [loadingTicket, setLoadingTicket] = useState(false);
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ticket?.id) {
            setLoadingTicket(true);
            loadComments();
            setStatus(ticket.status);
            // Simulate slight delay for smooth transition
            setTimeout(() => setLoadingTicket(false), 300);
        }
    }, [ticket]);

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
            loadComments();
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
            if (onUpdate) onUpdate();
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus);
        try {
            await updateTicket(ticket.id, { status: newStatus });
            if (onUpdate) onUpdate(); // Refresh parent board

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

    if (!ticket) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                {/* Header */}
                {loadingTicket ? (
                    <TicketDetailHeaderSkeleton />
                ) : (
                    <div className="p-6 border-b bg-gray-50/50">
                        <SheetHeader className="mb-4">
                            <div className="flex justify-between items-start">
                                <SheetTitle className="text-xl font-bold leading-tight">{ticket.title}</SheetTitle>
                                <Select value={status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ToDo">To Do</SelectItem>
                                        <SelectItem value="InProgress">In Progress</SelectItem>
                                        <SelectItem value="Review">Review</SelectItem>
                                        <SelectItem value="Done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <SheetDescription className="mt-2 text-sm text-gray-500">
                                {ticket.description || "No description provided."}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
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
                    </div>
                )}

                {/* Chat / Activity Feed */}
                <ScrollArea className="flex-1 p-6 bg-white">
                    {loadingComments ? (
                        <CommentsSkeleton />
                    ) : (
                        <div className="space-y-6">
                            <div className="relative flex items-center justify-center">
                                <Separator className="absolute w-full" />
                                <span className="bg-white px-2 text-xs text-gray-400 relative z-10">
                                    Created {ticket.createdAt ? format(new Date(ticket.createdAt.seconds * 1000), 'MMM d, yyyy') : 'recently'}
                                </span>
                            </div>

                            {comments.map((comment) => (
                                <div key={comment.id} className={`flex gap-3 ${comment.type === 'system' ? 'justify-center' : ''}`}>
                                    {comment.type !== 'system' && (
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                                {comment.userName?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className={`flex flex-col ${comment.type === 'system' ? 'items-center' : ''}`}>
                                        {comment.type !== 'system' && (
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-bold text-gray-900">{comment.userName}</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {comment.createdAt ? format(new Date(comment.createdAt.seconds * 1000), 'h:mm a') : ''}
                                                </span>
                                            </div>
                                        )}

                                        {comment.type === 'system' ? (
                                            <div className="text-xs text-gray-400 italic flex items-center gap-1 my-2">
                                                <Clock className="w-3 h-3" />
                                                {comment.content}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-lg rounded-tl-none p-3 text-sm text-gray-700 shadow-sm border border-gray-100 mt-1">
                                                {comment.content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>

                {/* Footer Input */}
                <div className="p-4 border-t bg-white">
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
        </Sheet>
    );
}
