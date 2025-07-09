"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import {
  Home,
  Plus,
  Receipt,
  Calculator,
  Settings,
  Menu,
  Bell,
  Search,
  User,
  DollarSign,
  TrendingUp,
  Car,
  PiggyBank,
  FileText,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Earnings", href: "/earnings", icon: DollarSign },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Taxes", href: "/taxes", icon: Calculator },
  { name: "Insights", href: "/insights", icon: TrendingUp },
];

const secondaryNavItems: NavItem[] = [
  { name: "Platforms", href: "/platforms", icon: Car },
  { name: "Goals", href: "/goals", icon: PiggyBank },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

const bottomNavItems: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Earnings", href: "/earnings", icon: DollarSign },
  { name: "Add", href: "/expenses/new", icon: Plus },
  { name: "Taxes", href: "/taxes", icon: Calculator },
  { name: "More", href: "/menu", icon: Menu },
];

export function MobileLayout({ children }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setSidebarOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="h-4 w-4" />
        <span>{item.name}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  const BottomNavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex flex-col items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors min-w-0",
          isActive
            ? "text-primary"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || "/placeholder-avatar.jpg"} />
                    <AvatarFallback>
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="flex-1 space-y-1">
                  {mainNavItems.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                  
                  <Separator className="my-4" />
                  
                  {secondaryNavItems.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                </nav>
                
                <div className="mt-auto pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-gray-900"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-md p-1">
              <DollarSign className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-semibold">Tyles</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              3
            </Badge>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center fixed bottom-0 left-0 right-0 z-30 md:hidden">
        {bottomNavItems.map((item) => (
          <BottomNavLink key={item.name} item={item} />
        ))}
      </nav>
    </div>
  );
}