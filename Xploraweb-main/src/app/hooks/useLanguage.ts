import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export function useLanguage() {
  const { i18n } = useTranslation();

  const setLanguage = async (lang: 'en' | 'fr') => {
    await i18n.changeLanguage(lang);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ language: lang }).eq('id', user.id);
    }
  };

  return { language: i18n.language as 'en' | 'fr', setLanguage };
}
