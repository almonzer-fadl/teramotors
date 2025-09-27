'use client'

import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { useEffect } from 'react';

export default function I18nProvider({
  children
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Only change language after hydration to prevent mismatch
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang && storedLang !== i18n.language) {
      // Use setTimeout to ensure this happens after hydration
      setTimeout(() => {
        i18n.changeLanguage(storedLang);
      }, 0);
    }

    const setLangAndDir = () => {
      if (typeof window !== 'undefined') {
        document.documentElement.lang = i18n.language;
        document.documentElement.dir = i18n.dir(i18n.language);
      }
    };

    // Set on initial load and on language change
    i18n.on('initialized', setLangAndDir);
    i18n.on('languageChanged', setLangAndDir);
    
    if (i18n.isInitialized) {
      setLangAndDir();
    }

    return () => {
      i18n.off('initialized', setLangAndDir);
      i18n.off('languageChanged', setLangAndDir);
    };
  }, []);

  // Handle language changes by updating localStorage
  const handleLanguageChange = (lng: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lng);
    }
  };

  useEffect(() => {
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}