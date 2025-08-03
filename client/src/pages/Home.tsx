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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#003366] shadow-xl">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/attached_assets/Comuniti_Transparent Logo_1754244988005.png" 
                alt="Comuniti" 
                className="h-20 w-auto"
              />
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl w-full text-center space-y-10">
          {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-[#003366] leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>
          </div>
          
          {/* Call-to-Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-200">
              <Button 
                onClick={handleInfluencerClick}
                className="w-full py-8 text-lg font-semibold bg-[#F1762E] hover:bg-[#F1762E]/90 hover:scale-105 transition-all duration-200 text-white shadow-lg hover:shadow-xl border-2 border-transparent hover:border-[#F1762E]/30 rounded-xl"
              >
                {t('home.influencer-btn')}
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-200">
              <Button 
                onClick={handleBusinessClick}
                className="w-full py-8 text-lg font-semibold bg-[#008080] hover:bg-[#008080]/90 hover:scale-105 transition-all duration-200 text-white shadow-lg hover:shadow-xl border-2 border-transparent hover:border-[#008080]/30 rounded-xl"
              >
                {t('home.business-btn')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}