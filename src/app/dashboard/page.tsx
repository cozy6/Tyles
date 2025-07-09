"use client";

import { MobileLayout } from "@/components/layout/mobile-layout";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { EarningsOverview } from "@/components/dashboard/earnings-overview";
import { DailyProgress } from "@/components/dashboard/daily-progress";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useUserData } from "@/hooks/use-user-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Receipt, 
  Calculator, 
  TrendingUp, 
  Bell,
  Target,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  DollarSign
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const {
    userData,
    totalEarnings,
    totalExpenses,
    availableBalance,
    estimatedTaxes,
    dailyGoal,
    weeklyGoal,
    monthlyGoal,
    getEarningsByPlatform,
    getRecentActivity,
    loading,
    errors,
    refreshData,
    hasCompletedOnboarding,
  } = useUserData();

  // Redirect to onboarding if not completed
  if (userData && !hasCompletedOnboarding) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Complete Your Setup</h2>
              <p className="text-gray-600 mb-4">
                Finish setting up your account to access the dashboard
              </p>
              <Link href="/onboarding">
                <Button className="w-full">Complete Onboarding</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const platformEarnings = getEarningsByPlatform();
  const recentActivity = getRecentActivity(5);

  // Transform platform data for EarningsOverview component
  const formattedPlatforms = platformEarnings.map(pe => ({
    id: pe.platformId,
    name: pe.platform?.name || 'Unknown',
    type: pe.platform?.type || 'other',
    earnings: pe.earnings,
    previousEarnings: pe.earnings * 0.9, // Mock previous earnings
    hours: pe.hours,
    trips: pe.trips,
    color: pe.platform?.color || '#6366f1',
    isActive: pe.earnings > 0,
  }));

  // Format goals for DailyProgress component
  const formattedGoals = [
    {
      id: "daily-earnings",
      type: "daily" as const,
      target: dailyGoal.target,
      current: dailyGoal.current,
      label: "Daily Earnings",
      icon: Target,
      color: "#6366f1",
    },
    {
      id: "weekly-earnings",
      type: "weekly" as const,
      target: weeklyGoal.target,
      current: weeklyGoal.current,
      label: "Weekly Earnings",
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      id: "monthly-earnings",
      type: "monthly" as const,
      target: monthlyGoal.target,
      current: monthlyGoal.current,
      label: "Monthly Earnings",
      icon: Award,
      color: "#f59e0b",
    },
  ].filter(goal => goal.target > 0); // Only show goals that have been set

  return (
    <ProtectedRoute>
      <MobileLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {userData?.full_name || 'there'}! Here's your financial overview.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={refreshData}
                disabled={loading.earnings || loading.expenses}
              >
                <RefreshCw className={`h-4 w-4 ${loading.earnings || loading.expenses ? 'animate-spin' : ''}`} />
              </Button>
              <Link href="/earnings/new">
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Earnings
                </Button>
              </Link>
            </div>
          </div>

          {/* Error Alerts */}
          {Object.entries(errors).some(([_, error]) => error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                There was an error loading your data. Please try refreshing.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Balance Card */}
          {loading.userData ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-12 w-48 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <BalanceCard
              availableBalance={availableBalance}
              totalEarnings={totalEarnings}
              taxWithheld={estimatedTaxes}
              expenses={totalExpenses}
              previousBalance={availableBalance * 0.9} // Mock previous balance
            />
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/expenses/new">
              <Button variant="outline" className="flex items-center gap-2 h-12 w-full">
                <Receipt className="h-4 w-4" />
                Add Expense
              </Button>
            </Link>
            <Link href="/earnings/new">
              <Button variant="outline" className="flex items-center gap-2 h-12 w-full">
                <DollarSign className="h-4 w-4" />
                Add Earnings
              </Button>
            </Link>
          </div>

          {/* Earnings Overview */}
          {loading.earnings ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EarningsOverview
              platforms={formattedPlatforms}
              timeRange="today"
            />
          )}

          {/* Goals Progress */}
          {formattedGoals.length > 0 && (
            <DailyProgress goals={formattedGoals} />
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Link href="/activity">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading.earnings || loading.expenses ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Skeleton className="h-4 w-4 mt-1" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className="mt-1">
                        {activity.type === "earning" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <Receipt className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{activity.description}</p>
                          <Badge
                            variant={activity.type === "earning" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Add some earnings or expenses to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {totalEarnings > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      Tax Optimization
                    </p>
                    <p className="text-sm text-blue-700">
                      You've earned ${totalEarnings.toFixed(2)} this period. Consider setting aside ${estimatedTaxes.toFixed(2)} for taxes.
                    </p>
                  </div>
                )}
                
                {dailyGoal.progress > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">
                      Goal Progress
                    </p>
                    <p className="text-sm text-green-700">
                      You're {dailyGoal.progress.toFixed(1)}% toward your daily goal of ${dailyGoal.target}.
                      {dailyGoal.progress >= 100 ? ' Great job!' : ` Keep going!`}
                    </p>
                  </div>
                )}
                
                {formattedPlatforms.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">
                      Platform Performance
                    </p>
                    <p className="text-sm text-yellow-700">
                      {formattedPlatforms.length === 1 
                        ? `You're currently active on ${formattedPlatforms[0].name}. Consider diversifying to other platforms.`
                        : `You're active on ${formattedPlatforms.length} platforms. Great diversification!`
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    </ProtectedRoute>
  );
}