import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface Deal {
  id: string;
  title?: string;
  company?: string;
  value?: number;
  stage?: string;
  priority?: number;
  assignee?: string;
  type?: string;
  description?: string;
  closeDate?: string;
  closedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export function DashboardOverview() {
  const [leads, setLeads] = useState<any[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const { t } = useLanguage();

  const pieColors = ['#22c55e', '#3b82f6', '#f59e42', '#eab308', '#a78bfa'];
  const activityColors: Record<string, string> = {
    new: 'bg-blue-500',
    qualified: 'bg-yellow-500',
    proposition: 'bg-orange-500',
    negotiation: 'bg-purple-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
    default: 'bg-gray-400',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leadsSnap = await getDocs(collection(db, 'leads'));
        setLeads(leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const dealsSnap = await getDocs(collection(db, 'deals'));
        const dealsData = dealsSnap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Convert Firestore timestamps to Date objects
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          closedAt: doc.data().closedAt?.toDate?.() || doc.data().closedAt
        })) as Deal[];
        setDeals(dealsData);
        
        const tasksSnap = await getDocs(query(collection(db, 'tasks'), orderBy('dueDate', 'asc')));
        setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Recent activities: last 3 deals or leads added/updated
        const recentDeals = dealsData
          .sort((a, b) => {
            const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return bTime - aTime;
          })
          .slice(0, 3);
        setActivities(recentDeals);
        
        console.log('Dashboard data loaded:', {
          dealsCount: dealsData.length,
          wonDeals: dealsData.filter(d => d.stage === 'Won').length,
          dealsWithValue: dealsData.filter(d => (d.value || 0) > 0).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  // Helper function to safely convert to Date
  const toDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    if (dateValue.toDate) return dateValue.toDate(); // Firestore timestamp
    if (dateValue instanceof Date) return dateValue;
    return new Date(dateValue);
  };

  // Helper function to check if date is in current month
  const isInCurrentMonth = (dateValue: any): boolean => {
    const date = toDate(dateValue);
    if (!date) return false;
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Helper function to check if date is in specific month/year
  const isInMonthYear = (dateValue: any, month: number, year: number): boolean => {
    const date = toDate(dateValue);
    if (!date) return false;
    return date.getMonth() === month && date.getFullYear() === year;
  };

  // Calculations
  const totalLeads = leads.length;
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const revenueThisMonth = deals
    .filter(d => d.stage === 'Won' && isInCurrentMonth(d.closedAt))
    .reduce((sum, d) => sum + (d.value || 0), 0);
  
  const wonDeals = deals.filter(d => d.stage === 'Won').length;
  const conversionRate = totalLeads ? ((wonDeals / totalLeads) * 100).toFixed(1) : '0.0';
  
  // Revenue over time (last 6 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const revenue = deals
      .filter(d => d.stage === 'Won' && isInMonthYear(d.closedAt, month, year))
      .reduce((sum, d) => sum + (d.value || 0), 0);
    return { month: months[month], revenue };
  });
  
  // Deals by stage
  const stageNames = ['New', 'Qualified', 'Proposition', 'Negotiation', 'Won'];
  const dealsData = stageNames.map(stage => ({ name: stage, value: deals.filter(d => d.stage === stage).length }));
  
  // Upcoming tasks (next 3 by due date)
  const upcomingTasks = tasks.slice(0, 3);

  // Debug logging
  console.log('Revenue calculation:', {
    totalDeals: deals.length,
    wonDeals,
    revenueThisMonth,
    revenueData,
    dealsWithClosedAt: deals.filter(d => d.closedAt).length,
    dealsWithValue: deals.filter(d => (d.value || 0) > 0).length
  });

  return (
    <motion.div
      className="p-4 md:p-4"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('crm_dashboard')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('total_leads')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-green-600">+12% {t('from_last_month')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('active_deals')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDeals}</div>
              <p className="text-xs text-green-600">+8% {t('from_last_month')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('revenue_this_month')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueThisMonth.toLocaleString()}</div>
              <p className="text-xs text-green-600">+15% {t('from_last_month')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('conversion_rate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-red-600">-2% {t('from_last_month')}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('revenue_over_time')}</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('deals_by_stage')}</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dealsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {dealsData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} name={t(`stage_${entry.name.toLowerCase()}`)} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('recent_activities')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, idx) => {
                  const stageKey = (activity.stage || '').toLowerCase();
                  const color = activityColors[stageKey] || activityColors.default;
                  let timeAgo = '';
                  if (activity.updatedAt) {
                    const diff = Date.now() - new Date(activity.updatedAt).getTime();
                    if (diff < 60000) timeAgo = t('just_now');
                    else if (diff < 3600000) timeAgo = `${Math.floor(diff / 60000)} ${t('minutes_ago')}`;
                    else if (diff < 86400000) timeAgo = `${Math.floor(diff / 3600000)} ${t('hours_ago')}`;
                    else timeAgo = `${Math.floor(diff / 86400000)} ${t('days_ago')}`;
                  }
                  return (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 ${color} rounded-full mt-2`}></div>
                      <div>
                        <p className="text-sm">{activity.description || activity.title || 'Activity'}</p>
                        <p className="text-xs text-gray-500">{timeAgo}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('upcoming_tasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-gray-500">{t('due')} {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
