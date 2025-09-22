import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "./lib/locales/en/common.json";
import arTranslation from "./lib/locales/ar/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enTranslation,
      },
      ar: {
        common: arTranslation,
      },
    },
    ns: ['common'],
    defaultNS: 'common',
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
    }
  });

export default i18n;
