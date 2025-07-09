"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useUserData } from '@/hooks/use-user-data';
import { 
  Home,
  DollarSign,
  Receipt,
  Calculator,
  TrendingUp,
  Car,
  PiggyBank,
  FileText,
  Settings,
  User,
  Bell,
  HelpCircle,
  MessageSquare,
  Star,
  Shield,
  LogOut,
  ChevronRight,
  Download,
  Upload,
  Smartphone,
  Globe,
  Heart,
  Coffee,
  Zap,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export function MenuOverview() {
  const { user, logout } = useAuth();
  const { userData } = useUserData();

  const mainMenuItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      description: 'Overview of your finances',
      available: true
    },
    { 
      name: 'Earnings', 
      href: '/earnings', 
      icon: DollarSign, 
      description: 'Track your income',
      available: true
    },
    { 
      name: 'Expenses', 
      href: '/expenses', 
      icon: Receipt, 
      description: 'Manage your expenses',
      available: true
    },
    { 
      name: 'Tax Center', 
      href: '/taxes', 
      icon: Calculator, 
      description: 'Tax calculations and planning',
      available: true
    },
    { 
      name: 'Insights', 
      href: '/insights', 
      icon: TrendingUp, 
      description: 'AI-powered financial insights',
      available: false
    },
    { 
      name: 'Platforms', 
      href: '/platforms', 
      icon: Car, 
      description: 'Manage connected platforms',
      available: false
    },
    { 
      name: 'Goals', 
      href: '/goals', 
      icon: PiggyBank, 
      description: 'Set and track financial goals',
      available: false
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: FileText, 
      description: 'Generate financial reports',
      available: false
    },
  ];

  const accountMenuItems = [
    { 
      name: 'Profile Settings', 
      href: '/settings', 
      icon: User, 
      description: 'Manage your account',
      available: true
    },
    { 
      name: 'Notifications', 
      href: '/settings', 
      icon: Bell, 
      description: 'Notification preferences',
      available: true
    },
    { 
      name: 'Security', 
      href: '/settings', 
      icon: Shield, 
      description: 'Account security',
      available: true
    },
  ];

  const supportMenuItems = [
    { 
      name: 'Help Center', 
      href: '#', 
      icon: HelpCircle, 
      description: 'Get help and tutorials',
      available: false
    },
    { 
      name: 'Contact Support', 
      href: '#', 
      icon: MessageSquare, 
      description: 'Get in touch with us',
      available: false
    },
    { 
      name: 'Rate Tyles', 
      href: '#', 
      icon: Star, 
      description: 'Rate us on the app store',
      available: false
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-gray-200 px-4 py-6 -mx-4 -mt-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.photoURL || "/placeholder-avatar.jpg"} />
            <AvatarFallback>
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {user?.displayName || 'User'}
            </h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">$0</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">$0</div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">$0</div>
                <div className="text-sm text-gray-600">Expenses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Main Menu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className={`${!item.available ? 'opacity-50' : ''}`}>
                    {item.available ? (
                      <Link href={item.href}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-500">{item.name}</p>
                            <p className="text-sm text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Account Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accountMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Support Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {supportMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="opacity-50">
                    <div className="flex items-center justify-between p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-500">{item.name}</p>
                          <p className="text-sm text-gray-400">{item.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              App Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Version</p>
                  <p className="text-sm text-gray-600">1.0.0 (Beta)</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Build</p>
                  <p className="text-sm text-gray-600">2024.01.0</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Made with love by the Tyles team</span>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <a href="#" className="hover:text-gray-700">Privacy Policy</a>
                  <span>•</span>
                  <a href="#" className="hover:text-gray-700">Terms of Service</a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}