import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getLabels } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';

interface Label {
    id: string;
    name: string;
    color: string;
}

interface LabelSelectorProps {
    selectedLabelIds: string[];
    onChange: (labelIds: string[]) => void;
}

export function LabelSelector({ selectedLabelIds, onChange }: LabelSelectorProps) {
    const [open, setOpen] = useState(false);
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLabels();
    }, []);

    const loadLabels = async () => {
        try {
            const data = await getLabels();
            setLabels(data as Label[]);
        } catch (error) {
            console.error("Failed to load labels", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLabel = (labelId: string) => {
        const newSelection = selectedLabelIds.includes(labelId)
            ? selectedLabelIds.filter(id => id !== labelId)
            : [...selectedLabelIds, labelId];
        onChange(newSelection);
    };

    const getLabelById = (id: string) => labels.find(l => l.id === id);

    return (
        <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-9 text-sm font-normal"
                    >
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            {selectedLabelIds.length === 0 ? (
                                <span className="text-gray-500">Select labels...</span>
                            ) : (
                                <span>{selectedLabelIds.length} label(s) selected</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search labels..." />
                        <CommandList>
                            <CommandEmpty>No labels found.</CommandEmpty>
                            <CommandGroup>
                                {labels.map((label) => (
                                    <CommandItem
                                        key={label.id}
                                        value={label.name}
                                        onSelect={() => toggleLabel(label.id)}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: label.color }}
                                            />
                                            <span>{label.name}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                selectedLabelIds.includes(label.id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedLabelIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedLabelIds.map(id => {
                        const label = getLabelById(id);
                        if (!label) return null;
                        return (
                            <Badge
                                key={id}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 flex items-center gap-1 bg-opacity-10"
                                style={{
                                    backgroundColor: `${label.color}20`,
                                    color: label.color,
                                    borderColor: `${label.color}40`
                                }}
                            >
                                {label.name}
                                <X
                                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                                    onClick={() => toggleLabel(id)}
                                />
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
