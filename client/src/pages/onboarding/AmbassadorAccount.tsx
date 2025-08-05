import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, User } from 'lucide-react';
import type { SupportedCountry } from '@shared/schema';
import { useOnboardingState } from '@/hooks/useOnboardingState';

// localStorage diagnostic helper
const logLocalStorageSnapshot = (step: string) => {
  console.log(`📊 LOCALSTORAGE SNAPSHOT [${step}]:`, {
    keys: Object.keys(localStorage),
    values: Object.keys(localStorage).reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {} as Record<string, string | null>)
  });
};

const formSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .refine((email) => {
      // More permissive email validation to allow .marketing and other TLDs
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }, 'Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  country: z.string().min(1, 'Please select your country'),
  profileImage: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AmbassadorAccount() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { onboardingData, saveUserData, isDataLoaded, safeNavigateToNextStep } = useOnboardingState();

  console.log('🔄 AmbassadorAccount component mounted/rendered');

  // Safety check: redirect if missing platform data after data loads
  useEffect(() => {
    if (!isDataLoaded) {
      console.log('⏳ Account page: Waiting for onboarding data to load...');
      return;
    }

    if (!onboardingData?.platforms || !onboardingData?.followerCount) {
      console.log('⚠️ Account page: Missing platform data, redirecting to platform selection');
      safeNavigateToNextStep(setLocation);
    } else {
      console.log('✅ Account page: Platform data loaded successfully:', onboardingData);
    }
  }, [isDataLoaded, onboardingData, safeNavigateToNextStep, setLocation]);

  // Fetch supported countries from API
  const { data: countries, isLoading: countriesLoading } = useQuery<SupportedCountry[]>({
    queryKey: ['/api/supported-countries'],
    queryFn: () => fetch('/api/supported-countries').then(res => res.json()),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      country: '',
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSignupError(null);

    try {
      // Create account via backend authentication endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName || '',
            }
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      console.log('Successfully created account for:', data.email);

      // Check if email confirmation is required
      if (!result.user.email_confirmed_at && result.user.confirmation_sent_at) {
        // Navigate to email confirmation page
        setLocation('/auth/email-confirmation');
        return;
      }

      if (!result.user) {
        throw new Error('Failed to create user account');
      }

      // Store complete user data for the onboarding flow
      const userData = {
        id: result.user.id,
        email: data.email,
        fullName: data.fullName,
        country: data.country,
        profileImage: imagePreview || null,
        createdAt: new Date().toISOString(),
        // Merge platform data from previous step
        ...onboardingData
      };
      
      saveUserData(userData);

      // Step 3: Log localStorage after account creation
      logLocalStorageSnapshot('After Account Creation');

      // Navigate to list builder (platform data already validated on page load)
      console.log('🔀 NAVIGATION: Account creation → List builder');
      setLocation('/onboarding/ambassador/list-builder');

    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Supabase errors
      if (error?.message?.includes('already registered') || error?.message?.includes('User already registered')) {
        setSignupError('An account with this email already exists. Please use a different email or sign in instead.');
      } else if (error?.message?.includes('Password should be at least')) {
        setSignupError('Password is too weak. Please choose a stronger password with at least 8 characters.');
      } else if (error?.message?.includes('Invalid email') || error?.message?.includes('invalid_email')) {
        setSignupError(`Email format issue: ${data.email}. Please check your email address or contact support if using a non-standard domain like .marketing`);
      } else if (error?.message?.includes('Invalid login credentials')) {
        setSignupError('Please enter a valid email address.');
      } else {
        setSignupError(error?.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setLocation('/onboarding/ambassador');
  };

  // Show loading while onboarding data loads
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#F1762E]" />
          <p className="text-gray-600">Loading account setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            Create your Comuniti account
          </h1>
          <p className="text-gray-600">
            Set up your account to manage your recommendations and earn from referrals
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {signupError && (
                  <Alert variant="destructive">
                    <AlertDescription>{signupError}</AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your@email.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Minimum 8 characters" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Name Field */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your full name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country Field */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country/Region of Expertise *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your location expertise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countriesLoading ? (
                            <SelectItem value="loading" disabled>Loading countries...</SelectItem>
                          ) : (
                            countries?.map((country: SupportedCountry) => (
                              <SelectItem key={country.id} value={country.name}>
                                {country.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Profile Image Upload */}
                <div className="space-y-2">
                  <Label>Profile Image (optional)</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="profile-image"
                      />
                      <Label 
                        htmlFor="profile-image"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        {selectedImage ? 'Change Image' : 'Upload Image'}
                      </Label>
                      {selectedImage && (
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#F1762E] hover:bg-[#F1762E]/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}