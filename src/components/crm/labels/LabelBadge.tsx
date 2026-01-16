import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Label {
    id: string;
    name: string;
    color: string;
}

interface LabelBadgeProps {
    label: Label;
    className?: string;
}

export function LabelBadge({ label, className }: LabelBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 font-medium ${className}`}
            style={{
                backgroundColor: `${label.color}10`, // 10% opacity for background
                color: label.color,
                borderColor: `${label.color}30` // 30% opacity for border
            }}
        >
            {label.name}
        </Badge>
    );
}
