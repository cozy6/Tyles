"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/stores/user-store';
import { 
  Target, 
  Plus, 
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  AlertCircle,
  Edit,
  Trash2,
  Star,
  BarChart3,
  Users,
  Trophy,
  Flag,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Goal templates
const goalTemplates = [
  {
    id: 'daily_100',
    title: 'Daily $100 Goal',
    description: 'Earn $100 every day',
    type: 'daily',
    target: 100,
    category: 'earnings'
  },
  {
    id: 'weekly_700',
    title: 'Weekly $700 Goal',
    description: 'Earn $700 every week',
    type: 'weekly',
    target: 700,
    category: 'earnings'
  },
  {
    id: 'monthly_3000',
    title: 'Monthly $3,000 Goal',
    description: 'Earn $3,000 every month',
    type: 'monthly',
    target: 3000,
    category: 'earnings'
  },
  {
    id: 'save_taxes',
    title: 'Tax Savings Goal',
    description: 'Save 25% of earnings for taxes',
    type: 'ongoing',
    target: 25,
    category: 'savings'
  }
];

export function GoalsOverview() {
  const { userData, userGoals, loading } = useUserData();
  const { getTotalEarnings, getGoalProgress } = useUserStore();
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customGoal, setCustomGoal] = useState({
    title: '',
    description: '',
    type: 'daily',
    target: 0,
    category: 'earnings'
  });

  // Calculate goal progress
  const dailyProgress = getGoalProgress('daily');
  const weeklyProgress = getGoalProgress('weekly');
  const monthlyProgress = getGoalProgress('monthly');

  // Sample goals data (would normally come from database)
  const sampleGoals = [
    {
      id: '1',
      title: 'Daily $100 Goal',
      description: 'Earn $100 every day',
      type: 'daily',
      target: 100,
      current: dailyProgress.current,
      progress: dailyProgress.progress,
      category: 'earnings',
      status: dailyProgress.progress >= 100 ? 'completed' : 'active',
      created_at: '2024-01-01',
      deadline: new Date().toISOString().split('T')[0]
    },
    {
      id: '2',
      title: 'Weekly $700 Goal',
      description: 'Earn $700 every week',
      type: 'weekly',
      target: 700,
      current: weeklyProgress.current,
      progress: weeklyProgress.progress,
      category: 'earnings',
      status: weeklyProgress.progress >= 100 ? 'completed' : 'active',
      created_at: '2024-01-01',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      id: '3',
      title: 'Monthly $3,000 Goal',
      description: 'Earn $3,000 every month',
      type: 'monthly',
      target: 3000,
      current: monthlyProgress.current,
      progress: monthlyProgress.progress,
      category: 'earnings',
      status: monthlyProgress.progress >= 100 ? 'completed' : 'active',
      created_at: '2024-01-01',
      deadline: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    }
  ];

  const activeGoals = sampleGoals.filter(g => g.status === 'active');
  const completedGoals = sampleGoals.filter(g => g.status === 'completed');

  if (loading.userData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 -mx-4 -mt-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
            <p className="text-sm text-gray-600">Track your progress and achieve your financial targets</p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full p-2">
            <Target className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Goals</p>
                  <p className="text-2xl font-bold text-blue-600">{activeGoals.length}</p>
                </div>
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(weeklyProgress.current)}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {sampleGoals.length > 0 ? Math.round((completedGoals.length / sampleGoals.length) * 100) : 0}%
                  </p>
                </div>
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Today's Progress
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {dailyProgress.progress.toFixed(1)}% complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Daily Goal Progress</span>
                <span className="font-medium">{formatCurrency(dailyProgress.current)} / {formatCurrency(dailyProgress.target)}</span>
              </div>
              <Progress value={Math.min(dailyProgress.progress, 100)} className="h-3" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Started today</span>
                <span>{dailyProgress.progress >= 100 ? 'Goal achieved!' : `${formatCurrency(dailyProgress.target - dailyProgress.current)} remaining`}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Goals</CardTitle>
              <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Set a new financial goal to track your progress
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Goal Template</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template or create custom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom Goal</SelectItem>
                          {goalTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Goal Type</Label>
                        <Select value={customGoal.type} onValueChange={(value) => setCustomGoal({...customGoal, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Target Amount</Label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={customGoal.target}
                          onChange={(e) => setCustomGoal({...customGoal, target: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Goal Title</Label>
                      <Input 
                        placeholder="My Goal" 
                        value={customGoal.title}
                        onChange={(e) => setCustomGoal({...customGoal, title: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input 
                        placeholder="Goal description" 
                        value={customGoal.description}
                        onChange={(e) => setCustomGoal({...customGoal, description: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={() => setShowNewGoalDialog(false)} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={() => setShowNewGoalDialog(false)} className="flex-1">
                        Create Goal
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        goal.category === 'earnings' ? 'bg-green-100 text-green-600' :
                        goal.category === 'savings' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {goal.category === 'earnings' ? <DollarSign className="h-5 w-5" /> :
                         goal.category === 'savings' ? <Target className="h-5 w-5" /> :
                         <Trophy className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{goal.title}</h3>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {goal.type}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="font-medium">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                    </div>
                    <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Due: {formatDate(goal.deadline)}</span>
                      <span>{goal.progress.toFixed(1)}% complete</span>
                    </div>
                  </div>
                  
                  {goal.progress >= 100 && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Goal achieved!</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {activeGoals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No active goals</p>
                  <p className="text-sm">Create your first goal to start tracking progress</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goal Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Goal Templates
            </CardTitle>
            <CardDescription>
              Quick start with popular goal templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.title}</h3>
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {template.category === 'savings' ? `${template.target}%` : formatCurrency(template.target)}
                    </span>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Goal
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        {completedGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedGoals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">{goal.title}</p>
                      <p className="text-sm text-green-700">Completed on {formatDate(goal.deadline)}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatCurrency(goal.target)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}