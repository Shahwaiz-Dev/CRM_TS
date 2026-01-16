import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { getLabels, addLabel, updateLabel, deleteLabel } from '@/lib/firebase';
import { LabelBadge } from './LabelBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label as FormLabel } from '@/components/ui/label';

const PRESET_COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#64748B', // Slate
];

export function LabelManager() {
    const [labels, setLabels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<any>(null);
    const [newLabel, setNewLabel] = useState({ name: '', color: PRESET_COLORS[4] });

    useEffect(() => {
        loadLabels();
    }, []);

    const loadLabels = async () => {
        try {
            const data = await getLabels();
            setLabels(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async () => {
        if (!newLabel.name) return;
        setLoading(true);
        try {
            await addLabel(newLabel);
            setNewLabel({ name: '', color: PRESET_COLORS[4] });
            setIsCreateOpen(false);
            loadLabels();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingLabel.name) return;
        setLoading(true);
        try {
            await updateLabel(editingLabel.id, {
                name: editingLabel.name,
                color: editingLabel.color
            });
            setEditingLabel(null);
            loadLabels();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this label?')) return;
        try {
            await deleteLabel(id);
            loadLabels();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Project Labels</h3>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> New Label
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Label</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <FormLabel>Label Name</FormLabel>
                                <Input
                                    value={newLabel.name}
                                    onChange={e => setNewLabel({ ...newLabel, name: e.target.value })}
                                    placeholder="Bug, UI, Marketing..."
                                    maxLength={20}
                                />
                            </div>
                            <div className="space-y-2">
                                <FormLabel>Color</FormLabel>
                                <div className="grid grid-cols-5 gap-2">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            className={`h-8 w-8 rounded-full border-2 transition-all ${newLabel.color === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setNewLabel({ ...newLabel, color })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                                <LabelBadge label={{ ...newLabel, id: 'preview' } as any} className="text-sm px-3 py-1" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={loading || !newLabel.name}>Create Label</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-2">
                {labels.map(label => (
                    <div key={label.id} className="flex items-center justify-between p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow">
                        {editingLabel?.id === label.id ? (
                            <div className="flex items-center gap-2 flex-1 mr-4">
                                <Input
                                    value={editingLabel.name}
                                    onChange={e => setEditingLabel({ ...editingLabel, name: e.target.value })}
                                    className="h-8"
                                    maxLength={20}
                                />
                                <div className="flex gap-1">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            className={`h-5 w-5 rounded-full border ${editingLabel.color === color ? 'border-gray-900' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setEditingLabel({ ...editingLabel, color })}
                                        />
                                    ))}
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleUpdate}>
                                    <Check className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingLabel(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <LabelBadge label={label} className="text-sm px-3 py-1" />
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 hover:opacity-100">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => setEditingLabel(label)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(label.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
