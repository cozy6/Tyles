"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/stores/user-store';
import { 
  Clock, 
  Search,
  Filter,
  DollarSign,
  Minus,
  Plus,
  Car,
  Utensils,
  ShoppingCart,
  Package,
  Coffee,
  Laptop,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MapPin,
  Receipt,
  Star,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity
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

// Helper function to format time
const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Platform icons mapping
const platformIcons = {
  'Uber': Car,
  'Lyft': Car,
  'DoorDash': Utensils,
  'Uber Eats': Utensils,
  'Instacart': ShoppingCart,
  'Grubhub': Utensils,
  'Amazon Flex': Package,
  'Postmates': Coffee,
  'Upwork': Laptop,
  'Fiverr': Laptop
};

// Sample transactions (would normally come from database)
const sampleTransactions = [
  {
    id: '1',
    type: 'earning',
    amount: 45.50,
    description: 'Delivery completed',
    platform: 'DoorDash',
    date: '2024-01-15T14:30:00Z',
    status: 'completed',
    location: 'Downtown',
    category: 'food_delivery',
    hasReceipt: false
  },
  {
    id: '2',
    type: 'expense',
    amount: 35.00,
    description: 'Gas fill-up',
    platform: null,
    date: '2024-01-15T10:15:00Z',
    status: 'completed',
    location: 'Shell Station',
    category: 'fuel',
    hasReceipt: true
  },
  {
    id: '3',
    type: 'earning',
    amount: 28.75,
    description: 'Ride completed',
    platform: 'Uber',
    date: '2024-01-14T19:45:00Z',
    status: 'completed',
    location: 'Airport',
    category: 'rideshare',
    hasReceipt: false
  },
  {
    id: '4',
    type: 'expense',
    amount: 12.50,
    description: 'Car wash',
    platform: null,
    date: '2024-01-14T16:20:00Z',
    status: 'completed',
    location: 'Auto Spa',
    category: 'maintenance',
    hasReceipt: true
  },
  {
    id: '5',
    type: 'earning',
    amount: 52.25,
    description: 'Multiple deliveries',
    platform: 'Instacart',
    date: '2024-01-14T11:00:00Z',
    status: 'completed',
    location: 'Westside',
    category: 'grocery_delivery',
    hasReceipt: false
  },
  {
    id: '6',
    type: 'expense',
    amount: 18.99,
    description: 'Phone car mount',
    platform: null,
    date: '2024-01-13T15:30:00Z',
    status: 'completed',
    location: 'Best Buy',
    category: 'equipment',
    hasReceipt: true
  },
  {
    id: '7',
    type: 'earning',
    amount: 38.00,
    description: 'Evening rides',
    platform: 'Lyft',
    date: '2024-01-13T20:15:00Z',
    status: 'completed',
    location: 'Entertainment District',
    category: 'rideshare',
    hasReceipt: false
  },
  {
    id: '8',
    type: 'expense',
    amount: 45.00,
    description: 'Oil change',
    platform: null,
    date: '2024-01-12T13:00:00Z',
    status: 'completed',
    location: 'Jiffy Lube',
    category: 'maintenance',
    hasReceipt: true
  }
];

export function ActivityOverview() {
  const { userData, earnings, expenses, loading } = useUserData();
  const { getTotalEarnings, getTotalExpenses } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Filter transactions
  const filteredTransactions = sampleTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.platform && transaction.platform.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesPlatform = filterPlatform === 'all' || transaction.platform === filterPlatform;
    
    return matchesSearch && matchesType && matchesPlatform;
  });

  // Get unique platforms
  const uniquePlatforms = [...new Set(sampleTransactions.map(t => t.platform).filter((platform): platform is string => Boolean(platform)))];

  // Calculate totals
  const totalEarnings = filteredTransactions
    .filter(t => t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading.userData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
            <p className="text-sm text-gray-600">Complete history of your earnings and expenses</p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full p-2">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
                </div>
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                </div>
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Income</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(totalEarnings - totalExpenses)}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-xl font-bold text-purple-600">{filteredTransactions.length}</p>
                </div>
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="earning">Earnings</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {uniquePlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => {
                const Icon = transaction.platform ? platformIcons[transaction.platform as keyof typeof platformIcons] || DollarSign : DollarSign;
                const isEarning = transaction.type === 'earning';
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isEarning ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.hasReceipt && (
                            <Badge variant="secondary" className="text-xs">
                              <Receipt className="h-3 w-3 mr-1" />
                              Receipt
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(transaction.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {transaction.location}
                          </span>
                          {transaction.platform && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.platform}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          isEarning ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isEarning ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{transaction.category.replace('_', ' ')}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No transactions found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Earning
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Minus className="h-4 w-4" />
                Add Expense
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}