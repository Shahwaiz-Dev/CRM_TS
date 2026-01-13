import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Sprint Sidebar Loading Skeleton
export function SprintListSkeleton() {
    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-full p-3 rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <div className="flex items-center gap-1 mt-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Kanban Column Loading Skeleton
export function SprintColumnSkeleton() {
    return (
        <div className="flex flex-col gap-3 min-w-[280px] w-full max-w-xs h-full max-h-full">
            <div className="flex items-center justify-between px-1 shrink-0">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-8 rounded-full" />
                </div>
            </div>
            <div className="flex flex-col gap-2 min-h-[200px] overflow-y-auto flex-1 pr-1 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                {[1, 2, 3].map(i => (
                    <TicketCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

// Individual Ticket Card Skeleton
export function TicketCardSkeleton() {
    return (
        <Card className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-2 ml-6">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2 ml-6" />
            <Skeleton className="h-4 w-3/4 mb-3 ml-6" />
            <div className="flex items-center justify-between mt-auto ml-6">
                <Skeleton className="h-5 w-16 rounded-full" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-8" />
                </div>
            </div>
        </Card>
    );
}

// Full Kanban Board Loading Skeleton
export function KanbanBoardSkeleton() {
    return (
        <div className="flex h-full gap-6 min-w-max">
            <SprintColumnSkeleton />
            <SprintColumnSkeleton />
            <SprintColumnSkeleton />
            <SprintColumnSkeleton />
        </div>
    );
}

// Comment Section Loading Skeleton
export function CommentsSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0 mt-1" />
                    <div className="flex flex-col flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Ticket Detail Header Skeleton
export function TicketDetailHeaderSkeleton() {
    return (
        <div className="p-6 border-b bg-gray-50/50">
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-[140px] rounded-md" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}

// Sprint Header Skeleton
export function SprintHeaderSkeleton() {
    return (
        <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 z-10">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex items-center gap-3">
                <div className="flex -space-x-2 mr-2">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="w-8 h-8 rounded-full border-2 border-white" />
                    ))}
                </div>
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>
        </div>
    );
}
