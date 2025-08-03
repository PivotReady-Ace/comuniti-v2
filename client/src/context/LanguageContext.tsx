import { createContext, useContext, useState, ReactNode } from 'react';
import { LANGUAGES } from '@/utils/constants';

type Language = typeof LANGUAGES[number]['code'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.comuniti': 'Comuniti',
    'home.title': 'Comuniti',
    'home.subtitle': 'Connecting expat influencers with trusted service providers worldwide',
    'home.question': 'How would you like to join our community?',
    'userType.influencer.title': "I'm an Influencer",
    'userType.influencer.description': 'Share your favorite local businesses and earn through trusted recommendations to your community',
    'userType.influencer.button': 'Start as Influencer',
    'userType.business.title': "I'm a Business",
    'userType.business.description': 'Get discovered by expat communities through trusted influencer recommendations',
    'userType.business.button': 'Join as Business',
  },
  es: {
    'nav.comuniti': 'Comuniti',
    'home.title': 'Comuniti',
    'home.subtitle': 'Conectando influencers expatriados con proveedores de servicios confiables en todo el mundo',
    'home.question': '¿Cómo te gustaría unirte a nuestra comunidad?',
    'userType.influencer.title': 'Soy un Influencer',
    'userType.influencer.description': 'Comparte tus negocios locales favoritos y gana a través de recomendaciones confiables a tu comunidad',
    'userType.influencer.button': 'Empezar como Influencer',
    'userType.business.title': 'Soy un Negocio',
    'userType.business.description': 'Sé descubierto por comunidades expatriadas a través de recomendaciones de influencers confiables',
    'userType.business.button': 'Unirse como Negocio',
  },
  pt: {
    'nav.comuniti': 'Comuniti',
    'home.title': 'Comuniti',
    'home.subtitle': 'Conectando influenciadores expatriados com fornecedores de serviços confiáveis em todo o mundo',
    'home.question': 'Como você gostaria de se juntar à nossa comunidade?',
    'userType.influencer.title': 'Sou um Influenciador',
    'userType.influencer.description': 'Compartilhe seus negócios locais favoritos e ganhe através de recomendações confiáveis para sua comunidade',
    'userType.influencer.button': 'Começar como Influenciador',
    'userType.business.title': 'Sou um Negócio',
    'userType.business.description': 'Seja descoberto por comunidades expatriadas através de recomendações de influenciadores confiáveis',
    'userType.business.button': 'Juntar-se como Negócio',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
