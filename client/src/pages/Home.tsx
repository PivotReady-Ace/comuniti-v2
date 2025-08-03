import { useLocation } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { UserTypeCard } from '@/components/UserTypeCard';

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleInfluencerClick = () => {
    setLocation('/ambassador/onboarding');
  };

  const handleBusinessClick = () => {
    // TODO: Implement business onboarding
    console.log('Business onboarding not yet implemented');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-comuniti-blue rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold text-comuniti-blue">{t('nav.comuniti')}</span>
            </div>
            <LanguageSelector />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="gradient-comuniti-primary">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <img 
                src="/assets/comuniti-logo.png" 
                alt="Comuniti" 
                className="h-24 w-auto drop-shadow-lg"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              {t('home.question')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <UserTypeCard
                type="influencer"
                title={t('userType.influencer.title')}
                description={t('userType.influencer.description')}
                features={[
                  'Build your recommendation list',
                  'Earn from referrals',
                  'Help your community'
                ]}
                icon="fas fa-star"
                gradientFrom="comuniti-orange"
                gradientTo="comuniti-yellow"
                buttonText={t('userType.influencer.button')}
                onClick={handleInfluencerClick}
              />
              
              <UserTypeCard
                type="business"
                title={t('userType.business.title')}
                description={t('userType.business.description')}
                features={[
                  'Reach expat communities',
                  'Build trust through referrals',
                  'Grow your customer base'
                ]}
                icon="fas fa-building"
                gradientFrom="comuniti-teal"
                gradientTo="comuniti-cyan"
                buttonText={t('userType.business.button')}
                onClick={handleBusinessClick}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-comuniti-blue text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/assets/comuniti-logo.png" 
                  alt="Comuniti" 
                  className="h-8 w-auto mr-2"
                />
              </div>
              <p className="text-white/80 text-sm">
                Connecting expat communities worldwide through trusted recommendations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Influencers</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white">Join as Ambassador</a></li>
                <li><a href="#" className="hover:text-white">Earn Through Referrals</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Businesses</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white">Get Listed</a></li>
                <li><a href="#" className="hover:text-white">Verification Process</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2024 Comuniti. All rights reserved. Made with ❤️ for expat communities worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
