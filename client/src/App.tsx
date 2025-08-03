import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { Home } from "@/pages/Home";
import { AmbassadorOnboarding } from "@/pages/onboarding/AmbassadorOnboarding";
import { AmbassadorAccount } from "@/pages/onboarding/AmbassadorAccount";
import { AmbassadorListBuilder } from "@/pages/onboarding/AmbassadorListBuilder";
import { AmbassadorBranding } from "@/pages/onboarding/AmbassadorBranding";
import AmbassadorDirectorySimple from "@/pages/AmbassadorDirectorySimple";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding/ambassador" component={AmbassadorOnboarding} />
      <Route path="/onboarding/business" component={AmbassadorOnboarding} />
      <Route path="/onboarding/ambassador/account" component={AmbassadorAccount} />
      <Route path="/onboarding/ambassador/list-builder" component={AmbassadorListBuilder} />
      <Route path="/onboarding/ambassador/branding" component={AmbassadorBranding} />
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
