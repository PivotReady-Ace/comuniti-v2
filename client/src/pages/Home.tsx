import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export function Home() {
  const [, setLocation] = useLocation();

  const handleInfluencerClick = () => {
    setLocation('/onboarding/ambassador');
  };

  const handleBusinessClick = () => {
    setLocation('/onboarding/business');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/comuniti-logo.png" 
            alt="Comuniti" 
            className="h-14 w-auto"
          />
        </div>
        
        {/* Headlines */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Turn Trust Into Income
          </h1>
          <p className="text-xl text-gray-600">
            Are you an influencer or a service provider?
          </p>
        </div>
        
        {/* Buttons */}
        <div className="space-y-4 pt-8">
          <Button 
            onClick={handleInfluencerClick}
            className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-white"
          >
            I'm an Influencer or Content Creator
          </Button>
          
          <Button 
            onClick={handleBusinessClick}
            className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-white"
          >
            I'm a Business that Offers Services
          </Button>
        </div>
      </div>
    </div>
  );
}