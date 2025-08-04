import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SupportedCountry } from '@shared/schema';
import { useOnboardingState } from '@/hooks/useOnboardingState';

const formSchema = z.object({
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  followerCount: z.coerce.number().min(0, "Follower count must be 0 or greater"),
  email: z.string().email("Please enter a valid email").or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const platforms = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'other', label: 'Other' },
];

export function AmbassadorOnboarding() {
  const [, setLocation] = useLocation();
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(false);
  const { userData, isCheckingExistingAmbassador, saveOnboardingData } = useOnboardingState();

  // Fetch supported countries from API
  const { data: countries, isLoading: countriesLoading } = useQuery<SupportedCountry[]>({
    queryKey: ['/api/supported-countries'],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platforms: [],
      followerCount: 1,
      email: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('🚀 Ambassador onboarding form submitted:', {
      platforms: data.platforms,
      followerCount: data.followerCount,
      userData: userData,
      isCheckingExistingAmbassador
    });

    const minFollowerRequirement = 1; // Very low for MVP

    if (data.followerCount >= minFollowerRequirement) {
      // Store data using the onboarding state hook
      saveOnboardingData({
        platforms: data.platforms,
        followerCount: data.followerCount,
      });
      
      console.log('✅ Platform data saved, determining next step...');
      
      // Check if user data already exists (account already created)
      if (userData?.email && userData?.fullName && userData?.country) {
        console.log('📍 User data exists, skipping to list builder');
        setLocation('/onboarding/ambassador/list-builder');
      } else {
        console.log('📍 No user data, proceeding to account creation');
        setLocation('/onboarding/ambassador/account');
      }
    } else {
      console.log('❌ Follower count below threshold, showing email prompt');
      setShowEmailPrompt(true);
    }
  };

  const handleEmailSubmit = (data: FormData) => {
    if (data.email) {
      // Here you would typically save the email to a waitlist
      console.log('Email added to waitlist:', data.email);
      setSubmittedEmail(true);
    }
  };

  // Show loading while checking for existing ambassador (temporarily disabled for debugging)
  if (false && isCheckingExistingAmbassador) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Checking Your Account</h2>
            <p className="text-gray-600">Please wait while we check your onboarding status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submittedEmail) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Thank you!</h2>
              <p className="text-gray-600">
                We'll notify you when more spots become available. Keep building your audience!
              </p>
            </div>
            <Button onClick={() => setLocation('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showEmailPrompt) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-primary">Thanks for your interest!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 text-center">
              You'll be notified when we open up more spots. Leave your email to stay updated:
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 bg-[#F1762E] hover:bg-[#F1762E]/90 text-white">
                    Join Waitlist
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation('/')}
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Tell us about your audience
          </h1>
          <p className="text-gray-600">
            Help us understand your influence so we can connect you with the best opportunities.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Platform Selection */}
                <FormField
                  control={form.control}
                  name="platforms"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        What platform is your primary audience on?
                      </FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {platforms.map((platform) => (
                          <FormField
                            key={platform.id}
                            control={form.control}
                            name="platforms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(platform.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, platform.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== platform.id)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {platform.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Follower Count */}
                <FormField
                  control={form.control}
                  name="followerCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        How many followers do you have?
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter your follower count"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setLocation('/')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#F1762E] hover:bg-[#F1762E]/90 text-white">
                    Continue
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}