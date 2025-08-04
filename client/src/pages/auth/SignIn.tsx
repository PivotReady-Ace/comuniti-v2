import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';

const signInSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .refine((email) => {
      // More permissive email validation to allow .marketing and other TLDs
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }, 'Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInData = z.infer<typeof signInSchema>;

export function SignIn() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const form = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInData) => {
    setIsSubmitting(true);
    setSignInError(null);

    try {
      // Sign in via backend authentication endpoint
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sign in failed');
      }

      if (!result.user) {
        throw new Error('Sign in failed - no user data received');
      }

      console.log('Successfully signed in:', data.email);
      
      // Redirect to dashboard
      setLocation('/dashboard');

    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific authentication errors
      if (error?.message?.includes('Invalid login credentials')) {
        setSignInError('Invalid email or password. Please check your credentials and try again.');
      } else if (error?.message?.includes('Email not confirmed')) {
        setSignInError('Please check your email and click the confirmation link before signing in.');
      } else if (error?.message?.includes('Too many requests')) {
        setSignInError('Too many sign-in attempts. Please wait a few minutes and try again.');
      } else if (error?.message?.includes('Invalid email') || error?.message?.includes('invalid_email')) {
        setSignInError(`Email format issue with ${data.email}. Please contact support if using a non-standard domain like .marketing`);
      } else {
        setSignInError(error?.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToSignUp = () => {
    setLocation('/onboarding/ambassador');
  };

  const goHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#003366] shadow-xl">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center cursor-pointer" onClick={goHome}>
              <img 
                src="/assets/Original-Logo.svg" 
                alt="Comuniti" 
                className="h-16 w-auto"
              />
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Sign In Form */}
      <div className="flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#003366]">
              Ambassador Sign In
            </CardTitle>
            <p className="text-gray-600">
              Access your ambassador dashboard
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {signInError && (
                  <Alert variant="destructive">
                    <AlertDescription>{signInError}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            type="email"
                            placeholder="your.email@example.com"
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3 pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-[#F1762E] hover:bg-[#F1762E]/90 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={goToSignUp}
                        className="text-[#F1762E] hover:text-[#F1762E]/80 font-medium underline"
                      >
                        Create Ambassador Profile
                      </button>
                    </p>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}