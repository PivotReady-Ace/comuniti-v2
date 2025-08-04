import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  followerCount: z.coerce.number().min(0, "Follower count must be 0 or greater"),
  country: z.string().min(1, "Please select your country"),
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

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
  { value: 'ar', label: 'Argentina' },
  { value: 'pa', label: 'Panama' },
  { value: 'co', label: 'Colombia' },
  { value: 'pt', label: 'Portugal' },
  { value: 'cr', label: 'Costa Rica' },
];

export function AmbassadorOnboarding() {
  const [, setLocation] = useLocation();
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platforms: [],
      followerCount: 1,
      country: '',
      email: '',
    },
  });

  const onSubmit = (data: FormData) => {
    const minFollowerRequirement = 1; // Very low for MVP

    if (data.followerCount >= minFollowerRequirement) {
      // Store data in localStorage for next step
      localStorage.setItem('ambassadorOnboarding', JSON.stringify({
        platforms: data.platforms,
        followerCount: data.followerCount,
        country: data.country,
      }));
      
      setLocation('/onboarding/ambassador/account');
    } else {
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

                {/* Country Selection */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        What country do you currently live in?
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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