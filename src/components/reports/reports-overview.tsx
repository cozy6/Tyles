"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/stores/user-store';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Receipt,
  Car,
  Utensils,
  ShoppingCart,
  Calculator,
  Eye,
  Filter,
  FileBarChart,
  Printer,
  Share2,
  Archive,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
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

// Helper function to get date ranges
const getDateRanges = () => {
  const now = new Date();
  const thisMonth = {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: now
  };
  const lastMonth = {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end: new Date(now.getFullYear(), now.getMonth(), 0)
  };
  const thisYear = {
    start: new Date(now.getFullYear(), 0, 1),
    end: now
  };
  const lastYear = {
    start: new Date(now.getFullYear() - 1, 0, 1),
    end: new Date(now.getFullYear() - 1, 11, 31)
  };
  
  return { thisMonth, lastMonth, thisYear, lastYear };
};

// Report templates
const reportTemplates = [
  {
    id: 'monthly_summary',
    title: 'Monthly Summary',
    description: 'Complete overview of monthly earnings, expenses, and tax estimates',
    icon: FileBarChart,
    type: 'summary',
    frequency: 'monthly'
  },
  {
    id: 'quarterly_tax',
    title: 'Quarterly Tax Report',
    description: 'Detailed tax calculations and deductions for quarterly filing',
    icon: Calculator,
    type: 'tax',
    frequency: 'quarterly'
  },
  {
    id: 'yearly_analysis',
    title: 'Yearly Analysis',
    description: 'Annual financial performance and trend analysis',
    icon: TrendingUp,
    type: 'analysis',
    frequency: 'yearly'
  },
  {
    id: 'expense_breakdown',
    title: 'Expense Breakdown',
    description: 'Detailed categorization of all business expenses',
    icon: Receipt,
    type: 'expense',
    frequency: 'custom'
  },
  {
    id: 'platform_performance',
    title: 'Platform Performance',
    description: 'Earnings comparison across different gig platforms',
    icon: BarChart3,
    type: 'platform',
    frequency: 'custom'
  },
  {
    id: 'mileage_report',
    title: 'Mileage Report',
    description: 'Business mileage tracking and deduction calculations',
    icon: Car,
    type: 'mileage',
    frequency: 'custom'
  }
];

export function ReportsOverview() {
  const { userData, earnings, expenses, loading } = useUserData();
  const { getTotalEarnings, getTotalExpenses } = useUserStore();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  });

  const dateRanges = getDateRanges();
  const totalEarnings = getTotalEarnings();
  const totalExpenses = getTotalExpenses();

  // Calculate period-specific metrics
  const getPeriodMetrics = () => {
    const range = dateRanges[selectedPeriod as keyof typeof dateRanges];
    if (!range) return { earnings: 0, expenses: 0 };
    
    const startDate = range.start.toISOString().split('T')[0];
    const endDate = range.end.toISOString().split('T')[0];
    
    return {
      earnings: getTotalEarnings(startDate, endDate),
      expenses: getTotalExpenses(startDate, endDate)
    };
  };

  const periodMetrics = getPeriodMetrics();
  const netIncome = periodMetrics.earnings - periodMetrics.expenses;
  const taxRate = userData?.estimated_tax_rate || 0.25;
  const estimatedTaxes = netIncome * taxRate;

  // Sample recent reports
  const recentReports = [
    {
      id: '1',
      title: 'November 2024 Monthly Summary',
      type: 'Monthly Summary',
      generated: '2024-11-30',
      status: 'completed',
      size: '2.4 MB',
      earnings: 2850,
      expenses: 420
    },
    {
      id: '2',
      title: 'Q3 2024 Tax Report',
      type: 'Quarterly Tax Report',
      generated: '2024-09-30',
      status: 'completed',
      size: '1.8 MB',
      earnings: 8200,
      expenses: 1100
    },
    {
      id: '3',
      title: 'October 2024 Expense Breakdown',
      type: 'Expense Breakdown',
      generated: '2024-10-31',
      status: 'completed',
      size: '896 KB',
      earnings: 0,
      expenses: 380
    }
  ];

  // Expense categories for breakdown
  const expenseCategories = [
    { name: 'Fuel', amount: 240, icon: Car, color: 'bg-red-100 text-red-600' },
    { name: 'Food', amount: 120, icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    { name: 'Supplies', amount: 80, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600' },
    { name: 'Maintenance', amount: 60, icon: Car, color: 'bg-purple-100 text-purple-600' }
  ];

  if (loading.userData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-600">Generate and view your financial reports</p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full p-2">
            <FileText className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Period Selection & Quick Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Report Period</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                    <SelectItem value="lastYear">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Custom
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-600">Total Earnings</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(periodMetrics.earnings)}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Receipt className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-red-600">Total Expenses</p>
                <p className="text-xl font-bold text-red-900">{formatCurrency(periodMetrics.expenses)}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-600">Net Income</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(netIncome)}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calculator className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-600">Est. Taxes</p>
                <p className="text-xl font-bold text-purple-900">{formatCurrency(estimatedTaxes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Reports</CardTitle>
            <CardDescription>
              Create detailed financial reports for your gig work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 text-primary rounded-lg p-2">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{template.title}</h3>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {template.frequency}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Generate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reports</CardTitle>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-gray-600">{report.type}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(report.generated)}
                        </span>
                        <span>{report.size}</span>
                        {report.earnings > 0 && (
                          <span className="text-green-600">
                            +{formatCurrency(report.earnings)}
                          </span>
                        )}
                        {report.expenses > 0 && (
                          <span className="text-red-600">
                            -{formatCurrency(report.expenses)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseCategories.map((category) => {
                  const Icon = category.icon;
                  const percentage = periodMetrics.expenses > 0 ? (category.amount / periodMetrics.expenses) * 100 : 0;
                  return (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of expenses</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.amount)}</p>
                        <Progress value={percentage} className="w-20 h-2 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-green-600">Earnings Growth</p>
                    <p className="text-lg font-bold text-green-900">+12.3%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm text-red-600">Expense Change</p>
                    <p className="text-lg font-bold text-red-900">+5.7%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-blue-600">Net Income</p>
                    <p className="text-lg font-bold text-blue-900">+18.9%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Export your data in various formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to PDF
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}