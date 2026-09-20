import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './fr.json';

// fr is the fallback so it stays eager; en is a lazy chunk, loaded before first
// render (i18nReady) or before switching to it.
const loadEn = () =>
  import('./en.json').then((m) => {
    i18n.addResourceBundle('en', 'translation', m.default, true, true);
  });

export const i18nReady = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
    },
    fallbackLng: 'fr',
    supportedLngs: ['en', 'fr'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'xplora_lang',
    },
    interpolation: { escapeValue: false },
  })
  .then(() => (i18n.language?.startsWith('en') ? loadEn() : undefined));

const changeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lng, ...rest) => {
  if (lng?.startsWith('en')) await loadEn();
  return changeLanguage(lng, ...rest);
};

export default i18n;
