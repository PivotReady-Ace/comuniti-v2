import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Globe, MessageCircle, User, MapPin, Phone, Star, Users, Filter, X } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { AuthButton } from '@/components/AuthButton';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();

  // Use React Query to prevent infinite loops
  const { data: ambassador, isLoading: ambassadorLoading, error: ambassadorError } = useQuery({
    queryKey: ['ambassador', params?.pageUrl],
    queryFn: async () => {
      if (!params?.pageUrl) throw new Error('No page URL');
      const response = await fetch(`/api/ambassadors/${params.pageUrl}`);
      if (!response.ok) throw new Error('Ambassador not found');
      return response.json();
    },
    enabled: !!match && !!params?.pageUrl,
  });

  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['businesses', params?.pageUrl],
    queryFn: async () => {
      if (!params?.pageUrl) return [];
      const response = await fetch(`/api/ambassadors/${params.pageUrl}/businesses`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!match && !!params?.pageUrl,
  });

  const loading = ambassadorLoading || businessesLoading;
  const error = ambassadorError?.message;

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
              <AuthButton />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Ambassador Profile Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#003366] to-[#F1762E] flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {ambassador.logo_url && ambassador.logo_url !== 'https://example.com/aaron-avatar.jpg' ? (
                  <img 
                    src={ambassador.logo_url} 
                    alt={ambassador.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span className="text-white text-4xl font-bold flex items-center justify-center w-full h-full" style={{display: (ambassador.logo_url && ambassador.logo_url !== 'https://example.com/aaron-avatar.jpg') ? 'none' : 'flex'}}>
                  {ambassador.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-[#003366] mb-2">
                    {ambassador.pageName}
                  </h1>
                  <p className="text-xl text-gray-600 mb-1">
                    by {ambassador.name}
                  </p>
                  {ambassador.bio && (
                    <p className="text-lg text-gray-600 mb-4 max-w-2xl">
                      {ambassador.bio}
                    </p>
                  )}
                </div>
                
                {/* Rating Card */}
                <div className="flex items-center gap-2 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                  <Star className="w-5 h-5 fill-green-500 text-green-500" />
                  <span className="font-semibold text-green-700">4.9</span>
                  <span className="text-gray-600">(247 reviews)</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {ambassador.verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {t('ambassador.verified-ambassador')}
                  </Badge>
                )}
                <Badge variant="secondary">{t('ambassador.community-favorite')}</Badge>
                {ambassador.country && (
                  <Badge variant="secondary">
                    {ambassador.country} {t('ambassador.expert')}
                  </Badge>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-[#003366]" />
                    <span className="font-semibold text-lg">{businesses.length} {t('ambassador.businesses-stat')}</span>
                  </div>
                  <p className="text-gray-600">{t('ambassador.trusted-providers')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-[#003366]" />
                    <span className="font-semibold text-lg">1,200+</span>
                  </div>
                  <p className="text-gray-600">{t('ambassador.referrals')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-[#003366]" />
                    <span className="font-semibold text-lg">{ambassador.platform}</span>
                  </div>
                  <p className="text-gray-600">({ambassador.followerCount.toLocaleString()} {t('ambassador.followers')})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">

        {/* Business Directory */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#003366]">
              {t('ambassador.businesses')}
            </h2>
            <div className="text-gray-600">
              {businesses.length} {t('ambassador.businesses-found')}
            </div>
          </div>

          {businesses.length === 0 ? (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('ambassador.no-businesses')}</h3>
                  <p className="text-gray-600">{t('ambassador.no-businesses-desc')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {businesses.map((business: Business) => (
                <Card key={business.id} className="bg-white hover:shadow-lg transition-shadow border border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#003366] mb-1">{business.name}</CardTitle>
                        <p className="text-[#F1762E] font-medium">{business.category}</p>
                      </div>
                      {/* MVP: Only show verified badge for businesses that actually sign up and pay */}
                      {false && business.verified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 ml-2">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('ambassador.verified-business')}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= 4.5
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">4.5</span>
                      <span className="text-gray-500">(12 {t('ambassador.reviews')})</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{business.location}</span>
                      </div>
                      
                      {business.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">{business.description}</p>
                      )}
                      
                      {/* Referrer Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-[#003366]" />
                        <span className="text-gray-600">
                          {t('ambassador.referred-by')} <span className="font-semibold text-[#003366]">{ambassador.name}</span>
                        </span>
                      </div>
                      
                      <div className="flex gap-3 mt-4">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-[#F1762E] hover:bg-[#F1762E]/90 text-white"
                          onClick={() => window.open(formatWhatsApp(business.whatsapp), '_blank')}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {t('ambassador.whatsapp')}
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-[#008080] hover:bg-[#008080]/90 text-white"
                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(business.location)}`, '_blank')}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          {t('ambassador.view-map')}
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
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gray-500 text-sm">{t('footer.powered-by')}</span>
              <img 
                src="/attached_assets/Comuniti_Transparent Logo_1754244988005.png"
                alt="Comuniti"
                className="h-6 opacity-50 grayscale hover:opacity-70 transition-opacity"
              />
            </div>
            <p className="text-xs text-gray-400">
              {t('footer.tagline')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}