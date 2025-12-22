import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import en from '../locales/en.json';
import el from '../locales/el.json';

const translations: Record<string, Record<string, string>> = {
  en,
  el,
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let translation = translations[language][key] || key;
    
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        const value = params[paramKey];
        translation = translation.replace(
          new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'),
          String(value)
        );
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 