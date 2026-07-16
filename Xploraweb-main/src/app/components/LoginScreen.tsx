import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { NotifyMeForm } from './NotifyMeForm';
import { analytics } from '../lib/analytics';

export function LoginScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (signInError) {
      setError(t('login.error'));
      setLoading(false);
      return;
    }

    analytics.login('email');
    setLoading(false);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <XploraLogo variant="full" className="h-16" />
          </div>
          <h1 className="text-3xl mb-2">{t('login.title')}</h1>
          <p className="text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <div className="rounded-2xl border border-border bg-primary/5 p-5 space-y-2 mb-6">
          <p className="text-sm font-medium">{t('itinerary.toursComingSoonTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('itinerary.toursComingSoonBody')}</p>
          <NotifyMeForm className="pt-1" source="login" />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">{t('login.email', { defaultValue: t('signup.email') })}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">{t('signup.password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>{t('login.rememberMe')}</span>
            </label>
            <button type="button" onClick={() => navigate('/forgot-password')} className="text-primary hover:underline">{t('login.forgotPassword')}</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity mt-6 disabled:opacity-60"
          >
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('login.noAccount')}{' '}
          <Link to="/signup" className="text-primary hover:underline">{t('login.createOne')}</Link>
        </p>
      </div>
    </div>
  );
}
