"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  DollarSign, 
  Car, 
  Calculator, 
  Target,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: OnboardingStep[] = [
  {
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: User,
  },
  {
    title: "Tax Information",
    description: "Set up your tax preferences",
    icon: Calculator,
  },
  {
    title: "Platforms",
    description: "Connect your gig platforms",
    icon: Car,
  },
  {
    title: "Goals",
    description: "Set your financial goals",
    icon: Target,
  },
];

const taxFilingOptions = [
  { value: 'single', label: 'Single' },
  { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
  { value: 'married_filing_separately', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
];

const platforms = [
  { id: 'uber', name: 'Uber', type: 'rideshare', color: '#000000' },
  { id: 'lyft', name: 'Lyft', type: 'rideshare', color: '#ff00bf' },
  { id: 'doordash', name: 'DoorDash', type: 'delivery', color: '#ff3008' },
  { id: 'ubereats', name: 'Uber Eats', type: 'delivery', color: '#000000' },
  { id: 'grubhub', name: 'Grubhub', type: 'delivery', color: '#f63440' },
  { id: 'instacart', name: 'Instacart', type: 'delivery', color: '#43b02a' },
  { id: 'upwork', name: 'Upwork', type: 'freelance', color: '#6fda44' },
  { id: 'fiverr', name: 'Fiverr', type: 'freelance', color: '#1dbf73' },
];

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    taxFilingStatus: 'single',
    estimatedTaxRate: '25',
    selectedPlatforms: [] as string[],
    dailyGoal: '200',
    weeklyGoal: '1000',
    monthlyGoal: '4000',
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformToggle = (platformName: string) => {
    const newPlatforms = formData.selectedPlatforms.includes(platformName)
      ? formData.selectedPlatforms.filter(name => name !== platformName)
      : [...formData.selectedPlatforms, platformName];
    
    handleInputChange('selectedPlatforms', newPlatforms);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // First, get the Supabase user record to get the correct user ID
      const { data: supabaseUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', user.uid)
        .single();

      if (fetchError || !supabaseUser) {
        throw new Error('User not found in database. Please try logging in again.');
      }

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          tax_filing_status: formData.taxFilingStatus,
          estimated_tax_rate: parseFloat(formData.estimatedTaxRate) / 100,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('firebase_uid', user.uid);

      if (userError) throw userError;

      // Create user goals
      const goals = [
        { goal_type: 'daily', target_amount: parseFloat(formData.dailyGoal) },
        { goal_type: 'weekly', target_amount: parseFloat(formData.weeklyGoal) },
        { goal_type: 'monthly', target_amount: parseFloat(formData.monthlyGoal) },
      ];

      for (const goal of goals) {
        const { error: goalError } = await supabase
          .from('user_goals')
          .insert({
            user_id: supabaseUser.id,
            ...goal,
          });

        if (goalError) throw goalError;
      }

      // Get platform IDs for selected platforms
      const { data: platformData, error: platformError } = await supabase
        .from('platforms')
        .select('id, name')
        .in('name', formData.selectedPlatforms);

      if (platformError) throw platformError;

      // Create connected accounts for selected platforms
      for (const platform of platformData) {
        const { error: accountError } = await supabase
          .from('connected_accounts')
          .insert({
            user_id: supabaseUser.id,
            platform_id: platform.id,
            account_identifier: 'manual_connection',
            connection_type: 'manual',
            is_active: true,
          });

        if (accountError && accountError.code !== '23505') { // Ignore duplicate key errors
          throw accountError;
        }
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'An error occurred while setting up your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tax Filing Status</Label>
              <div className="grid grid-cols-1 gap-2">
                {taxFilingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('taxFilingStatus', option.value)}
                    className={`p-3 text-left rounded-md border transition-colors ${
                      formData.taxFilingStatus === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Estimated Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="50"
                value={formData.estimatedTaxRate}
                onChange={(e) => handleInputChange('estimatedTaxRate', e.target.value)}
                placeholder="25"
              />
              <p className="text-sm text-gray-500">
                We recommend 25% for most gig workers
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select the platforms you work with</Label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handlePlatformToggle(platform.name)}
                    className={`p-3 text-left rounded-md border transition-colors ${
                      formData.selectedPlatforms.includes(platform.name)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">{platform.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Earnings Goal ($)</Label>
              <Input
                id="dailyGoal"
                type="number"
                min="0"
                value={formData.dailyGoal}
                onChange={(e) => handleInputChange('dailyGoal', e.target.value)}
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyGoal">Weekly Earnings Goal ($)</Label>
              <Input
                id="weeklyGoal"
                type="number"
                min="0"
                value={formData.weeklyGoal}
                onChange={(e) => handleInputChange('weeklyGoal', e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyGoal">Monthly Earnings Goal ($)</Label>
              <Input
                id="monthlyGoal"
                type="number"
                min="0"
                value={formData.monthlyGoal}
                onChange={(e) => handleInputChange('monthlyGoal', e.target.value)}
                placeholder="4000"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-gray-600">Please log in to continue</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {currentStepData.title}
          </CardTitle>
          <CardDescription className="text-center">
            {currentStepData.description}
          </CardDescription>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderStep()}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                'Setting up...'
              ) : currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}