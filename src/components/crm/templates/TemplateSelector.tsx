import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTemplates } from '@/lib/firebase';

interface Template {
    id: string;
    name: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultPriority: string;
}

interface TemplateSelectorProps {
    onSelect: (template: Template) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await getTemplates();
            setTemplates(data as Template[]);
        } catch (error) {
            console.error("Failed to load templates", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Use Template</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
                {loading ? (
                    <DropdownMenuItem disabled>Loading templates...</DropdownMenuItem>
                ) : templates.length === 0 ? (
                    <DropdownMenuItem disabled>No templates found</DropdownMenuItem>
                ) : (
                    templates.map(template => (
                        <DropdownMenuItem
                            key={template.id}
                            onClick={() => onSelect(template)}
                            className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
                        >
                            <span className="font-medium text-sm">{template.name}</span>
                            <span className="text-[10px] text-gray-400 truncate w-full">
                                {template.defaultTitle || template.defaultDescription}
                            </span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
