import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.directory': 'Directory',
    'nav.become-ambassador': 'Become Ambassador',
    
    // Home page
    'home.title': 'Turn Trust Into Income',
    'home.subtitle': 'Are you an influencer or a service provider?',
    'home.cta': 'Find Recommendations',
    'home.influencer-btn': "I'm an Influencer or Content Creator",
    'home.business-btn': "I'm a Business that Offers Services",
    
    // Ambassador page
    'ambassador.verified': 'Verified Ambassador',
    'ambassador.businesses': 'Trusted Service Providers',
    'ambassador.referrals': 'Successful referrals',
    'ambassador.followers': 'followers',
    'ambassador.referred-by': 'Referred by',
    'ambassador.whatsapp': 'WhatsApp',
    'ambassador.view-map': 'View Map',
    'ambassador.verified-business': 'Verified Business',
    'ambassador.no-businesses': 'No businesses listed yet',
    'ambassador.no-businesses-desc': "This ambassador hasn't added any business recommendations to their list yet. Check back soon!",
    'ambassador.businesses-found': 'businesses found',
    'ambassador.reviews': 'reviews',
    'ambassador.trusted-providers': 'Trusted local providers',
    'ambassador.verified-ambassador': 'Verified Ambassador',
    'ambassador.community-favorite': 'Community Favorite',
    'ambassador.expert': 'Expert',
    'ambassador.businesses-stat': 'Businesses',
    
    // Footer
    'footer.powered-by': 'Powered by',
    'footer.tagline': 'Connecting expat influencers with trusted service providers worldwide',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.directory': 'Directorio',
    'nav.become-ambassador': 'Ser Embajador',
    
    // Home page
    'home.title': 'Convierte la Confianza en Ingresos',
    'home.subtitle': '¿Eres un influencer o un proveedor de servicios?',
    'home.cta': 'Encontrar Recomendaciones',
    'home.influencer-btn': 'Soy un Influencer o Creador de Contenido',
    'home.business-btn': 'Soy un Negocio que Ofrece Servicios',
    
    // Ambassador page
    'ambassador.verified': 'Embajador Verificado',
    'ambassador.businesses': 'Proveedores de Servicios de Confianza',
    'ambassador.referrals': 'Referencias exitosas',
    'ambassador.followers': 'seguidores',
    'ambassador.referred-by': 'Recomendado por',
    'ambassador.whatsapp': 'WhatsApp',
    'ambassador.view-map': 'Ver Mapa',
    'ambassador.verified-business': 'Negocio Verificado',
    'ambassador.no-businesses': 'Aún no hay negocios listados',
    'ambassador.no-businesses-desc': 'Este embajador aún no ha agregado recomendaciones de negocios a su lista. ¡Vuelve pronto!',
    'ambassador.businesses-found': 'negocios encontrados',
    'ambassador.reviews': 'reseñas',
    'ambassador.trusted-providers': 'Proveedores locales de confianza',
    'ambassador.verified-ambassador': 'Embajador Verificado',
    'ambassador.community-favorite': 'Favorito de la Comunidad',
    'ambassador.expert': 'Experto',
    'ambassador.businesses-stat': 'Negocios',
    
    // Footer
    'footer.powered-by': 'Desarrollado por',
    'footer.tagline': 'Conectando influencers expatriados con proveedores de servicios confiables en todo el mundo',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.directory': 'Diretório',
    'nav.become-ambassador': 'Ser Embaixador',
    
    // Home page
    'home.title': 'Transforme Confiança em Renda',
    'home.subtitle': 'Você é um influenciador ou um prestador de serviços?',
    'home.cta': 'Encontrar Recomendações',
    'home.influencer-btn': 'Sou um Influenciador ou Criador de Conteúdo',
    'home.business-btn': 'Sou um Negócio que Oferece Serviços',
    
    // Ambassador page
    'ambassador.verified': 'Embaixador Verificado',
    'ambassador.businesses': 'Prestadores de Serviços Confiáveis',
    'ambassador.referrals': 'Indicações bem-sucedidas',
    'ambassador.followers': 'seguidores',
    'ambassador.referred-by': 'Indicado por',
    'ambassador.whatsapp': 'WhatsApp',
    'ambassador.view-map': 'Ver Mapa',
    'ambassador.verified-business': 'Negócio Verificado',
    'ambassador.no-businesses': 'Nenhum negócio listado ainda',
    'ambassador.no-businesses-desc': 'Este embaixador ainda não adicionou recomendações de negócios à sua lista. Volte em breve!',
    'ambassador.businesses-found': 'negócios encontrados',
    'ambassador.reviews': 'avaliações',
    'ambassador.trusted-providers': 'Prestadores locais confiáveis',
    'ambassador.verified-ambassador': 'Embaixador Verificado',
    'ambassador.community-favorite': 'Favorito da Comunidade',
    'ambassador.expert': 'Especialista',
    'ambassador.businesses-stat': 'Negócios',
    
    // Footer
    'footer.powered-by': 'Desenvolvido por',
    'footer.tagline': 'Conectando influenciadores expatriados com prestadores de serviços confiáveis em todo o mundo',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
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