import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProgressBar } from '@/components/ProgressBar';
import { BusinessCard } from '@/components/BusinessCard';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { SOCIAL_PLATFORMS, BUSINESS_CATEGORIES, COUNTRIES, MIN_FOLLOWER_COUNT } from '@/utils/constants';
import type { InsertAmbassador, InsertBusiness, Business } from '@shared/schema';

const step1Schema = z.object({
  platform: z.string().min(1, 'Please select a platform'),
  followerCount: z.number().min(1, 'Please enter your follower count'),
});

const step2Schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
  whatsapp: z.string().min(1, 'WhatsApp number is required'),
  location: z.string().optional(),
  description: z.string().optional(),
});

const step3Schema = z.object({
  pageName: z.string().min(1, 'Page name is required'),
  pageUrl: z.string().min(1, 'Page URL is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  bio: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export default function AmbassadorOnboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const { toast } = useToast();

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      platform: '',
      followerCount: 0,
    },
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      businessName: '',
      category: '',
      whatsapp: '',
      location: '',
      description: '',
    },
  });

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      pageName: '',
      pageUrl: '',
      bio: '',
    },
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: InsertBusiness) => {
      const response = await apiRequest('POST', '/api/businesses', data);
      return response.json();
    },
    onSuccess: (newBusiness) => {
      setBusinesses(prev => [...prev, newBusiness]);
      form2.reset();
      toast({
        title: 'Business added',
        description: 'Business has been added to your recommendation list.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add business. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const createAmbassadorMutation = useMutation({
    mutationFn: async (data: { ambassador: InsertAmbassador; businessIds: string[] }) => {
      const response = await apiRequest('POST', '/api/ambassadors', data);
      return response.json();
    },
    onSuccess: (ambassador) => {
      toast({
        title: 'Success!',
        description: 'Your ambassador page has been created successfully.',
      });
      setLocation(`/directory/${ambassador.pageUrl}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create ambassador page. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onStep1Submit = (data: Step1Data) => {
    // Check follower threshold before proceeding
    if (data.followerCount < MIN_FOLLOWER_COUNT) {
      toast({
        title: 'Thanks for your interest!',
        description: `Comuniti is currently available to creators with at least ${MIN_FOLLOWER_COUNT.toLocaleString()} followers. You've been added to our waitlist.`,
        variant: 'destructive',
      });
      // Could redirect to waitlist page here
      setLocation('/');
      return;
    }
    
    setStep1Data(data);
    setCurrentStep(2);
  };

  const onStep2Submit = (data: Step2Data) => {
    const businessData: InsertBusiness = {
      name: data.businessName,
      category: data.category,
      whatsapp: data.whatsapp,
      location: data.location || '',
      description: data.description || '',
    };
    createBusinessMutation.mutate(businessData);
  };

  const onStep3Submit = (data: Step3Data) => {
    if (!step1Data) return;

    // Get user data from localStorage (includes country)
    const userData = JSON.parse(localStorage.getItem('ambassadorUser') || '{}');

    const ambassadorData: InsertAmbassador = {
      name: data.pageName,
      platform: step1Data.platform,
      followerCount: step1Data.followerCount,
      country: userData.country || '',
      pageName: data.pageName,
      pageUrl: data.pageUrl,
      bio: data.bio || '',
    };

    createAmbassadorMutation.mutate({
      ambassador: ambassadorData,
      businessIds: businesses.map(b => b.id),
    });
  };

  const handleRemoveBusiness = (businessId: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== businessId));
  };

  const handleContactBusiness = (business: Business) => {
    const whatsappUrl = `https://wa.me/${business.whatsapp.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  const renderStep1 = () => (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-comuniti-blue mb-2">Let's get to know you!</h2>
        <p className="text-gray-600 mb-8">Tell us about your social media presence so we can verify your influence.</p>

        <Form {...form1}>
          <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
            <FormField
              control={form1.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Media Platform *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <Button
                          key={platform.id}
                          type="button"
                          variant={field.value === platform.id ? "default" : "outline"}
                          className={`flex items-center justify-center p-4 h-auto ${
                            field.value === platform.id
                              ? `bg-${platform.color} border-${platform.color}`
                              : `hover:border-${platform.color} hover:bg-gray-50`
                          }`}
                          onClick={() => field.onChange(platform.id)}
                        >
                          <i className={`${platform.icon} text-2xl mr-2`}></i>
                          <span className="font-medium">{platform.name}</span>
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form1.control}
              name="followerCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follower Count *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 5000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-6">
              <Button type="button" variant="ghost" onClick={() => setLocation('/')}>
                Back
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-comuniti-orange to-comuniti-yellow">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-comuniti-blue mb-2">Build Your Recommendation List</h2>
          <p className="text-gray-600 mb-6">Add businesses you love and recommend to your community.</p>

          <Form {...form2}>
            <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
              <FormField
                control={form2.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Maria's Authentic Tacos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form2.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BUSINESS_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form2.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form2.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Madrid, Spain" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form2.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the business..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={createBusinessMutation.isPending}
                className="w-full bg-gradient-to-r from-comuniti-teal to-comuniti-cyan"
              >
                <i className="fas fa-plus mr-2"></i>
                {createBusinessMutation.isPending ? 'Adding...' : 'Add Business'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-comuniti-blue mb-4">Your Recommendations</h3>
        <p className="text-gray-600 mb-6">Preview how your list will look to your audience.</p>

        <div className="space-y-4">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={{
                ...business,
                description: business.description || '',
              }}
              mode="preview"
              onContact={handleContactBusiness}
              onRemove={handleRemoveBusiness}
            />
          ))}
          {businesses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-store text-4xl mb-4"></i>
              <p>No businesses added yet. Start by adding your first recommendation!</p>
            </div>
          )}
        </div>

        {businesses.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{businesses.length} businesses added</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBusinesses([])}
                className="text-comuniti-orange hover:text-comuniti-yellow"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-comuniti-blue mb-2">Almost there!</h2>
        <p className="text-gray-600 mb-8">Customize your public page and finalize your ambassador profile.</p>

        <Form {...form3}>
          <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form3.control}
                name="pageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public Page Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sarah's Madrid Recommendations" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form3.control}
                name="pageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your URL</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-600 px-4 py-3 rounded-l-xl border border-r-0 border-gray-300 text-sm">
                          comuniti.com/
                        </span>
                        <Input
                          placeholder="sarah-madrid"
                          className="rounded-l-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-2">Only letters, numbers, and hyphens allowed</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form3.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell your community about yourself and why they should trust your recommendations..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Preview</h3>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-comuniti-orange to-comuniti-yellow rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {form3.watch('pageName')?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {form3.watch('pageName') || 'Your Page Name'}
                    </h4>
                    <p className="text-sm text-gray-600">Trusted recommendations from your community</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-link mr-1"></i>
                  <span>comuniti.com/{form3.watch('pageUrl') || 'your-url'}</span>
                </div>
                {form3.watch('bio') && (
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">{form3.watch('bio')}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={createAmbassadorMutation.isPending || businesses.length === 0}
                className="bg-gradient-to-r from-comuniti-orange to-comuniti-yellow"
              >
                {createAmbassadorMutation.isPending ? 'Creating...' : 'Create My Page'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <ProgressBar currentStep={currentStep} totalSteps={3} />

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {currentStep === 2 && (
          <div className="flex justify-between pt-8">
            <Button variant="ghost" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)}
              disabled={businesses.length === 0}
              className="bg-gradient-to-r from-comuniti-orange to-comuniti-yellow"
            >
              Continue to Finalization
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
