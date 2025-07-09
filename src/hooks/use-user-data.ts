"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUserStore } from '@/stores/user-store';

export function useUserData() {
  const { user } = useAuth();
  const {
    userData,
    platforms,
    earnings,
    expenses,
    goals,
    connectedAccounts,
    loading,
    errors,
    fetchUserData,
    fetchPlatforms,
    fetchEarnings,
    fetchExpenses,
    fetchGoals,
    fetchConnectedAccounts,
    clearAllData,
    getTotalEarnings,
    getTotalExpenses,
    getAvailableBalance,
    getGoalProgress,
  } = useUserStore();

  // Fetch user data when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchUserData(user.uid);
    } else {
      clearAllData();
    }
  }, [user?.uid, fetchUserData, clearAllData]);

  // Fetch platforms on mount
  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  // Fetch user-specific data when userData is available
  useEffect(() => {
    if (userData?.id) {
      fetchEarnings(userData.id);
      fetchExpenses(userData.id);
      fetchGoals(userData.id);
      fetchConnectedAccounts(userData.id);
    }
  }, [userData?.id, fetchEarnings, fetchExpenses, fetchGoals, fetchConnectedAccounts]);

  // Computed values
  const totalEarnings = getTotalEarnings();
  const totalExpenses = getTotalExpenses();
  const availableBalance = getAvailableBalance();
  const estimatedTaxes = totalEarnings * (userData?.estimated_tax_rate || 0.25);

  // Goal progress
  const dailyGoal = getGoalProgress('daily');
  const weeklyGoal = getGoalProgress('weekly');
  const monthlyGoal = getGoalProgress('monthly');

  // Get earnings by platform
  const getEarningsByPlatform = () => {
    const platformEarnings = new Map();
    
    earnings.forEach(earning => {
      const platformId = earning.platform_id;
      if (!platformEarnings.has(platformId)) {
        platformEarnings.set(platformId, {
          platformId,
          platform: platforms.find(p => p.id === platformId),
          earnings: 0,
          hours: 0,
          trips: 0,
        });
      }
      
      const data = platformEarnings.get(platformId);
      data.earnings += earning.amount;
      data.hours += earning.hours_worked || 0;
      data.trips += earning.trip_count || 0;
    });
    
    return Array.from(platformEarnings.values());
  };

  // Get expenses by category
  const getExpensesByCategory = () => {
    const categoryExpenses = new Map();
    
    expenses.forEach(expense => {
      const category = expense.category;
      if (!categoryExpenses.has(category)) {
        categoryExpenses.set(category, {
          category,
          amount: 0,
          count: 0,
        });
      }
      
      const data = categoryExpenses.get(category);
      data.amount += expense.amount;
      data.count += 1;
    });
    
    return Array.from(categoryExpenses.values());
  };

  // Get recent activity
  const getRecentActivity = (limit = 10) => {
    const activities = [
      ...earnings.map(e => ({
        id: e.id,
        type: 'earning' as const,
        amount: e.amount,
        description: e.description || `Earnings from ${platforms.find(p => p.id === e.platform_id)?.name}`,
        date: e.date,
        created_at: e.created_at,
      })),
      ...expenses.map(e => ({
        id: e.id,
        type: 'expense' as const,
        amount: -e.amount,
        description: e.description || `${e.category} expense`,
        date: e.date,
        created_at: e.created_at,
      })),
    ];
    
    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  };

  return {
    // Raw data
    userData,
    platforms,
    earnings,
    expenses,
    goals,
    connectedAccounts,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Computed values
    totalEarnings,
    totalExpenses,
    availableBalance,
    estimatedTaxes,
    
    // Goal progress
    dailyGoal,
    weeklyGoal,
    monthlyGoal,
    
    // Utility functions
    getEarningsByPlatform,
    getExpensesByCategory,
    getRecentActivity,
    
    // Refresh functions
    refreshData: () => {
      if (userData?.id) {
        fetchEarnings(userData.id);
        fetchExpenses(userData.id);
        fetchGoals(userData.id);
        fetchConnectedAccounts(userData.id);
      }
    },
    
    // Check if user has completed onboarding
    hasCompletedOnboarding: userData?.onboarding_completed || false,
  };
}