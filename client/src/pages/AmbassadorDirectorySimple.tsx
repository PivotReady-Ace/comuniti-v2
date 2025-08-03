import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Globe, MessageCircle, User, MapPin, Phone } from 'lucide-react';

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

export default function AmbassadorDirectorySimple() {
  const [match, params] = useRoute('/directory/:pageUrl');
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (match && params?.pageUrl) {
      fetchData(params.pageUrl);
    }
  }, [match, params]);

  const fetchData = async (pageUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ambassador
      const ambassadorResponse = await fetch(`/api/ambassadors/${pageUrl}`);
      if (!ambassadorResponse.ok) {
        setError('Ambassador not found');
        return;
      }
      
      const ambassadorData = await ambassadorResponse.json();
      setAmbassador(ambassadorData);
      
      // Fetch businesses
      const businessResponse = await fetch(`/api/ambassadors/${pageUrl}/businesses`);
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        setBusinesses(businessData);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load ambassador page');
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsApp = (whatsapp: string) => {
    return `https://wa.me/${whatsapp}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ambassador directory...</p>
        </div>
      </div>
    );
  }

  if (error || !ambassador) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Ambassador Not Found</h1>
          <p className="text-muted-foreground">{error || 'The ambassador page you\'re looking for doesn\'t exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Ambassador Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#003366] to-[#F1762E] flex items-center justify-center overflow-hidden">
                  {ambassador.logoUrl ? (
                    <img 
                      src={ambassador.logoUrl} 
                      alt={ambassador.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {ambassador.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-[#003366] mb-1">
                      {ambassador.pageName}
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                      by {ambassador.name}
                    </p>
                    {ambassador.bio && (
                      <p className="text-lg text-gray-600 mb-4">
                        {ambassador.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Platform Info */}
                  <div className="flex items-center gap-2 bg-[#F1762E]/10 px-4 py-2 rounded-lg">
                    <Globe className="w-5 h-5 text-[#F1762E]" />
                    <span className="font-semibold text-[#F1762E]">{ambassador.platform}</span>
                    <span className="text-gray-600">({ambassador.followerCount.toLocaleString()} followers)</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {ambassador.verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified Ambassador
                    </Badge>
                  )}
                  {ambassador.country && (
                    <Badge variant="secondary">
                      {ambassador.country} Expert
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[#003366]" />
                      <span className="font-semibold text-lg">{businesses.length} Businesses</span>
                    </div>
                    <p className="text-gray-600">Trusted local providers</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-[#003366]" />
                      <span className="font-semibold text-lg">{ambassador.platform}</span>
                    </div>
                    <p className="text-gray-600">Social media platform</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Directory */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#003366]">
              Trusted Service Providers
            </h2>
            <div className="text-gray-600">
              {businesses.length} businesses found
            </div>
          </div>

          {businesses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No businesses have been added to this list yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-[#003366]">{business.name}</CardTitle>
                        <p className="text-[#F1762E] font-medium">{business.category}</p>
                      </div>
                      {business.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{business.location}</span>
                      </div>
                      
                      {business.description && (
                        <p className="text-gray-600">{business.description}</p>
                      )}
                      
                      <div className="flex gap-3 pt-4">
                        <Button 
                          size="sm" 
                          className="bg-[#F1762E] hover:bg-[#F1762E]/90 text-white flex-1"
                          onClick={() => window.open(formatWhatsApp(business.whatsapp), '_blank')}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact via WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 mt-16 border-t border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>Powered by Comuniti - Connecting expats with trusted local services</p>
          </div>
        </div>
      </footer>
    </div>
  );
}