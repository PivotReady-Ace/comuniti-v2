import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';

export function Home() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleInfluencerClick = () => {
    setLocation('/onboarding/ambassador');
  };

  const handleBusinessClick = () => {
    setLocation('/onboarding/business');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-6">
        <LanguageSelector />
      </div>
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/Original-Logo.svg" 
            alt="Comuniti" 
            className="h-14 w-auto"
          />
        </div>
        
        {/* Headlines */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('home.subtitle')}
          </p>
        </div>
        
        {/* Buttons */}
        <div className="space-y-4 pt-8">
          <Button 
            onClick={handleInfluencerClick}
            className="w-full py-6 text-lg font-semibold bg-[#F1762E] hover:bg-[#F1762E]/90 hover:scale-105 transition-all duration-200 text-white shadow-lg hover:shadow-xl border-2 border-transparent hover:border-[#F1762E]/30"
          >
            {t('home.influencer-btn')}
          </Button>
          
          <Button 
            onClick={handleBusinessClick}
            className="w-full py-6 text-lg font-semibold bg-[#008080] hover:bg-[#008080]/90 hover:scale-105 transition-all duration-200 text-white shadow-lg hover:shadow-xl border-2 border-transparent hover:border-[#008080]/30"
          >
            {t('home.business-btn')}
          </Button>
        </div>
      </div>
    </div>
  );
}