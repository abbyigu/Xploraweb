import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, User, Globe, Building2 } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { analytics } from '../lib/analytics';

const BUSINESS_TYPES = [
  'Restaurant',
  'Bar / Lounge',
  'Café',
  'Gallery / Studio',
  'Boutique / Shop',
  'Wellness / Fitness',
  'Entertainment / Events',
  'Hotel / Accommodation',
  'Experience / Tour',
  'Other',
];

export function BusinessSignupScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    contactName: '',
    businessName: '',
    businessType: '',
    email: '',
    password: '',
    confirmPassword: '',
    website: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.businessType) {
      setError('Please select a business type');
      return;
    }

    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.contactName, account_type: 'business', business_name: form.businessName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = signUpData?.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        name: form.contactName,
        email: form.email,
        account_type: 'business',
        business_name: form.businessName,
        business_type: form.businessType,
        business_website: form.website || null,
        location: 'Quebec City, QC',
        interests: [],
        avatar_url: null,
      });
    }

    analytics.businessSignUp(form.businessType);
    setLoading(false);
    navigate('/business/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <XploraLogo variant="full" className="h-14" />
          </div>
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs mb-3">
            <Building2 className="w-3.5 h-3.5" /> {t('business.signupTitle')}
          </div>
          <h1 className="text-2xl mb-1">{t('business.signupSubtitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('business.signupDesc')}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5">{t('business.businessName')}</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={form.businessName}
                onChange={set('businessName')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Le Perché Rooftop"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5">{t('business.businessType')}</label>
            <select
              value={form.businessType}
              onChange={set('businessType')}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
              required
            >
              <option value="">Select a type…</option>
              {BUSINESS_TYPES.map((btype) => (
                <option key={btype} value={btype}>{btype}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1.5">{t('business.yourName')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={form.contactName}
                onChange={set('contactName')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5">{t('business.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="hello@yourvenue.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5">{t('business.website')}</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                value={form.website}
                onChange={set('website')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="https://yourvenue.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5">{t('business.password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5">{t('business.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity mt-2 disabled:opacity-60 text-sm"
          >
            {loading ? t('business.creating') : t('business.createBusinessBtn')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('business.hasAccount')}{' '}
          <Link to="/business/login" className="text-primary hover:underline">{t('business.signIn')}</Link>
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {t('business.lookingPersonalAccount')}{' '}
          <Link to="/signup" className="text-primary hover:underline">{t('business.joinAsMember')}</Link>
        </p>
      </div>
    </div>
  );
}
