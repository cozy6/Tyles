"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/user-store';
import { useUserData } from '@/hooks/use-user-data';
import { ExpenseCategory } from '@/types/database';
import { 
  Receipt, 
  Car, 
  Phone, 
  Shield, 
  Coffee, 
  Package, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  Camera,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { ReceiptUpload } from '@/components/receipt/receipt-upload';

const expenseCategories = [
  { value: 'fuel' as ExpenseCategory, label: 'Fuel', icon: Car, color: '#ef4444' },
  { value: 'maintenance' as ExpenseCategory, label: 'Maintenance', icon: Car, color: '#f97316' },
  { value: 'insurance' as ExpenseCategory, label: 'Insurance', icon: Shield, color: '#3b82f6' },
  { value: 'phone' as ExpenseCategory, label: 'Phone', icon: Phone, color: '#8b5cf6' },
  { value: 'food' as ExpenseCategory, label: 'Food', icon: Coffee, color: '#10b981' },
  { value: 'supplies' as ExpenseCategory, label: 'Supplies', icon: Package, color: '#f59e0b' },
  { value: 'other' as ExpenseCategory, label: 'Other', icon: MoreHorizontal, color: '#6b7280' },
];

export function ExpenseForm() {
  const router = useRouter();
  const { userData } = useUserData();
  const { addExpense } = useUserStore();
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '' as ExpenseCategory,
    subcategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    is_business_expense: true,
    mileage: '',
    receipt_url: '',
  });
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReceiptUploaded = (receiptData: any) => {
    // Auto-fill form fields based on extracted data
    if (receiptData.extractedData) {
      const { amount, merchant, date, category } = receiptData.extractedData;
      
      if (amount && !formData.amount) {
        setFormData(prev => ({ ...prev, amount: amount.toString() }));
      }
      
      if (merchant && !formData.description) {
        setFormData(prev => ({ ...prev, description: merchant }));
      }
      
      if (date && !formData.date) {
        setFormData(prev => ({ ...prev, date }));
      }
      
      if (category && !formData.category) {
        setFormData(prev => ({ ...prev, category: category as ExpenseCategory }));
      }
      
      // Store receipt URL
      setFormData(prev => ({ ...prev, receipt_url: receiptData.url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.id) {
      setError('User not found. Please try logging in again.');
      return;
    }

    if (!formData.amount || !formData.category) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addExpense({
        user_id: userData.id,
        amount: parseFloat(formData.amount),
        category: formData.category,
        subcategory: formData.subcategory || null,
        description: formData.description || null,
        date: formData.date,
        is_business_expense: formData.is_business_expense,
        mileage: formData.mileage ? parseFloat(formData.mileage) : null,
        receipt_url: formData.receipt_url || null,
      });

      setSuccess(true);
      
      // Reset form
      setFormData({
        amount: '',
        category: '' as ExpenseCategory,
        subcategory: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        is_business_expense: true,
        mileage: '',
        receipt_url: '',
      });

      // Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the expense.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = expenseCategories.find(cat => cat.value === formData.category);

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
            <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
            <p className="text-sm text-gray-600">Track your business expenses</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary text-primary-foreground rounded-full p-3">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">New Expense</CardTitle>
            <CardDescription className="text-center">
              Add a new business expense to track your deductions
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
                  Expense added successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
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
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {expenseCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => handleInputChange('category', category.value)}
                        className={`p-3 text-left rounded-md border transition-colors ${
                          formData.category === category.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: category.color }} />
                          <span className="text-sm font-medium">{category.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategory */}
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  type="text"
                  placeholder="e.g., Regular gas, Premium, etc."
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Optional description of the expense"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
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

              {/* Mileage (for certain categories) */}
              {(formData.category === 'fuel' || formData.category === 'maintenance') && (
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (miles)</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="mileage"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange('mileage', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Track mileage for tax deduction purposes
                  </p>
                </div>
              )}

              {/* Business Expense Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="business_expense"
                  checked={formData.is_business_expense}
                  onCheckedChange={(checked) => handleInputChange('is_business_expense', checked)}
                />
                <Label htmlFor="business_expense" className="text-sm">
                  This is a business expense
                </Label>
                <Badge variant="secondary" className="ml-2">
                  Tax Deductible
                </Badge>
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Receipt (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReceiptUpload(!showReceiptUpload)}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    {showReceiptUpload ? 'Hide Upload' : 'Upload Receipt'}
                  </Button>
                </div>
                
                {showReceiptUpload && (
                  <ReceiptUpload
                    onReceiptUploaded={handleReceiptUploaded}
                    maxFiles={1}
                    className="mt-2"
                  />
                )}
                
                {!showReceiptUpload && formData.receipt_url && (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">Receipt uploaded successfully</span>
                    </div>
                  </div>
                )}
              </div>

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
                  disabled={loading || !formData.amount || !formData.category}
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}