"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Clock, Award } from "lucide-react";
import { useState } from "react";

interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface DailyProgressProps {
  goals: Goal[];
  className?: string;
}

const goalIcons = {
  earnings: Target,
  hours: Clock,
  trips: Award,
};

export function DailyProgress({ goals, className }: DailyProgressProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'earnings') {
      return formatCurrency(value);
    }
    if (type === 'hours') {
      return `${value.toFixed(1)}h`;
    }
    return value.toString();
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressVariant = (progress: number) => {
    if (progress >= 100) return 'default';
    if (progress >= 75) return 'secondary';
    return 'outline';
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progress = calculateProgress(goal.current, goal.target);
    const Icon = goal.icon;
    const isCompleted = progress >= 100;
    const remaining = Math.max(goal.target - goal.current, 0);

    return (
      <Card 
        className={`cursor-pointer transition-all ${
          selectedGoal === goal.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
        }`}
        onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: `${goal.color}20` }}
              >
                <div style={{ color: goal.color }}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">{goal.label}</p>
                <p className="text-xs text-gray-500 capitalize">{goal.type} goal</p>
              </div>
            </div>
            <Badge variant={getProgressVariant(progress)} className="text-xs">
              {progress.toFixed(0)}%
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {formatValue(goal.current, goal.type)}
              </span>
              <span className="text-sm text-gray-500">
                / {formatValue(goal.target, goal.type)}
              </span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex items-center justify-between text-xs">
              <span className={getProgressColor(progress)}>
                {isCompleted ? 'Goal achieved!' : `${formatValue(remaining, goal.type)} remaining`}
              </span>
              <span className="text-gray-500">
                {isCompleted ? '🎉' : `${(100 - progress).toFixed(0)}% to go`}
              </span>
            </div>

            {selectedGoal === goal.id && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress rate</span>
                  <span className="font-medium">{(progress / 100).toFixed(2)}x</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Time period</span>
                  <span className="font-medium capitalize">{goal.type}</span>
                </div>
                {!isCompleted && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Adjust Goal
                    </Button>
                    <Button size="sm" className="flex-1">
                      Quick Add
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const completedGoals = goals.filter(goal => calculateProgress(goal.current, goal.target) >= 100);
  const activeGoals = goals.filter(goal => calculateProgress(goal.current, goal.target) < 100);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Daily Progress</CardTitle>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {completedGoals.length}/{goals.length} completed
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
          
          {completedGoals.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-6 mb-3">
                <Award className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Completed Goals</span>
              </div>
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </>
          )}
        </div>
        
        {goals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No goals set yet</p>
            <Button size="sm" className="mt-2">
              Set Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}