import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, MessageCircle, CheckCircle, Users, Eye, Globe, Heart, Shield, Baby, Car, CreditCard, Filter, X, Clock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface ServiceTag {
  type: 'language' | 'identity' | 'service' | 'payment';
  label: string;
  icon: React.ReactNode;
  color: 'success' | 'primary' | 'accent' | 'secondary';
}

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  city: string;
  whatsapp: string;
  verified: boolean;
  referrers: string[];
  serviceTags?: ServiceTag[];
  identityReviews?: {
    count: number;
    identity: string;
  };
  recentlyAdded?: boolean;
}

interface AmbassadorProfile {
  id: string;
  listName: string;
  slug: string;
  fullName: string;
  profileImageUrl?: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  cities: string[];
  businessCount: number;
  referralCount: number;
  verified: boolean;
}

// Mock data based on your example
const mockProfile: AmbassadorProfile = {
  id: '1',
  listName: "Mike's Panama Network",
  slug: 'mikes-panama-network',
  fullName: 'Mike Johnson',
  tagline: 'Helping Black families relocate to Panama since 2021',
  rating: 4.9,
  reviewCount: 247,
  cities: ['Panama City', 'David', 'Boquete'],
  businessCount: 127,
  referralCount: 1200,
  verified: true,
};

const mockBusinesses: Business[] = [
  {
    id: "1",
    name: "Rodriguez Immigration Law",
    category: "Immigration Lawyer",
    rating: 4.9,
    reviewCount: 45,
    city: "Panama City",
    whatsapp: "50765551234",
    verified: true,
    referrers: ["Mike", "Sarah", "John"],
    serviceTags: [
      { type: 'language', label: 'English-speaking', icon: <Globe className="w-3 h-3" />, color: 'success' },
      { type: 'identity', label: 'LGBTQI+ friendly', icon: <Heart className="w-3 h-3" />, color: 'accent' },
      { type: 'service', label: 'Evening hours', icon: <Shield className="w-3 h-3" />, color: 'primary' }
    ],
    identityReviews: {
      count: 23,
      identity: "LGBTQI+ expats"
    },
    recentlyAdded: false
  },
  {
    id: "2",
    name: "Dr. Maria Santos",
    category: "Family Doctor",
    rating: 4.8,
    reviewCount: 67,
    city: "Panama City",
    whatsapp: "50765551235",
    verified: true,
    referrers: ["Mike"],
    serviceTags: [
      { type: 'language', label: 'English-speaking', icon: <Globe className="w-3 h-3" />, color: 'success' },
      { type: 'identity', label: 'Black Owned', icon: <Star className="w-3 h-3" />, color: 'accent' },
      { type: 'service', label: 'Child-friendly', icon: <Baby className="w-3 h-3" />, color: 'accent' },
      { type: 'payment', label: 'Insurance accepted', icon: <CreditCard className="w-3 h-3" />, color: 'primary' }
    ],
    identityReviews: {
      count: 34,
      identity: "Black families"
    },
    recentlyAdded: true
  },
  {
    id: "3",
    name: "Carlos Private Tours",
    category: "Tour Guide",
    rating: 4.7,
    reviewCount: 89,
    city: "Boquete",
    whatsapp: "50765551236",
    verified: false,
    referrers: ["Mike", "Ana"],
    serviceTags: [
      { type: 'language', label: 'English-speaking', icon: <Globe className="w-3 h-3" />, color: 'success' },
      { type: 'service', label: 'Transport included', icon: <Car className="w-3 h-3" />, color: 'primary' }
    ],
    recentlyAdded: false
  },
  {
    id: "4",
    name: "Panama Properties Plus",
    category: "Real Estate Agent",
    rating: 4.9,
    reviewCount: 123,
    city: "David",
    whatsapp: "50765551237",
    verified: true,
    referrers: ["Mike", "Roberto", "Lisa"],
    serviceTags: [
      { type: 'language', label: 'English-speaking', icon: <Globe className="w-3 h-3" />, color: 'success' },
      { type: 'identity', label: 'Senior-friendly', icon: <Shield className="w-3 h-3" />, color: 'accent' },
      { type: 'payment', label: 'USD accepted', icon: <CreditCard className="w-3 h-3" />, color: 'primary' }
    ],
    identityReviews: {
      count: 45,
      identity: "retirees"
    },
    recentlyAdded: false
  }
];

const BusinessCard = ({ business }: { business: Business }) => {
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${business.whatsapp}`, '_blank');
  };

  const handleLocationClick = () => {
    window.open(`https://maps.google.com?q=${encodeURIComponent(business.name + ' ' + business.city)}`, '_blank');
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-foreground">{business.name}</h3>
              {business.verified && (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
              {business.recentlyAdded && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground font-medium">{business.category}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= business.rating
                    ? "fill-accent text-accent"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="font-semibold">{business.rating}</span>
          <span className="text-muted-foreground">({business.reviewCount} reviews)</span>
        </div>

        {/* Service Tags */}
        {business.serviceTags && business.serviceTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {business.serviceTags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`gap-1 text-xs ${
                  tag.color === 'success' ? 'border-success/30 text-success bg-success/10' :
                  tag.color === 'primary' ? 'border-primary/30 text-primary bg-primary/10' :
                  tag.color === 'accent' ? 'border-accent/30 text-accent bg-accent/10' :
                  'border-secondary/30 text-secondary-foreground bg-secondary/20'
                }`}
              >
                {tag.icon}
                {tag.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Referrer Info */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            Referred by <span className="font-semibold text-foreground">Mike</span>
            {business.referrers.length > 1 && (
              <span> + {business.referrers.length - 1} others</span>
            )}
          </span>
        </div>

        {/* Identity Reviews */}
        {business.identityReviews && (
          <div className="bg-secondary/50 p-3 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left p-0 h-auto font-normal"
            >
              <Eye className="w-4 h-4 mr-2 text-primary" />
              <span>
                <span className="font-semibold">{business.identityReviews.count} reviews</span>
                {" "}by {business.identityReviews.identity}
              </span>
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleWhatsAppClick}
            className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact via WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={handleLocationClick}
            className="flex-1"
          >
            <MapPin className="w-4 h-4 mr-2" />
            View Location
          </Button>
        </div>

        {/* City Badge */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <Badge variant="outline" className="gap-1">
            <MapPin className="w-3 h-3" />
            {business.city}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

const FilterSection = ({ onFilterChange }: { onFilterChange: (filters: any) => void }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");

  const categories = [
    "Immigration Lawyer",
    "Real Estate Agent",
    "Doctor",
    "Dentist",
    "Private Driver",
    "Tour Guide",
    "Accountant",
    "Banking",
    "Property Manager",
    "Restaurant"
  ];

  const cities = ["Panama City", "David", "Boquete"];
  const ratings = ["4.5+", "4.0+", "3.5+"];

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedCity("");
    setSelectedRating("");
    setSortBy("rating");
    onFilterChange({});
  };

  const hasActiveFilters = selectedCategory || selectedCity || selectedRating;

  return (
    <div className="bg-card p-6 rounded-lg border mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Find Services</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                <MapPin className="w-4 h-4 mr-2" />
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRating} onValueChange={setSelectedRating}>
          <SelectTrigger>
            <SelectValue placeholder="Min Rating" />
          </SelectTrigger>
          <SelectContent>
            {ratings.map((rating) => (
              <SelectItem key={rating} value={rating}>
                <Star className="w-4 h-4 mr-2" />
                {rating}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">
              <Star className="w-4 h-4 mr-2" />
              Highest Rated
            </SelectItem>
            <SelectItem value="recent">
              <Clock className="w-4 h-4 mr-2" />
              Recently Added
            </SelectItem>
            <SelectItem value="popular">
              <TrendingUp className="w-4 h-4 mr-2" />
              Most Contacted
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {selectedCategory}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedCategory("")}
              />
            </Badge>
          )}
          {selectedCity && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="w-3 h-3" />
              {selectedCity}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedCity("")}
              />
            </Badge>
          )}
          {selectedRating && (
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" />
              {selectedRating}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => setSelectedRating("")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

const AmbassadorProfileHeader = ({ profile }: { profile: AmbassadorProfile }) => {
  return (
    <Card className="p-8 mb-8 border-0 shadow-lg bg-gradient-to-r from-card to-secondary/30">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Profile Image */}
        <div className="relative">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary/20">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt="Ambassador Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Users className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-success rounded-full p-2">
            <CheckCircle className="w-6 h-6 text-success-foreground" />
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {profile.listName}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              "{profile.tagline}"
            </p>

            {/* Rating and Trust Score */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 fill-accent text-accent"
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{profile.rating}</span>
                <span className="text-muted-foreground">({profile.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="default" className="bg-success text-success-foreground">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified Ambassador
              </Badge>
              <Badge variant="secondary">
                Community Favorite
              </Badge>
              <Badge variant="secondary">
                Panama Expert
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">{profile.cities.length} Cities</span>
              </div>
              <p className="text-muted-foreground">{profile.cities.join(', ')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">{profile.businessCount} Businesses</span>
              </div>
              <p className="text-muted-foreground">Trusted local providers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-semibold text-lg">{profile.referralCount}+</span>
              </div>
              <p className="text-muted-foreground">Successful referrals</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const BusinessList = ({ businesses }: { businesses: Business[] }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedBusinesses = showAll ? businesses : businesses.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Trusted Service Providers
        </h2>
        <div className="text-muted-foreground">
          {businesses.length} businesses found
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayedBusinesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>

      {businesses.length > 4 && (
        <Card className="p-6 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="gap-2"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {businesses.length - 4} More Businesses
              </>
            )}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default function AmbassadorDirectory() {
  const [match, params] = useRoute('/directory/:pageUrl');
  const [filters, setFilters] = useState({});
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (match && params?.pageUrl) {
      fetchAmbassadorData(params.pageUrl);
    }
  }, [match, params]);

  const fetchAmbassadorData = async (pageUrl: string) => {
    try {
      setLoading(true);
      
      // Fetch ambassador profile
      const ambassadorResponse = await fetch(`/api/ambassadors/${pageUrl}`);
      if (!ambassadorResponse.ok) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      const ambassadorData = await ambassadorResponse.json();
      
      // Transform to expected format
      const transformedProfile: AmbassadorProfile = {
        id: ambassadorData.id,
        listName: ambassadorData.listName,
        slug: ambassadorData.pageUrl,
        fullName: ambassadorData.fullName,
        profileImageUrl: ambassadorData.profileImageUrl,
        tagline: ambassadorData.tagline || 'Helping expats find trusted local services',
        rating: 4.9, // TODO: Calculate actual rating
        reviewCount: 247, // TODO: Calculate actual review count
        cities: [ambassadorData.country], // TODO: Parse from businesses
        businessCount: 0, // Will be updated when businesses load
        referralCount: 1200, // TODO: Calculate actual referrals
        verified: ambassadorData.verified,
      };
      
      setProfile(transformedProfile);
      
      // Fetch businesses for this ambassador
      const businessResponse = await fetch(`/api/ambassadors/${pageUrl}/businesses`);
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        
        // Transform businesses to expected format
        const transformedBusinesses: Business[] = businessData.map((business: any) => ({
          id: business.id,
          name: business.name,
          category: business.category,
          rating: business.rating || 4.5,
          reviewCount: business.reviewCount || 10,
          city: business.city,
          whatsapp: business.whatsapp,
          verified: business.verified,
          referrers: [ambassadorData.fullName], // Ambassador is the referrer
          serviceTags: business.serviceTags ? business.serviceTags.map((tag: string) => ({
            type: 'service' as const,
            label: tag,
            icon: <Globe className="w-3 h-3" />,
            color: 'primary' as const,
          })) : [],
          recentlyAdded: business.recentlyAdded,
        }));
        
        setBusinesses(transformedBusinesses);
        
        // Update profile with actual business count
        setProfile(prev => prev ? { ...prev, businessCount: transformedBusinesses.length } : null);
      }
      
    } catch (error) {
      console.error('Error fetching ambassador data:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // TODO: Apply filters to business list
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Ambassador Not Found</h1>
          <p className="text-muted-foreground">The ambassador page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Ambassador Profile */}
        <AmbassadorProfileHeader profile={profile} />

        {/* Filters */}
        <FilterSection onFilterChange={handleFilterChange} />

        {/* Business Directory */}
        <BusinessList businesses={businesses} />
      </div>

      {/* Footer */}
      <footer className="bg-card mt-16 border-t border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p>Powered by Comuniti - Connecting expats with trusted local services</p>
          </div>
        </div>
      </footer>
    </div>
  );
}