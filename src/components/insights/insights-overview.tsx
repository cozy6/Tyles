"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/stores/user-store';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  PieChart,
  Clock,
  Star,
  Zap,
  Brain,
  ArrowUp,
  ArrowDown,
  Info,
  Calculator
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

// Helper function to get date ranges
const getDateRanges = () => {
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
  
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return {
    thisWeek: {
      start: thisWeekStart.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    },
    lastWeek: {
      start: lastWeekStart.toISOString().split('T')[0],
      end: lastWeekEnd.toISOString().split('T')[0]
    },
    thisMonth: {
      start: thisMonthStart.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    },
    lastMonth: {
      start: lastMonthStart.toISOString().split('T')[0],
      end: lastMonthEnd.toISOString().split('T')[0]
    }
  };
};

export function InsightsOverview() {
  const { userData, platforms, earnings, expenses, loading } = useUserData();
  const { getTotalEarnings, getTotalExpenses, getGoalProgress } = useUserStore();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const dateRanges = getDateRanges();

  // Calculate metrics for analysis
  const thisWeekEarnings = getTotalEarnings(dateRanges.thisWeek.start, dateRanges.thisWeek.end);
  const lastWeekEarnings = getTotalEarnings(dateRanges.lastWeek.start, dateRanges.lastWeek.end);
  const thisMonthEarnings = getTotalEarnings(dateRanges.thisMonth.start, dateRanges.thisMonth.end);
  const lastMonthEarnings = getTotalEarnings(dateRanges.lastMonth.start, dateRanges.lastMonth.end);

  const thisWeekExpenses = getTotalExpenses(dateRanges.thisWeek.start, dateRanges.thisWeek.end);
  const lastWeekExpenses = getTotalExpenses(dateRanges.lastWeek.start, dateRanges.lastWeek.end);
  const thisMonthExpenses = getTotalExpenses(dateRanges.thisMonth.start, dateRanges.thisMonth.end);
  const lastMonthExpenses = getTotalExpenses(dateRanges.lastMonth.start, dateRanges.lastMonth.end);

  // Calculate trends
  const weeklyEarningsTrend = lastWeekEarnings > 0 ? ((thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100 : 0;
  const monthlyEarningsTrend = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 : 0;
  const weeklyExpensesTrend = lastWeekExpenses > 0 ? ((thisWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100 : 0;

  // Platform analysis
  const platformEarnings = earnings.reduce((acc, earning) => {
    const platformName = (earning as any).platforms?.name || 'Unknown';
    acc[platformName] = (acc[platformName] || 0) + earning.amount;
    return acc;
  }, {} as Record<string, number>);

  const topPlatform = Object.entries(platformEarnings).sort(([,a], [,b]) => b - a)[0];
  const platformDiversification = Object.keys(platformEarnings).length;

  // Goal progress
  const dailyGoal = getGoalProgress('daily');
  const weeklyGoal = getGoalProgress('weekly');
  const monthlyGoal = getGoalProgress('monthly');

  // Tax insights
  const totalEarnings = getTotalEarnings();
  const totalExpenses = getTotalExpenses();
  const netIncome = totalEarnings - totalExpenses;
  const taxRate = userData?.estimated_tax_rate || 0.25;
  const estimatedTaxes = netIncome * taxRate;
  const taxSavings = totalExpenses * taxRate;

  // Generate insights
  const insights = [
    // Earnings trend insight
    weeklyEarningsTrend !== 0 && {
      type: weeklyEarningsTrend > 0 ? 'positive' : 'negative',
      icon: weeklyEarningsTrend > 0 ? TrendingUp : TrendingDown,
      title: 'Weekly Earnings Trend',
      description: `Your earnings are ${weeklyEarningsTrend > 0 ? 'up' : 'down'} ${Math.abs(weeklyEarningsTrend).toFixed(1)}% from last week`,
      action: weeklyEarningsTrend < 0 ? 'Consider working additional hours or trying new platforms' : 'Great job! Keep up the momentum'
    },

    // Platform performance insight
    topPlatform && {
      type: 'info',
      icon: Star,
      title: 'Top Performing Platform',
      description: `${topPlatform[0]} is your best earner with ${formatCurrency(topPlatform[1])} total`,
      action: platformDiversification < 2 ? 'Consider diversifying to other platforms to reduce risk' : 'Great platform diversification!'
    },

    // Tax optimization insight
    totalExpenses > 0 && {
      type: 'positive',
      icon: DollarSign,
      title: 'Tax Savings Opportunity',
      description: `You've saved approximately ${formatCurrency(taxSavings)} in taxes through business expenses`,
      action: 'Keep tracking all business expenses to maximize deductions'
    },

    // Goal progress insight
    dailyGoal.progress > 0 && {
      type: dailyGoal.progress >= 100 ? 'positive' : 'neutral',
      icon: Target,
      title: 'Goal Progress',
      description: `You're ${dailyGoal.progress.toFixed(1)}% toward your daily goal of ${formatCurrency(dailyGoal.target)}`,
      action: dailyGoal.progress >= 100 ? 'Congratulations! You\'ve reached your daily goal' : 'You\'re on track! Keep working toward your goal'
    },

    // Expense management insight
    weeklyExpensesTrend > 20 && {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Expense Increase Alert',
      description: `Your expenses increased by ${weeklyExpensesTrend.toFixed(1)}% this week`,
      action: 'Review your recent expenses to identify any unusual spending patterns'
    },

    // Cash flow insight
    netIncome > 0 && {
      type: 'positive',
      icon: TrendingUp,
      title: 'Positive Cash Flow',
      description: `Your net income after expenses is ${formatCurrency(netIncome)}`,
      action: `Consider setting aside ${formatCurrency(estimatedTaxes)} for taxes`
    }
  ].filter(Boolean);

  if (loading.userData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Financial Insights</h1>
            <p className="text-sm text-gray-600">AI-powered analysis of your gig work finances</p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full p-2">
            <Brain className="h-5 w-5" />
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
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-lg font-bold">{formatCurrency(thisWeekEarnings)}</p>
                </div>
                <div className={`flex items-center ${weeklyEarningsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weeklyEarningsTrend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span className="text-sm ml-1">{Math.abs(weeklyEarningsTrend).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-lg font-bold">{formatCurrency(thisMonthEarnings)}</p>
                </div>
                <div className={`flex items-center ${monthlyEarningsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyEarningsTrend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span className="text-sm ml-1">{Math.abs(monthlyEarningsTrend).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Platforms</p>
                <p className="text-lg font-bold">{platformDiversification}</p>
                <p className="text-xs text-gray-500">Active platforms</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Tax Saved</p>
                <p className="text-lg font-bold">{formatCurrency(taxSavings)}</p>
                <p className="text-xs text-gray-500">From expenses</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Personalized financial analysis based on your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.length > 0 ? (
                insights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'positive' ? 'border-green-500 bg-green-50' :
                      insight.type === 'negative' ? 'border-red-500 bg-red-50' :
                      insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          insight.type === 'positive' ? 'text-green-600' :
                          insight.type === 'negative' ? 'text-red-600' :
                          insight.type === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                          <p className="text-xs text-gray-600 mt-2">{insight.action}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Add more earnings and expenses to get personalized insights</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Daily Goal', progress: dailyGoal.progress, current: dailyGoal.current, target: dailyGoal.target },
                  { label: 'Weekly Goal', progress: weeklyGoal.progress, current: weeklyGoal.current, target: weeklyGoal.target },
                  { label: 'Monthly Goal', progress: monthlyGoal.progress, current: monthlyGoal.current, target: monthlyGoal.target }
                ].map((goal, index) => (
                  goal.target > 0 && (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.label}</span>
                        <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                      </div>
                      <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                      <p className="text-xs text-gray-500">{goal.progress.toFixed(1)}% complete</p>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(platformEarnings)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([platform, amount]) => {
                    const percentage = totalEarnings > 0 ? (amount / totalEarnings) * 100 : 0;
                    return (
                      <div key={platform} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{platform}</span>
                            <span className="text-sm text-gray-600">{formatCurrency(amount)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                
                {Object.keys(platformEarnings).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No platform data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Gross Income</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Business Expenses</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Tax Savings</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(taxSavings)}</p>
              </div>
            </div>
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You're saving approximately {((taxSavings / totalEarnings) * 100).toFixed(1)}% of your gross income through business expense deductions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}