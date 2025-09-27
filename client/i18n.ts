import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./lib/locales/en/common.json";
import arTranslation from "./lib/locales/ar/common.json";

// Always start with English to prevent hydration mismatches
i18n
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
    lng: "en", // Always start with English
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense to prevent hydration issues
    }
  });

export default i18n;
