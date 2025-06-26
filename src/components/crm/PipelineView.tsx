import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreHorizontal, Grid3X3, List, BarChart3, Calendar, Plus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: string;
  priority: number;
  assignee: string;
  type: string;
  description?: string;
  avatar: string;
}

const initialDeals: Deal[] = [
  { 
    id: '1', 
    title: 'Interest in your Graphic Design Project', 
    company: 'Software', 
    value: 24000, 
    stage: 'New', 
    priority: 1,
    assignee: 'Agrolait', 
    type: 'Software',
    avatar: '👤'
  },
  { 
    id: '2', 
    title: 'Script to import external data', 
    company: 'Services', 
    value: 5500, 
    stage: 'New', 
    priority: 1,
    assignee: 'Camptocamp', 
    type: 'Services',
    avatar: '👤'
  },
  { 
    id: '3', 
    title: 'Plan to buy 60 keyboards', 
    company: 'Product', 
    value: 40000, 
    stage: 'New', 
    priority: 1,
    assignee: '', 
    type: 'Product',
    avatar: '👤'
  },
  { 
    id: '4', 
    title: 'Trainee\'s training plan in your Organization', 
    company: 'Information & Training', 
    value: 35000, 
    stage: 'Qualified', 
    priority: 1,
    assignee: 'Delta PC', 
    type: 'Information',
    avatar: '👤'
  },
  { 
    id: '5', 
    title: 'Pricing Information of Services', 
    company: 'Services & Information', 
    value: 1000, 
    stage: 'Qualified', 
    priority: 1,
    assignee: '', 
    type: 'Services',
    avatar: '👤'
  },
  { 
    id: '6', 
    title: 'Plan to buy RedHat servers', 
    company: 'Product', 
    value: 25000, 
    stage: 'Qualified', 
    priority: 1,
    assignee: 'Agrolait', 
    type: 'Product',
    avatar: '👤'
  },
  { 
    id: '7', 
    title: 'Would appreciate more information about your products', 
    company: 'Software', 
    value: 11000, 
    stage: 'Proposition', 
    priority: 1,
    assignee: 'Agrolait', 
    type: 'Software',
    avatar: '👤'
  },
  { 
    id: '8', 
    title: 'Need to customize the solution', 
    company: 'Information', 
    value: 4500, 
    stage: 'Proposition', 
    priority: 1,
    assignee: '', 
    type: 'Information',
    avatar: '👤'
  },
  { 
    id: '9', 
    title: '"Resource Planning" project development', 
    company: 'Consulting', 
    value: 9000, 
    stage: 'Proposition', 
    priority: 1,
    assignee: 'Delta PC', 
    type: 'Consulting',
    avatar: '👤'
  },
  { 
    id: '10', 
    title: 'Interest in your customizable Pics', 
    company: 'Product', 
    value: 15000, 
    stage: 'Negotiation', 
    priority: 1,
    assignee: 'Camptocamp', 
    type: 'Product',
    avatar: '👤'
  },
  { 
    id: '11', 
    title: 'Need 20 Days of Consultancy', 
    company: 'Consulting', 
    value: 60000, 
    stage: 'Negotiation', 
    priority: 2,
    assignee: '', 
    type: 'Consulting',
    avatar: '👤'
  },
  { 
    id: '12', 
    title: 'Want to subscribe to your online solution', 
    company: 'Services', 
    value: 2000, 
    stage: 'Negotiation', 
    priority: 1,
    assignee: 'Think Big', 
    type: 'Services',
    avatar: '👤'
  },
  { 
    id: '13', 
    title: 'Interest in your products', 
    company: 'Software', 
    value: 2000, 
    stage: 'Won', 
    priority: 1,
    assignee: 'Agrolait', 
    type: 'Software',
    avatar: '👤'
  },
  { 
    id: '14', 
    title: 'Need new design for my website', 
    company: 'Design', 
    value: 3800, 
    stage: 'Won', 
    priority: 1,
    assignee: 'Delta PC', 
    type: 'Design',
    avatar: '👤'
  }
];

const stageNames = ['New', 'Qualified', 'Proposition', 'Negotiation', 'Won'];
const stageColors = {
  'New': 'bg-green-500',
  'Qualified': 'bg-red-500',
  'Proposition': 'bg-blue-500',
  'Negotiation': 'bg-purple-500',
  'Won': 'bg-orange-500'
};

export function PipelineView() {
  const [deals, setDeals] = useState(initialDeals);

  const getPriorityStars = (priority: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`text-sm ${i < priority ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newDeals = deals.map(deal => {
      if (deal.id === draggableId) {
        return {
          ...deal,
          stage: destination.droppableId
        };
      }
      return deal;
    });

    setDeals(newDeals);
  };

  const getStageDeals = (stageName: string) => {
    return deals.filter(deal => deal.stage === stageName);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Pipeline</h1>
        <div className="w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Action Bar - Responsive */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm">
            <Plus className="h-4 w-4 mr-1" />
            CREATE
          </Button>
          <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50 text-sm">
            IMPORT
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
              <Filter className="h-3 w-3" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <span className="hidden sm:inline">Group By</span>
              <span className="sm:hidden">Group</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
              ★ <span className="hidden sm:inline">Favorites</span>
            </Button>
          </div>
          
          <div className="flex items-center border-l pl-2 lg:pl-4 gap-1">
            <Button variant="ghost" size="sm" className="p-1">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1 hidden sm:inline-flex">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline Columns - Responsive with Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex overflow-x-auto gap-4 pb-4">
          <div className="flex gap-4 min-w-max lg:grid lg:grid-cols-5 lg:min-w-0 lg:w-full">
            {stageNames.map((stageName) => {
              const stageDeals = getStageDeals(stageName);
              return (
                <div key={stageName} className="w-80 lg:w-auto flex-shrink-0">
                  <Card className="bg-white shadow-sm h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-gray-700">
                          {stageName}
                        </CardTitle>
                        <div className={`h-2 w-16 ${stageColors[stageName as keyof typeof stageColors]} rounded-full`}></div>
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        ${stageDeals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                      </div>
                    </CardHeader>
                    <Droppable droppableId={stageName}>
                      {(provided, snapshot) => (
                        <CardContent 
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`space-y-3 max-h-96 overflow-y-auto ${
                            snapshot.isDraggingOver ? 'bg-blue-50' : ''
                          }`}
                        >
                          {stageDeals.map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <Card 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                                    snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                  }`}
                                >
                                  <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-gray-800 leading-tight">{deal.title}</h4>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {deal.company}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-sm text-gray-800">
                                        ${deal.value.toLocaleString()}.00
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-600">
                                        {deal.assignee || 'Unassigned'}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                          {getPriorityStars(deal.priority)}
                                        </div>
                                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                          {deal.avatar}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </CardContent>
                      )}
                    </Droppable>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
