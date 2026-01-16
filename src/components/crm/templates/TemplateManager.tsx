import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2, FileText, Check, X } from 'lucide-react';
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TemplateManager() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        defaultTitle: '',
        defaultDescription: '',
        defaultPriority: 'Medium'
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async () => {
        if (!newTemplate.name) return;
        setLoading(true);
        try {
            await addTemplate(newTemplate);
            setNewTemplate({
                name: '',
                defaultTitle: '',
                defaultDescription: '',
                defaultPriority: 'Medium'
            });
            setIsCreateOpen(false);
            loadTemplates();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingTemplate.name) return;
        setLoading(true);
        try {
            await updateTemplate(editingTemplate.id, editingTemplate);
            setEditingTemplate(null);
            loadTemplates();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await deleteTemplate(id);
            loadTemplates();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Ticket Templates</h3>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Template</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Template Name</Label>
                                <Input
                                    value={newTemplate.name}
                                    onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    placeholder="e.g. Bug Report, Feature Request"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Default Title</Label>
                                <Input
                                    value={newTemplate.defaultTitle}
                                    onChange={e => setNewTemplate({ ...newTemplate, defaultTitle: e.target.value })}
                                    placeholder="e.g. Bug: [Title]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Default Description</Label>
                                <Textarea
                                    value={newTemplate.defaultDescription}
                                    onChange={e => setNewTemplate({ ...newTemplate, defaultDescription: e.target.value })}
                                    placeholder="Describe the template content..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Default Priority</Label>
                                <Select value={newTemplate.defaultPriority} onValueChange={v => setNewTemplate({ ...newTemplate, defaultPriority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={loading || !newTemplate.name}>Create Template</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-3">
                {templates.map(template => (
                    <div key={template.id} className="p-4 bg-card border rounded-xl hover:shadow-sm transition-all group">
                        {editingTemplate?.id === template.id ? (
                            <div className="space-y-4">
                                <Input
                                    value={editingTemplate.name}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                    placeholder="Template Name"
                                />
                                <Input
                                    value={editingTemplate.defaultTitle}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, defaultTitle: e.target.value })}
                                    placeholder="Default Title"
                                />
                                <Textarea
                                    value={editingTemplate.defaultDescription}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, defaultDescription: e.target.value })}
                                    placeholder="Default Description"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                                    <Button size="sm" onClick={handleUpdate}>Save Changes</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{template.defaultDescription || 'No description'}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                                {template.defaultPriority} Priority
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => setEditingTemplate(template)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(template.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {templates.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-xl border-gray-100 text-gray-400 text-sm">
                        No templates yet. Create your first one to speed up ticket creation.
                    </div>
                )}
            </div>
        </div>
    );
}
