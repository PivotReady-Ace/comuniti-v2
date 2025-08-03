import { useLanguage } from '@/context/LanguageContext';
import { LANGUAGES } from '@/utils/constants';
import { Button } from '@/components/ui/button';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
      {LANGUAGES.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1 text-sm font-medium ${
            language === lang.code
              ? 'text-white bg-comuniti-blue'
              : 'text-gray-600 hover:text-comuniti-blue'
          }`}
        >
          {lang.name}
        </Button>
      ))}
    </div>
  );
}
