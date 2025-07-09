"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/user-store';
import { useUserData } from '@/hooks/use-user-data';
import { 
  DollarSign, 
  Car, 
  Truck, 
  Laptop, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Clock,
  MapPin,
  ArrowLeft,
  Banknote,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export function EarningsForm() {
  const router = useRouter();
  const { userData, platforms } = useUserData();
  const { addEarning } = useUserStore();
  
  const [formData, setFormData] = useState({
    platform_id: '',
    amount: '',
    gross_amount: '',
    fees: '',
    tips: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    trip_count: '',
    hours_worked: '',
    transaction_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Auto-calculate net amount when gross amount or fees change
  useEffect(() => {
    const gross = parseFloat(formData.gross_amount) || 0;
    const fees = parseFloat(formData.fees) || 0;
    const tips = parseFloat(formData.tips) || 0;
    const netAmount = gross - fees + tips;
    
    if (netAmount !== parseFloat(formData.amount)) {
      setFormData(prev => ({
        ...prev,
        amount: netAmount > 0 ? netAmount.toFixed(2) : ''
      }));
    }
  }, [formData.gross_amount, formData.fees, formData.tips]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.id) {
      setError('User not found. Please try logging in again.');
      return;
    }

    if (!formData.platform_id || !formData.amount) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addEarning({
        user_id: userData.id,
        platform_id: formData.platform_id,
        amount: parseFloat(formData.amount),
        gross_amount: parseFloat(formData.gross_amount) || parseFloat(formData.amount),
        fees: parseFloat(formData.fees) || 0,
        tips: parseFloat(formData.tips) || 0,
        date: formData.date,
        description: formData.description || null,
        trip_count: formData.trip_count ? parseInt(formData.trip_count) : 0,
        hours_worked: formData.hours_worked ? parseFloat(formData.hours_worked) : 0,
        transaction_id: formData.transaction_id || null,
      });

      setSuccess(true);
      
      // Reset form
      setFormData({
        platform_id: '',
        amount: '',
        gross_amount: '',
        fees: '',
        tips: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        trip_count: '',
        hours_worked: '',
        transaction_id: '',
      });

      // Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the earnings.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlatform = platforms.find(p => p.id === formData.platform_id);

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

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Earnings</h1>
            <p className="text-sm text-gray-600">Record your gig work earnings</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary text-primary-foreground rounded-full p-3">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">New Earnings</CardTitle>
            <CardDescription className="text-center">
              Add earnings from your gig work platforms
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Earnings added successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Selection */}
              <div className="space-y-2">
                <Label>Platform *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {platforms.map((platform) => {
                    const Icon = getPlatformIcon(platform.type);
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => handleInputChange('platform_id', platform.id)}
                        className={`p-3 text-left rounded-md border transition-colors ${
                          formData.platform_id === platform.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
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
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-gray-500" />
                  <Label className="text-base font-medium">Earnings Breakdown</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gross Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="gross_amount">Gross Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="gross_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.gross_amount}
                        onChange={(e) => handleInputChange('gross_amount', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Fees */}
                  <div className="space-y-2">
                    <Label htmlFor="fees">Platform Fees</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="fees"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.fees}
                        onChange={(e) => handleInputChange('fees', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="space-y-2">
                    <Label htmlFor="tips">Tips</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="tips"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.tips}
                        onChange={(e) => handleInputChange('tips', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Net Amount (calculated) */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Net Amount *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className="pl-10 bg-gray-50"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Auto-calculated: Gross - Fees + Tips
                    </p>
                  </div>
                </div>
              </div>

              {/* Work Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Label className="text-base font-medium">Work Details</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hours Worked */}
                  <div className="space-y-2">
                    <Label htmlFor="hours_worked">Hours Worked</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="hours_worked"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={formData.hours_worked}
                        onChange={(e) => handleInputChange('hours_worked', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Trip Count */}
                  <div className="space-y-2">
                    <Label htmlFor="trip_count">Trips/Jobs</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="trip_count"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.trip_count}
                        onChange={(e) => handleInputChange('trip_count', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Optional description (e.g., 'Evening shift', 'Weekend bonus')"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                  id="transaction_id"
                  type="text"
                  placeholder="Optional transaction/payment ID"
                  value={formData.transaction_id}
                  onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Help prevent duplicate entries
                </p>
              </div>

              {/* Summary */}
              {formData.amount && selectedPlatform && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <Badge variant="outline">{selectedPlatform.name}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Earnings:</span>
                      <span className="font-medium">${formData.amount}</span>
                    </div>
                    {formData.hours_worked && (
                      <div className="flex justify-between">
                        <span>Hourly Rate:</span>
                        <span>${(parseFloat(formData.amount) / parseFloat(formData.hours_worked)).toFixed(2)}/hr</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Link href="/dashboard" className="flex-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading || !formData.amount || !formData.platform_id}
                >
                  {loading ? 'Adding...' : 'Add Earnings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}