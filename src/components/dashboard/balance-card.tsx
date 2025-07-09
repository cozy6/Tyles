"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface BalanceCardProps {
  availableBalance: number;
  totalEarnings: number;
  taxWithheld: number;
  expenses: number;
  previousBalance: number;
  className?: string;
}

export function BalanceCard({
  availableBalance,
  totalEarnings,
  taxWithheld,
  expenses,
  previousBalance,
  className,
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  
  const balanceChange = availableBalance - previousBalance;
  const balanceChangePercent = previousBalance > 0 ? (balanceChange / previousBalance) * 100 : 0;
  const isPositiveChange = balanceChange >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const taxProgress = totalEarnings > 0 ? (taxWithheld / totalEarnings) * 100 : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            Available Balance
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
            className="h-8 w-8"
          >
            {showBalance ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Balance */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {showBalance ? formatCurrency(availableBalance) : "••••"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  {isPositiveChange ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isPositiveChange ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositiveChange ? "+" : ""}
                    {formatCurrency(balanceChange)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({isPositiveChange ? "+" : ""}{balanceChangePercent.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="bg-primary/10 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Total Earnings</p>
              <p className="text-lg font-semibold text-gray-900">
                {showBalance ? formatCurrency(totalEarnings) : "••••"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Expenses</p>
              <p className="text-lg font-semibold text-gray-900">
                {showBalance ? formatCurrency(expenses) : "••••"}
              </p>
            </div>
          </div>

          {/* Tax Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Tax Withheld</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {showBalance ? formatCurrency(taxWithheld) : "••••"}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {taxProgress.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <Progress value={taxProgress} className="h-2" />
            <p className="text-xs text-gray-500">
              Recommended: 25% of earnings
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}