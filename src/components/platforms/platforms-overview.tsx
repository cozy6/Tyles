"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/stores/user-store';
import { 
  Car, 
  Utensils, 
  ShoppingCart, 
  Package, 
  Coffee,
  Laptop,
  Plus,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  MapPin,
  Settings,
  ExternalLink,
  Shield,
  Zap
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

// Platform configuration
const availablePlatforms = [
  {
    id: 'uber',
    name: 'Uber',
    icon: Car,
    category: 'Rideshare',
    color: 'bg-black text-white',
    description: 'Ride-sharing and delivery services',
    features: ['Automatic earnings import', 'Trip tracking', 'Driver ratings'],
    connected: true,
    enabled: true
  },
  {
    id: 'lyft',
    name: 'Lyft',
    icon: Car,
    category: 'Rideshare',
    color: 'bg-pink-500 text-white',
    description: 'Ride-sharing services',
    features: ['Earnings tracking', 'Bonus monitoring', 'Peak hour alerts'],
    connected: true,
    enabled: false
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    icon: Utensils,
    category: 'Food Delivery',
    color: 'bg-red-500 text-white',
    description: 'Food delivery platform',
    features: ['Delivery tracking', 'Tips monitoring', 'Peak pay alerts'],
    connected: false,
    enabled: false
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    icon: Utensils,
    category: 'Food Delivery',
    color: 'bg-green-500 text-white',
    description: 'Food delivery via Uber',
    features: ['Order tracking', 'Earnings sync', 'Delivery analytics'],
    connected: false,
    enabled: false
  },
  {
    id: 'instacart',
    name: 'Instacart',
    icon: ShoppingCart,
    category: 'Grocery Delivery',
    color: 'bg-green-600 text-white',
    description: 'Grocery shopping and delivery',
    features: ['Shopping tracking', 'Tip optimization', 'Batch monitoring'],
    connected: false,
    enabled: false
  },
  {
    id: 'grubhub',
    name: 'Grubhub',
    icon: Utensils,
    category: 'Food Delivery',
    color: 'bg-orange-500 text-white',
    description: 'Food delivery platform',
    features: ['Order management', 'Earnings tracking', 'Schedule optimization'],
    connected: false,
    enabled: false
  },
  {
    id: 'amazon_flex',
    name: 'Amazon Flex',
    icon: Package,
    category: 'Package Delivery',
    color: 'bg-blue-600 text-white',
    description: 'Package delivery for Amazon',
    features: ['Block tracking', 'Route optimization', 'Earnings monitoring'],
    connected: false,
    enabled: false
  },
  {
    id: 'postmates',
    name: 'Postmates',
    icon: Coffee,
    category: 'Food Delivery',
    color: 'bg-yellow-500 text-white',
    description: 'Food and goods delivery',
    features: ['Delivery tracking', 'Blitz pricing', 'Earnings sync'],
    connected: false,
    enabled: false
  },
  {
    id: 'upwork',
    name: 'Upwork',
    icon: Laptop,
    category: 'Freelance',
    color: 'bg-green-700 text-white',
    description: 'Freelance work platform',
    features: ['Project tracking', 'Payment monitoring', 'Client management'],
    connected: false,
    enabled: false
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    icon: Laptop,
    category: 'Freelance',
    color: 'bg-green-500 text-white',
    description: 'Freelance services marketplace',
    features: ['Gig tracking', 'Revenue monitoring', 'Order management'],
    connected: false,
    enabled: false
  }
];

export function PlatformsOverview() {
  const { userData, platforms, earnings, loading } = useUserData();
  const { getTotalEarnings } = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate platform earnings
  const platformEarnings = earnings.reduce((acc, earning) => {
    const platformName = (earning as any).platforms?.name || 'Unknown';
    acc[platformName] = (acc[platformName] || 0) + earning.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalEarnings = getTotalEarnings();
  const connectedPlatforms = availablePlatforms.filter(p => p.connected);
  const enabledPlatforms = availablePlatforms.filter(p => p.enabled);

  const categories = ['all', 'Rideshare', 'Food Delivery', 'Package Delivery', 'Grocery Delivery', 'Freelance'];

  const filteredPlatforms = selectedCategory === 'all' 
    ? availablePlatforms 
    : availablePlatforms.filter(p => p.category === selectedCategory);

  if (loading.userData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platforms...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Platforms</h1>
            <p className="text-sm text-gray-600">Manage your gig work platform connections</p>
          </div>
          <div className="bg-primary/10 text-primary rounded-full p-2">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Connected</p>
                  <p className="text-2xl font-bold text-blue-600">{connectedPlatforms.length}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{enabledPlatforms.length}</p>
                </div>
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-purple-600">{categories.length - 1}</p>
                </div>
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
                </div>
                <DollarSign className="h-6 w-6 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? 'All Platforms' : category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connected Platforms Performance */}
        {connectedPlatforms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Performance
              </CardTitle>
              <CardDescription>
                Earnings breakdown by connected platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedPlatforms.map((platform) => {
                  const earnings = platformEarnings[platform.name] || 0;
                  const percentage = totalEarnings > 0 ? (earnings / totalEarnings) * 100 : 0;
                  const Icon = platform.icon;
                  
                  return (
                    <div key={platform.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${platform.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{platform.name}</p>
                          <p className="text-sm text-gray-600">{platform.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(earnings)}</p>
                        <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Directory */}
        <Card>
          <CardHeader>
            <CardTitle>Available Platforms</CardTitle>
            <CardDescription>
              Connect to your gig work platforms for automatic earnings tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlatforms.map((platform) => {
                const Icon = platform.icon;
                const earnings = platformEarnings[platform.name] || 0;
                
                return (
                  <div key={platform.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${platform.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{platform.name}</h3>
                          <p className="text-sm text-gray-600">{platform.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {platform.connected && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {platform.enabled && (
                          <Badge variant="default" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
                    
                    {platform.connected && earnings > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Total Earned</span>
                          <span className="text-lg font-bold text-green-900">{formatCurrency(earnings)}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase">Features</p>
                      <ul className="text-sm space-y-1">
                        {platform.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={platform.enabled} 
                          disabled={!platform.connected}
                        />
                        <span className="text-sm text-gray-600">
                          {platform.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {platform.connected ? (
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Settings
                          </Button>
                        ) : (
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Platform Integration Help
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security:</strong> All platform connections use secure OAuth authentication. 
                  We never store your platform passwords and can only access earnings data you explicitly authorize.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sync Frequency:</strong> Connected platforms sync earnings data every 24 hours. 
                  You can manually refresh anytime from the settings menu.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  <strong>Platform Support:</strong> Some platforms may require additional setup in their driver/partner apps. 
                  Check each platform's requirements before connecting.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}