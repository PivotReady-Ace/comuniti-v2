import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';

export function EmailConfirmation() {
  const [, setLocation] = useLocation();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const { t } = useLanguage();

  // Get email from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const confirmed = urlParams.get('confirmed') === 'true';
  const error = urlParams.get('error');
  
  const storedUserData = localStorage.getItem('ambassadorUser');
  const userData = storedUserData ? JSON.parse(storedUserData) : null;
  const email = userData?.email || 'your email';

  useEffect(() => {
    if (confirmed) {
      // Email was confirmed, redirect to continue onboarding
      setTimeout(() => {
        setLocation('/onboarding/ambassador/list-builder');
      }, 3000);
    }
  }, [confirmed, setLocation]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setResendMessage('Confirmation email sent! Please check your inbox and spam folder.');
      } else {
        setResendMessage(result.error || 'Failed to resend confirmation email.');
      }
    } catch (error) {
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const goHome = () => {
    setLocation('/');
  };

  const goToSignIn = () => {
    setLocation('/auth/sign-in');
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-[#F1762E] rounded-full flex items-center justify-center">
              {confirmed ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : error ? (
                <XCircle className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-[#003366]">
              {confirmed ? 'Email Confirmed!' : error ? 'Confirmation Failed' : 'Check Your Email'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {confirmed ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Your email has been successfully confirmed. You'll be redirected to continue your ambassador onboarding in a few seconds.
                </p>
                <Button 
                  onClick={() => setLocation('/onboarding/ambassador/list-builder')}
                  className="w-full bg-[#F1762E] hover:bg-[#E06A29] text-white"
                >
                  Continue Onboarding
                </Button>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    Email confirmation failed. The link may be expired or invalid.
                  </AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full bg-[#F1762E] hover:bg-[#E06A29] text-white"
                  >
                    {isResending ? 'Sending...' : 'Resend Confirmation Email'}
                  </Button>
                  <Button 
                    onClick={goToSignIn}
                    variant="outline"
                    className="w-full"
                  >
                    Try Signing In Instead
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-center">
                  We've sent a confirmation link to <strong>{email}</strong>. 
                  Please check your email and click the link to verify your account.
                </p>
                
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-700">
                    Don't see the email? Check your spam folder or wait a few minutes for it to arrive.
                  </AlertDescription>
                </Alert>

                {resendMessage && (
                  <Alert className={resendMessage.includes('sent') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <AlertDescription className={resendMessage.includes('sent') ? 'text-green-700' : 'text-red-700'}>
                      {resendMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? 'Sending...' : 'Resend Confirmation Email'}
                  </Button>
                  
                  <Button 
                    onClick={goHome}
                    variant="ghost"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}