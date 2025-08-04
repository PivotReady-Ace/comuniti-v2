import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { Loader2, User, Edit, ExternalLink, MapPin, Phone, Building } from 'lucide-react';

interface Ambassador {
  id: string;
  name: string;
  platform: string;
  followerCount: number;
  country: string;
  logoUrl: string | null;
  pageName: string;
  pageUrl: string;
  bio: string | null;
  verified: boolean;
  createdAt: string;
}

interface Business {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  location: string;
  description: string | null;
  verified: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setLocation('/auth/sign-in');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setLocation('/auth/sign-in');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  // Fetch ambassador data
  const { data: ambassador, isLoading: ambassadorLoading, error: ambassadorError } = useQuery({
    queryKey: ['dashboard-ambassador', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/ambassadors');
      if (!response.ok) throw new Error('Failed to fetch ambassadors');
      const ambassadors = await response.json();
      
      // Find ambassador by user email (for now, until we have better user linking)
      const userEmail = user?.email;
      const foundAmbassador = ambassadors.find((amb: any) => 
        amb.name.toLowerCase().includes(userEmail?.split('@')[0]?.toLowerCase() || '') ||
        amb.pageUrl.includes(userEmail?.split('@')[0]?.toLowerCase() || '')
      );
      
      if (!foundAmbassador) {
        throw new Error('Ambassador profile not found. Please complete onboarding first.');
      }
      
      return foundAmbassador;
    },
    enabled: !!user?.id,
  });

  // Fetch businesses for this ambassador
  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['dashboard-businesses', ambassador?.pageUrl],
    queryFn: async () => {
      if (!ambassador?.pageUrl) return [];
      const response = await fetch(`/api/ambassadors/${ambassador.pageUrl}/businesses`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!ambassador?.pageUrl,
  });

  const formatWhatsApp = (whatsapp: string) => {
    return `https://wa.me/${whatsapp}`;
  };

  const viewPublicPage = () => {
    if (ambassador?.pageUrl) {
      setLocation(`/directory/${ambassador.pageUrl}`);
    }
  };

  if (loading || ambassadorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#F1762E] mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (ambassadorError) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-[#003366] shadow-xl">
          <div className="container mx-auto px-6 py-4 max-w-7xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img 
                  src="/assets/Original-Logo.svg" 
                  alt="Comuniti" 
                  className="h-16 w-auto"
                />
              </div>
              <div className="flex items-center gap-4">
                <SignOutButton className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white" />
                <LanguageSelector />
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center px-6 py-16">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <Alert variant="destructive">
                <AlertDescription>
                  {ambassadorError.message}
                </AlertDescription>
              </Alert>
              <div className="mt-4 space-y-3">
                <Button 
                  onClick={() => setLocation('/onboarding/ambassador')}
                  className="w-full bg-[#F1762E] hover:bg-[#F1762E]/90"
                >
                  Complete Onboarding
                </Button>
                <Button 
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="w-full"
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] shadow-xl">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/assets/Original-Logo.svg" 
                alt="Comuniti" 
                className="h-16 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <SignOutButton className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white" />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            Ambassador Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your profile and business recommendations
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#003366]">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#003366] to-[#F1762E] flex items-center justify-center overflow-hidden">
                    {ambassador?.logoUrl ? (
                      <img 
                        src={ambassador.logoUrl} 
                        alt={ambassador.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#003366]">{ambassador?.name}</h3>
                    <p className="text-sm text-gray-600">{ambassador?.platform}</p>
                    <Badge variant="secondary" className="text-xs">
                      {ambassador?.followerCount?.toLocaleString()} followers
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">List Name</h4>
                    <p className="text-sm">{ambassador?.pageName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700">Public URL</h4>
                    <p className="text-sm text-[#F1762E] break-all">
                      comuniti.co/directory/{ambassador?.pageUrl}
                    </p>
                  </div>
                  {ambassador?.bio && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Bio</h4>
                      <p className="text-sm text-gray-600">{ambassador.bio}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-4">
                  <Button 
                    onClick={viewPublicPage}
                    className="w-full bg-[#F1762E] hover:bg-[#F1762E]/90"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Page
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Recommendations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg text-[#003366]">
                    Your Business Recommendations ({businesses.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" disabled>
                    <Building className="w-4 h-4 mr-2" />
                    Add Business (Coming Soon)
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {businessesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F1762E] mx-auto mb-4" />
                    <p className="text-gray-600">Loading your businesses...</p>
                  </div>
                ) : businesses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No businesses added yet</p>
                    <Button 
                      onClick={() => setLocation('/onboarding/ambassador/list-builder')}
                      variant="outline"
                    >
                      Add Your First Business
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {businesses.map((business: Business) => (
                      <div key={business.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#003366] mb-1">
                              {business.name}
                            </h4>
                            <Badge variant="outline" className="text-xs mb-2">
                              {business.category}
                            </Badge>
                            {business.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {business.description}
                              </p>
                            )}
                          </div>
                          {business.verified && (
                            <Badge className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{business.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <a 
                              href={formatWhatsApp(business.whatsapp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#F1762E] hover:underline"
                            >
                              {business.whatsapp}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}