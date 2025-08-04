import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Home } from "@/pages/Home";
import { AmbassadorOnboarding } from "@/pages/onboarding/AmbassadorOnboarding";
import { AmbassadorAccount } from "@/pages/onboarding/AmbassadorAccount";
import { AmbassadorListBuilder } from "@/pages/onboarding/AmbassadorListBuilder";
import { AmbassadorBranding } from "@/pages/onboarding/AmbassadorBranding";
import { SignIn } from "@/pages/auth/SignIn";
import { EmailConfirmation } from "@/pages/auth/EmailConfirmation";
import Dashboard from "@/pages/dashboard/index";
import AmbassadorDirectorySimple from "@/pages/AmbassadorDirectorySimple";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, loading } = useAuth();
  const [location, setLocation] = useLocation();

  // CRITICAL FIX 2: Auto-redirect logic for authenticated users
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Check if user has existing ambassador profile to determine redirect
      const checkAmbassadorProfile = async () => {
        try {
          const response = await fetch('/api/ambassadors');
          if (response.ok) {
            const ambassadors = await response.json();
            const userEmail = user.email;
            const existingAmbassador = ambassadors.find((amb: any) => 
              amb.name.toLowerCase().includes(userEmail?.split('@')[0]?.toLowerCase() || '') ||
              amb.pageUrl.includes(userEmail?.split('@')[0]?.toLowerCase() || '')
            );
            
            if (existingAmbassador) {
              // User has ambassador profile - redirect to directory unless already there
              if (location === '/' || location === '/dashboard') {
                setLocation(`/directory/${existingAmbassador.pageUrl}`);
              }
            } else {
              // User is authenticated but no ambassador profile - redirect to onboarding
              if (location === '/' || location === '/dashboard') {
                setLocation('/onboarding/ambassador');
              }
            }
          }
        } catch (error) {
          console.error('Error checking ambassador profile:', error);
        }
      };

      checkAmbassadorProfile();
    }
  }, [user, isAuthenticated, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 rounded-full border-2 border-[#F1762E] border-t-transparent" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding/ambassador" component={AmbassadorOnboarding} />
      <Route path="/onboarding/business" component={AmbassadorOnboarding} />
      <Route path="/onboarding/ambassador/account" component={AmbassadorAccount} />
      <Route path="/onboarding/ambassador/list-builder" component={AmbassadorListBuilder} />
      <Route path="/onboarding/ambassador/branding" component={AmbassadorBranding} />
      <Route path="/auth/sign-in" component={SignIn} />
      <Route path="/auth/email-confirmation" component={EmailConfirmation} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/directory/:pageUrl" component={AmbassadorDirectorySimple} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
