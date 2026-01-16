import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, User, AlertCircle } from 'lucide-react';
import { KanbanSkeleton } from '@/components/ui/KanbanSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useTranslation } from "@/store/slices/languageSlice";
import { fetchTasks, createNewTask, modifyTask, removeTask } from "@/store/slices/tasksSlice";

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate: string;
  account: string;
}

export function TasksView() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const dataLoading = useAppSelector((state) => state.tasks.loading);
  const slicesError = useAppSelector((state) => state.tasks.error);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    dueDate: '',
    account: ''
  });
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const fetchTasksData = async () => {
    dispatch(fetchTasks());
  };

  // Add task to Firestore
  const handleAddTask = async () => {
    if (newTask.title && newTask.assignee) {
      try {
        await dispatch(createNewTask({ ...newTask, status: 'Not Started' })).unwrap();
        setNewTask({ title: '', description: '', assignee: '', priority: 'Medium', dueDate: '', account: '' });
        setIsDialogOpen(false);
      } catch (e: any) {
        setError(e || 'Failed to add task');
      }
    }
  };

  // Update task status in Firestore
  const moveTask = async (taskId: string, newStatus: 'Not Started' | 'In Progress' | 'Completed') => {
    try {
      await dispatch(modifyTask({ id: taskId, data: { status: newStatus } })).unwrap();
    } catch (e: any) {
      setError(e || 'Failed to update task');
    }
  };

  // Delete task from Firestore
  const handleDeleteTask = async (taskId: string) => {
    setError(null);
    try {
      await dispatch(removeTask(taskId)).unwrap();
    } catch (e: any) {
      setError(e || 'Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tasksByStatus = {
    'Not Started': filteredTasks.filter(task => task.status === 'Not Started'),
    'In Progress': filteredTasks.filter(task => task.status === 'In Progress'),
    'Completed': filteredTasks.filter(task => task.status === 'Completed')
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started': return 'bg-muted/50 border-border';
      case 'In Progress': return 'bg-primary/5 border-primary/20';
      case 'Completed': return 'bg-success/5 border-success/20';
      default: return 'bg-muted/50 border-border';
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(status);
  };
  const handleDrop = (e: React.DragEvent, status: 'Not Started' | 'In Progress' | 'Completed') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    moveTask(taskId, status);
    setDragOverStatus(null);
  };
  const handleDragLeave = () => setDragOverStatus(null);

  const TaskCard = ({ task }: { task: Task }) => (
    <Card
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer bg-card"
      draggable
      onDragStart={e => handleDragStart(e, task.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm leading-tight">{task.title}</h4>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {t(task.priority.toLowerCase())}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{task.account}</span>
            </div>
          </div>
          <div className="flex gap-1 pt-2">
            {task.status !== 'Not Started' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-6 px-2"
                onClick={() => moveTask(task.id, 'Not Started')}
              >
                {t('toDo')}
              </Button>
            )}
            {task.status !== 'In Progress' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-6 px-2"
                onClick={() => moveTask(task.id, 'In Progress')}
              >
                {t('progress')}
              </Button>
            )}
            {task.status !== 'Completed' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-6 px-2"
                onClick={() => moveTask(task.id, 'Completed')}
              >
                {t('done')}
              </Button>
            )}
            <Button size="sm" variant="destructive" className="text-xs h-6 px-2" onClick={() => handleDeleteTask(task.id)}>
              {t('delete')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const statusTranslationKeys: Record<string, string> = {
    'Not Started': 'notStarted',
    'In Progress': 'inProgress',
    'Completed': 'completed',
  };
  const StatusColumn = ({ status, tasks: columnTasks }: { status: string, tasks: Task[] }) => (
    <div
      className={`flex-1 min-w-[300px] bg-card rounded-lg border p-4 ${dragOverStatus === status ? 'ring-2 ring-primary' : ''}`}
      onDragOver={e => handleDragOver(e, status)}
      onDrop={e => handleDrop(e, status as any)}
      onDragLeave={handleDragLeave}
    >
      <h3 className={`font-semibold mb-4 text-lg ${getStatusColor(status)}`}>{t(statusTranslationKeys[status] || 'notStarted')}</h3>
      {columnTasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );

  if (dataLoading) {
    return (
      <div className="p-4 md:p-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        <KanbanSkeleton columns={3} cardsPerColumn={3} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('tasks')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> {t('addTask')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addNewTask')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>{t('title')}</Label>
              <Input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              <Label>{t('description')}</Label>
              <Textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
              <Label>{t('assignee')}</Label>
              <Input value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })} />
              <Label>{t('priority')}</Label>
              <Select value={newTask.priority} onValueChange={v => setNewTask({ ...newTask, priority: v as any })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">{t('high')}</SelectItem>
                  <SelectItem value="Medium">{t('medium')}</SelectItem>
                  <SelectItem value="Low">{t('low')}</SelectItem>
                </SelectContent>
              </Select>
              <Label>{t('dueDate')}</Label>
              <Input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
              <Label>{t('account')}</Label>
              <Input value={newTask.account} onChange={e => setNewTask({ ...newTask, account: e.target.value })} />
              <Button onClick={handleAddTask}>{t('addTask')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {error && <div className="text-red-600 mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {t('error')}: {error}</div>}
      <div className="flex gap-4 overflow-x-auto">
        <StatusColumn status="Not Started" tasks={tasksByStatus['Not Started']} />
        <StatusColumn status="In Progress" tasks={tasksByStatus['In Progress']} />
        <StatusColumn status="Completed" tasks={tasksByStatus['Completed']} />
      </div>
    </div>
  );
}
