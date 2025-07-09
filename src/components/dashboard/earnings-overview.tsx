"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Car, 
  Truck, 
  Laptop, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Route,
  Star,
  BarChart3,
  Edit,
  Settings
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Platform {
  id: string;
  name: string;
  type: 'rideshare' | 'delivery' | 'freelance' | 'other';
  earnings: number;
  previousEarnings: number;
  hours: number;
  trips: number;
  color: string;
  isActive: boolean;
}

interface EarningsOverviewProps {
  platforms: Platform[];
  timeRange: 'today' | 'week' | 'month';
  className?: string;
}

const platformIcons = {
  rideshare: Car,
  delivery: Truck,
  freelance: Laptop,
  other: MoreHorizontal,
};

export function EarningsOverview({ platforms, timeRange, className }: EarningsOverviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  
  const totalEarnings = platforms.reduce((sum, platform) => sum + platform.earnings, 0);
  const totalHours = platforms.reduce((sum, platform) => sum + platform.hours, 0);
  const totalTrips = platforms.reduce((sum, platform) => sum + platform.trips, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return 'Today';
    }
  };

  const PlatformCard = ({ platform }: { platform: Platform }) => {
    const Icon = platformIcons[platform.type];
    const earningsChange = platform.earnings - platform.previousEarnings;
    const isPositiveChange = earningsChange >= 0;
    const earningsPercentage = totalEarnings > 0 ? (platform.earnings / totalEarnings) * 100 : 0;
    const hourlyRate = platform.hours > 0 ? platform.earnings / platform.hours : 0;

    return (
      <Card 
        className={`cursor-pointer transition-all ${
          selectedPlatform === platform.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
        }`}
        onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? null : platform.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${platform.color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color: platform.color }} />
              </div>
              <div>
                <p className="font-medium text-sm">{platform.name}</p>
                <p className="text-xs text-gray-500 capitalize">{platform.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isPositiveChange ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <Badge variant={platform.isActive ? "default" : "secondary"} className="text-xs">
                {platform.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{formatCurrency(platform.earnings)}</span>
              <span className={`text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                {isPositiveChange ? '+' : ''}{formatCurrency(earningsChange)}
              </span>
            </div>
            
            <Progress value={earningsPercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{earningsPercentage.toFixed(1)}% of total</span>
              <span>{formatCurrency(hourlyRate)}/hr</span>
            </div>

            {selectedPlatform === platform.id && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Hours</span>
                  </div>
                  <span className="font-medium">{platform.hours.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Trips</span>
                  </div>
                  <span className="font-medium">{platform.trips}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Earnings Overview</CardTitle>
          <Badge variant="outline">{getTimeRangeLabel()}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>Total: {formatCurrency(totalEarnings)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{totalHours.toFixed(1)}h</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{totalTrips} trips</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {platforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>
        
        {platforms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Car className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No platforms connected yet</p>
            <Button size="sm" className="mt-2">
              Connect Platform
            </Button>
          </div>
        )}
        
        {/* View Details Button */}
        {platforms.length > 0 && (
          <div className="pt-4 border-t">
            <Link href="/earnings">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}