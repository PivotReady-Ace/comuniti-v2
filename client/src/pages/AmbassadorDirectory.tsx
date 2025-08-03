import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BusinessCard } from '@/components/BusinessCard';
import { BUSINESS_CATEGORIES } from '@/utils/constants';
import type { Ambassador, Business } from '@shared/schema';

export default function AmbassadorDirectory() {
  const { pageUrl } = useParams<{ pageUrl: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { data: ambassador, isLoading: isLoadingAmbassador } = useQuery<Ambassador>({
    queryKey: ['/api/ambassadors', pageUrl],
    enabled: !!pageUrl,
  });

  const { data: businesses = [], isLoading: isLoadingBusinesses } = useQuery<Business[]>({
    queryKey: ['/api/ambassadors', pageUrl, 'businesses'],
    enabled: !!pageUrl,
  });

  if (isLoadingAmbassador || isLoadingBusinesses) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-comuniti-blue rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold">C</span>
          </div>
          <p className="text-gray-600">Loading ambassador directory...</p>
        </div>
      </div>
    );
  }

  if (!ambassador) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ambassador Not Found</h2>
            <p className="text-gray-600">The ambassador page you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredBusinesses = selectedCategory === 'All' 
    ? businesses 
    : businesses.filter((business: Business) => business.category === selectedCategory);

  const handleContactBusiness = (business: Business) => {
    const whatsappUrl = `https://wa.me/${business.whatsapp.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareDirectory = () => {
    if (navigator.share) {
      navigator.share({
        title: `${ambassador.pageName} - Comuniti`,
        text: `Check out ${ambassador.pageName}'s trusted business recommendations`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast here
    }
  };

  const categories = ['All', ...Array.from(new Set(businesses.map((b: Business) => b.category)))];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Ambassador Header */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-comuniti-orange to-comuniti-yellow rounded-full flex items-center justify-center mr-6">
                <span className="text-white font-bold text-2xl">
                  {ambassador.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-comuniti-blue">{ambassador.pageName}</h1>
                <p className="text-gray-600 mt-1">
                  Curated by {ambassador.name} • {ambassador.platform}: {ambassador.followerCount.toLocaleString()} followers
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  <span>{ambassador.country}</span>
                </div>
              </div>
              <Button
                onClick={handleShareDirectory}
                className="bg-gradient-to-r from-comuniti-teal to-comuniti-cyan text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <i className="fas fa-share-alt mr-2"></i>Share
              </Button>
            </div>
            
            {ambassador.bio && (
              <p className="text-gray-700 leading-relaxed">{ambassador.bio}</p>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter by category:</span>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedCategory === category
                      ? 'bg-comuniti-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Cards Grid */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredBusinesses.map((business: Business) => (
              <BusinessCard
                key={business.id}
                business={{
                  ...business,
                  description: business.description ?? undefined,
                  rating: 4.5 + Math.random() * 0.5, // Mock rating for display
                  recommendations: Math.floor(Math.random() * 20) + 5, // Mock recommendations
                }}
                onContact={handleContactBusiness}
                onReview={() => {}} // TODO: Implement review functionality
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <i className="fas fa-store text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'All' 
                  ? 'This ambassador hasn\'t added any businesses yet.'
                  : `No businesses found in the ${selectedCategory} category.`
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Trust Badge */}
        <div className="bg-gradient-to-r from-comuniti-blue to-comuniti-teal rounded-xl p-6 mt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-shield-alt text-white text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white">Verified by Comuniti</h3>
          </div>
          <p className="text-white/90 mb-4">
            All recommendations are verified by our community of trusted influencers.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-comuniti-blue px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Learn More About Our Trust System
          </Button>
        </div>
      </div>
    </div>
  );
}
