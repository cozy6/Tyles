"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/stores/user-store';
import { 
  Calculator, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Clock,
  Target,
  PieChart,
  Banknote,
  CreditCard
} from 'lucide-react';

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Helper function to get quarter info
const getQuarterInfo = (date: Date) => {
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  const year = date.getFullYear();
  
  // Calculate quarter end date
  const quarterEndMonth = quarter * 3 - 1;
  const quarterEndDate = new Date(year, quarterEndMonth + 1, 0);
  
  // Calculate due date (15th of month after quarter end)
  const dueDate = new Date(quarterEndDate);
  dueDate.setMonth(dueDate.getMonth() + 1);
  dueDate.setDate(15);
  
  return {
    quarter,
    year,
    quarterEndDate,
    dueDate,
    label: `Q${quarter} ${year}`
  };
};

export function TaxOverview() {
  const { userData, earnings, expenses, loading } = useUserData();
  const { getTotalEarnings, getTotalExpenses } = useUserStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate year-to-date totals
  const yearStart = `${selectedYear}-01-01`;
  const yearEnd = `${selectedYear}-12-31`;
  const totalEarnings = getTotalEarnings(yearStart, yearEnd);
  const totalExpenses = getTotalExpenses(yearStart, yearEnd);
  const netIncome = totalEarnings - totalExpenses;

  // Tax calculations
  const taxRate = userData?.estimated_tax_rate || 0.25;
  const estimatedTaxes = netIncome * taxRate;
  const selfEmploymentTax = netIncome * 0.153; // 15.3% for self-employment
  const totalTaxLiability = estimatedTaxes + selfEmploymentTax;

  // Quarterly tax calculations
  const currentQuarter = getQuarterInfo(new Date());
  const quarterlyPayment = totalTaxLiability / 4;
  
  // Get quarterly earnings/expenses
  const quarters = [1, 2, 3, 4].map(q => {
    const quarterStart = new Date(selectedYear, (q - 1) * 3, 1);
    const quarterEnd = new Date(selectedYear, q * 3, 0);
    const startDate = quarterStart.toISOString().split('T')[0];
    const endDate = quarterEnd.toISOString().split('T')[0];
    
    const quarterEarnings = getTotalEarnings(startDate, endDate);
    const quarterExpenses = getTotalExpenses(startDate, endDate);
    const quarterNet = quarterEarnings - quarterExpenses;
    const quarterTax = quarterNet * taxRate;
    
    return {
      quarter: q,
      earnings: quarterEarnings,
      expenses: quarterExpenses,
      netIncome: quarterNet,
      estimatedTax: quarterTax,
      dueDate: getQuarterInfo(quarterEnd).dueDate
    };
  });

  // Tax deduction categories
  const deductionCategories = {
    vehicle: { name: 'Vehicle Expenses', amount: 0, description: 'Gas, maintenance, insurance' },
    phone: { name: 'Phone & Internet', amount: 0, description: 'Business use portion' },
    supplies: { name: 'Supplies & Equipment', amount: 0, description: 'Business supplies' },
    other: { name: 'Other Business Expenses', amount: 0, description: 'Meals, fees, etc.' }
  };

  // Calculate deductions by category
  expenses.forEach(expense => {
    const category = expense.category || 'other';
    if (category.includes('vehicle') || category === 'gas') {
      deductionCategories.vehicle.amount += expense.amount;
    } else if (category === 'phone') {
      deductionCategories.phone.amount += expense.amount;
    } else if (category === 'supplies') {
      deductionCategories.supplies.amount += expense.amount;
    } else {
      deductionCategories.other.amount += expense.amount;
    }
  });

  if (loading.userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tax information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-gray-200 px-4 py-6 -mx-4 -mt-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax Center</h1>
            <p className="text-sm text-gray-600">Manage your tax obligations and deductions</p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {[2024, 2023, 2022].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tax Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Quarterly Tax Reminder:</strong> Your next quarterly tax payment for {currentQuarter.label} is due on {formatDate(currentQuarter.dueDate.toISOString())}. 
            Estimated payment: ${quarterlyPayment.toFixed(2)}
          </AlertDescription>
        </Alert>

        {/* Tax Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600">Year to date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Receipt className="h-4 w-4 text-blue-600" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600">Tax deductions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-purple-600" />
                Net Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${netIncome.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600">Taxable income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calculator className="h-4 w-4 text-red-600" />
                Est. Tax Owed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalTaxLiability.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600">Including self-employment</p>
            </CardContent>
          </Card>
        </div>

        {/* Quarterly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quarterly Breakdown
            </CardTitle>
            <CardDescription>
              Track your quarterly tax obligations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quarters.map((quarter) => {
                const isPast = quarter.dueDate < new Date();
                const isCurrent = quarter.quarter === currentQuarter.quarter;
                
                return (
                  <Card key={quarter.quarter} className={`${isCurrent ? 'border-primary' : ''}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        Q{quarter.quarter} {selectedYear}
                        {isPast && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {isCurrent && <Clock className="h-4 w-4 text-orange-500" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-xs text-gray-600">
                        Due: {formatDate(quarter.dueDate.toISOString())}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Earnings:</span>
                          <span className="font-medium">${quarter.earnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Expenses:</span>
                          <span className="font-medium">${quarter.expenses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                          <span>Est. Tax:</span>
                          <span className="text-red-600">${quarter.estimatedTax.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tax Deductions by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tax Deductions by Category
            </CardTitle>
            <CardDescription>
              Maximize your business deductions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(deductionCategories).map(([key, category]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${category.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      ${(category.amount * taxRate).toFixed(2)} tax savings
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tax Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tax Tips & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Track All Business Expenses</p>
                  <p className="text-sm text-blue-700">Keep receipts for gas, phone bills, vehicle maintenance, and other business expenses.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Make Quarterly Payments</p>
                  <p className="text-sm text-green-700">Pay estimated taxes quarterly to avoid penalties. Due dates: Jan 15, Apr 15, Jun 15, Sep 15.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Self-Employment Tax</p>
                  <p className="text-sm text-orange-700">Remember to account for 15.3% self-employment tax on net earnings from self-employment.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Generate Tax Report</p>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-green-100 text-green-600 rounded-full p-2">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Tax Calculator</p>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}