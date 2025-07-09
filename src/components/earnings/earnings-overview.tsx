"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/stores/user-store';
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Filter,
  Car,
  Truck,
  Laptop,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Clock,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Star,
  Route,
  User
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

export function EarningsOverview() {
  const { userData, platforms, earnings, loading } = useUserData();
  const { getTotalEarnings, getGoalProgress } = useUserStore();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedEarning, setSelectedEarning] = useState<any>(null);

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case 'rideshare':
        return Car;
      case 'delivery':
        return Truck;
      case 'freelance':
        return Laptop;
      default:
        return MoreHorizontal;
    }
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };

  const { start, end } = getDateRange(selectedPeriod);
  const totalEarnings = getTotalEarnings(start, end);
  const filteredEarnings = earnings.filter(earning => 
    earning.date >= start && earning.date <= end
  );

  // Group earnings by platform
  const earningsByPlatform = filteredEarnings.reduce((acc, earning) => {
    const platformName = (earning as any).platforms?.name || 'Unknown';
    if (!acc[platformName]) {
      acc[platformName] = {
        total: 0,
        count: 0,
        platform: (earning as any).platforms
      };
    }
    acc[platformName].total += earning.amount;
    acc[platformName].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number; platform: any }>);

  const dailyGoalProgress = getGoalProgress('daily');
  const weeklyGoalProgress = getGoalProgress('weekly');
  const monthlyGoalProgress = getGoalProgress('monthly');

  if (loading.userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-gray-200 px-4 py-6 -mx-4 -mt-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
            <p className="text-sm text-gray-600">Track your income across all platforms</p>
          </div>
          <Link href="/earnings/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Earning
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Period Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
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

        {/* Total Earnings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Total Earnings
            </CardTitle>
            <CardDescription>
              {selectedPeriod === 'today' ? 'Today' : 
               selectedPeriod === 'week' ? 'Past 7 days' :
               selectedPeriod === 'month' ? 'This month' : 'This year'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${totalEarnings.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {filteredEarnings.length} transactions
            </p>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    ${dailyGoalProgress.current.toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-500">
                    / ${dailyGoalProgress.target.toFixed(0)}
                  </span>
                </div>
                <Progress value={Math.min(dailyGoalProgress.progress, 100)} className="h-2" />
                <p className="text-xs text-gray-600">
                  {dailyGoalProgress.progress.toFixed(0)}% complete
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    ${weeklyGoalProgress.current.toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-500">
                    / ${weeklyGoalProgress.target.toFixed(0)}
                  </span>
                </div>
                <Progress value={Math.min(weeklyGoalProgress.progress, 100)} className="h-2" />
                <p className="text-xs text-gray-600">
                  {weeklyGoalProgress.progress.toFixed(0)}% complete
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    ${monthlyGoalProgress.current.toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-500">
                    / ${monthlyGoalProgress.target.toFixed(0)}
                  </span>
                </div>
                <Progress value={Math.min(monthlyGoalProgress.progress, 100)} className="h-2" />
                <p className="text-xs text-gray-600">
                  {monthlyGoalProgress.progress.toFixed(0)}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings by Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Earnings by Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(earningsByPlatform).map(([platformName, data]) => {
                const Icon = getPlatformIcon(data.platform?.type || 'other');
                return (
                  <div key={platformName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-full"
                        style={{ backgroundColor: `${data.platform?.color || '#6366f1'}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: data.platform?.color || '#6366f1' }} />
                      </div>
                      <div>
                        <p className="font-medium">{platformName}</p>
                        <p className="text-sm text-gray-600">{data.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${data.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        ${(data.total / data.count).toFixed(2)} avg
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {Object.keys(earningsByPlatform).length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No earnings found for this period</p>
                  <Link href="/earnings/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Earning
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEarnings.slice(0, 10).map((earning) => {
                const platform = (earning as any).platforms;
                const Icon = getPlatformIcon(platform?.type || 'other');
                
                return (
                  <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-full"
                        style={{ backgroundColor: `${platform?.color || '#6366f1'}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: platform?.color || '#6366f1' }} />
                      </div>
                      <div>
                        <p className="font-medium">{platform?.name || 'Unknown Platform'}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(earning.date)}
                          {(earning.hours_worked || 0) > 0 && (
                            <>
                              <Clock className="h-3 w-3 ml-2" />
                              {earning.hours_worked || 0}h
                            </>
                          )}
                          {(earning.trip_count || 0) > 0 && (
                            <>
                              <MapPin className="h-3 w-3 ml-2" />
                              {earning.trip_count || 0} trips
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +${earning.amount.toFixed(2)}
                        </p>
                        {(earning.hours_worked || 0) > 0 && (
                          <p className="text-sm text-gray-600">
                            ${(earning.amount / (earning.hours_worked || 1)).toFixed(2)}/hr
                          </p>
                        )}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedEarning(earning)} className="w-full sm:w-auto">
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">Details</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <div
                                className="p-2 rounded-full"
                                style={{ backgroundColor: `${platform?.color || '#6366f1'}20` }}
                              >
                                <Icon className="h-4 w-4" style={{ color: platform?.color || '#6366f1' }} />
                              </div>
                              Earning Details - {platform?.name || 'Unknown Platform'}
                            </DialogTitle>
                            <DialogDescription>
                              Complete details for this earning record
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            {/* Summary */}
                            <div className="grid grid-cols-2 gap-4">
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">Total Amount</span>
                                  </div>
                                  <p className="text-2xl font-bold text-green-600">
                                    ${earning.amount.toFixed(2)}
                                  </p>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">Date</span>
                                  </div>
                                  <p className="text-lg font-semibold">
                                    {formatDate(earning.date)}
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            {/* Detailed Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(earning.hours_worked || 0) > 0 && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <Clock className="h-5 w-5 text-gray-600" />
                                  <div>
                                    <p className="font-medium">Hours Worked</p>
                                    <p className="text-sm text-gray-600">{earning.hours_worked || 0} hours</p>
                                  </div>
                                </div>
                              )}
                              
                              {(earning.trip_count || 0) > 0 && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <Route className="h-5 w-5 text-gray-600" />
                                  <div>
                                    <p className="font-medium">Trip Count</p>
                                    <p className="text-sm text-gray-600">{earning.trip_count || 0} trips</p>
                                  </div>
                                </div>
                              )}
                              
                              
                              {earning.tips > 0 && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                  <Star className="h-5 w-5 text-yellow-600" />
                                  <div>
                                    <p className="font-medium">Tips</p>
                                    <p className="text-sm text-gray-600">${earning.tips.toFixed(2)}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Calculations */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span>Base Earnings</span>
                                    <span className="font-medium">
                                      ${(earning.amount - (earning.tips || 0)).toFixed(2)}
                                    </span>
                                  </div>
                                  
                                  {earning.tips > 0 && (
                                    <div className="flex justify-between items-center">
                                      <span>Tips</span>
                                      <span className="font-medium text-yellow-600">
                                        +${earning.tips.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">Total</span>
                                      <span className="font-bold text-green-600">
                                        ${earning.amount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {(earning.hours_worked || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                                      <span>Hourly Rate</span>
                                      <span>
                                        ${(earning.amount / (earning.hours_worked || 1)).toFixed(2)}/hr
                                      </span>
                                    </div>
                                  )}
                                  
                                  {(earning.trip_count || 0) > 0 && (
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                      <span>Per Trip</span>
                                      <span>
                                        ${(earning.amount / (earning.trip_count || 1)).toFixed(2)}/trip
                                      </span>
                                    </div>
                                  )}
                                  
                                </div>
                              </CardContent>
                            </Card>
                            
                            {/* Actions */}
                            <div className="flex gap-2 pt-4">
                              <Button variant="outline" className="flex-1">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Earning
                              </Button>
                              <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
              
              {filteredEarnings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No earnings found for this period</p>
                  <Link href="/earnings/new">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Earning
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}