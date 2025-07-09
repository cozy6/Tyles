"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/stores/user-store';
import { 
  Receipt, 
  Plus, 
  TrendingDown, 
  Calendar, 
  Filter,
  Car,
  Fuel,
  Smartphone,
  Utensils,
  Wrench,
  Building,
  CreditCard,
  DollarSign,
  PieChart,
  FileText,
  Camera
} from 'lucide-react';
import Link from 'next/link';

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Expense category configuration
const expenseCategories = {
  gas: { name: 'Gas & Fuel', icon: Fuel, color: '#ef4444' },
  vehicle_maintenance: { name: 'Vehicle Maintenance', icon: Wrench, color: '#f97316' },
  vehicle_insurance: { name: 'Vehicle Insurance', icon: Car, color: '#eab308' },
  phone: { name: 'Phone & Data', icon: Smartphone, color: '#22c55e' },
  food: { name: 'Food & Meals', icon: Utensils, color: '#06b6d4' },
  supplies: { name: 'Supplies & Equipment', icon: Building, color: '#8b5cf6' },
  other: { name: 'Other', icon: FileText, color: '#6b7280' }
};

export function ExpensesOverview() {
  const { userData, expenses, loading } = useUserData();
  const { getTotalExpenses } = useUserStore();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const getDateRange = (period: string) => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };

  const { start, end } = getDateRange(selectedPeriod);
  const totalExpenses = getTotalExpenses(start, end);
  const filteredExpenses = expenses.filter(expense => 
    expense.date >= start && expense.date <= end
  );

  // Group expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        count: 0,
        category: expenseCategories[category as keyof typeof expenseCategories] || expenseCategories.other
      };
    }
    acc[category].total += expense.amount;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number; category: typeof expenseCategories.other }>);

  // Calculate tax savings (assuming 25% tax rate)
  const estimatedTaxSavings = totalExpenses * (userData?.estimated_tax_rate || 0.25);

  if (loading.userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-gray-200 px-4 py-6 -mx-4 -mt-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-sm text-gray-600">Track your business expenses for tax deductions</p>
          </div>
          <Link href="/expenses/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Period Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'quarter', label: 'This Quarter' },
            { key: 'year', label: 'This Year' }
          ].map((period) => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.key)}
              className="whitespace-nowrap"
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-600" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {filteredExpenses.length} transactions
              </p>
            </CardContent>
          </Card>

          {/* Tax Savings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Tax Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${estimatedTaxSavings.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Estimated deduction value
              </p>
            </CardContent>
          </Card>

          {/* Average per Transaction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                Average Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                ${filteredExpenses.length > 0 ? (totalExpenses / filteredExpenses.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(expensesByCategory).map(([categoryKey, data]) => {
                const Icon = data.category.icon;
                const percentage = totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0;
                
                return (
                  <div key={categoryKey} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${data.category.color}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: data.category.color }} />
                        </div>
                        <div>
                          <p className="font-medium">{data.category.name}</p>
                          <p className="text-sm text-gray-600">{data.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${data.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
              
              {Object.keys(expensesByCategory).length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No expenses found for this period</p>
                  <Link href="/expenses/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Expense
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredExpenses.slice(0, 10).map((expense) => {
                const categoryInfo = expenseCategories[expense.category as keyof typeof expenseCategories] || expenseCategories.other;
                const Icon = categoryInfo.icon;
                
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-full"
                        style={{ backgroundColor: `${categoryInfo.color}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: categoryInfo.color }} />
                      </div>
                      <div>
                        <p className="font-medium">{categoryInfo.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(expense.date)}
                          {expense.description && (
                            <span className="truncate max-w-[200px]">
                              • {expense.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        -${expense.amount.toFixed(2)}
                      </p>
                      {expense.receipt_url && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Camera className="h-3 w-3" />
                          Receipt
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredExpenses.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No expenses found for this period</p>
                  <Link href="/expenses/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/expenses/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Add Expense</p>
                  <p className="text-sm text-gray-600">Log new expense</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-green-100 text-green-600 rounded-full p-2">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Scan Receipt</p>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}