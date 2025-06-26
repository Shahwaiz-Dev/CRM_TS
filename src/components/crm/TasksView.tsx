import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, User, AlertCircle } from 'lucide-react';

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

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up on proposal',
    description: 'Call client to discuss proposal details',
    assignee: 'John Doe',
    priority: 'High',
    status: 'Not Started',
    dueDate: '2024-01-20',
    account: 'Acme Corporation'
  },
  {
    id: '2',
    title: 'Prepare demo presentation',
    description: 'Create demo for TechStart Inc',
    assignee: 'Jane Smith',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '2024-01-18',
    account: 'TechStart Inc'
  },
  {
    id: '3',
    title: 'Contract review',
    description: 'Review and send contract to Global Solutions',
    assignee: 'Mike Johnson',
    priority: 'Low',
    status: 'Completed',
    dueDate: '2024-01-15',
    account: 'Global Solutions Ltd'
  }
];

export function TasksView() {
  const [tasks, setTasks] = useState(sampleTasks);
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
      case 'Not Started': return 'bg-gray-50 border-gray-200';
      case 'In Progress': return 'bg-blue-50 border-blue-200';
      case 'Completed': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleAddTask = () => {
    if (newTask.title && newTask.assignee) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        status: 'Not Started'
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        priority: 'Medium',
        dueDate: '',
        account: ''
      });
      setIsDialogOpen(false);
    }
  };

  const moveTask = (taskId: string, newStatus: 'Not Started' | 'In Progress' | 'Completed') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
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
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
      draggable
      onDragStart={e => handleDragStart(e, task.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm leading-tight">{task.title}</h4>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span>{task.assignee}</span>
            </div>
            
            {task.dueDate && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              <span className="font-medium">{task.account}</span>
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
                To Do
              </Button>
            )}
            {task.status !== 'In Progress' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-6 px-2"
                onClick={() => moveTask(task.id, 'In Progress')}
              >
                Progress
              </Button>
            )}
            {task.status !== 'Completed' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-6 px-2"
                onClick={() => moveTask(task.id, 'Completed')}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatusColumn = ({ status, tasks: columnTasks }: { status: string, tasks: Task[] }) => (
    <div
      className={`flex-1 min-w-0 transition-colors ${dragOverStatus === status ? 'bg-blue-100' : ''}`}
      onDragOver={e => handleDragOver(e, status)}
      onDrop={e => handleDrop(e, status as any)}
      onDragLeave={handleDragLeave}
    >
      <Card className={`h-full ${getStatusColor(status)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{status}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {columnTasks.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {columnTasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Task Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Enter task description..."
                  className="min-h-20"
                />
              </div>
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  placeholder="Assign to..."
                />
              </div>
              <div>
                <Label htmlFor="account">Account</Label>
                <Input
                  id="account"
                  value={newTask.account}
                  onChange={(e) => setNewTask({...newTask, account: e.target.value})}
                  placeholder="Related account..."
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: 'High' | 'Medium' | 'Low') => setNewTask({...newTask, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddTask} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-96">
        <StatusColumn status="Not Started" tasks={tasksByStatus['Not Started']} />
        <StatusColumn status="In Progress" tasks={tasksByStatus['In Progress']} />
        <StatusColumn status="Completed" tasks={tasksByStatus['Completed']} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Task Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Not Started</span>
                <Badge className="bg-gray-100 text-gray-800">
                  {tasksByStatus['Not Started'].length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {tasksByStatus['In Progress'].length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <Badge className="bg-green-100 text-green-800">
                  {tasksByStatus['Completed'].length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Priority</span>
                <Badge className="bg-red-100 text-red-800">
                  {tasks.filter(t => t.priority === 'High').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Priority</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {tasks.filter(t => t.priority === 'Medium').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Priority</span>
                <Badge className="bg-green-100 text-green-800">
                  {tasks.filter(t => t.priority === 'Low').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">Task Completed</h4>
                    <p className="text-xs text-gray-600">Contract review - Mike Johnson</p>
                  </div>
                  <span className="text-xs text-gray-500">1h ago</span>
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">Task Created</h4>
                    <p className="text-xs text-gray-600">Follow up on proposal - John Doe</p>
                  </div>
                  <span className="text-xs text-gray-500">2h ago</span>
                </div>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">Task Updated</h4>
                    <p className="text-xs text-gray-600">Prepare demo presentation - Jane Smith</p>
                  </div>
                  <span className="text-xs text-gray-500">3h ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
