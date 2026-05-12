import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl mb-2">{t('forgotPassword.checkInbox')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('forgotPassword.sentTo')} <strong>{email}</strong>. {t('forgotPassword.clickIt')}
          </p>
          <button onClick={() => navigate('/login')} className="text-primary hover:underline text-sm">
            {t('forgotPassword.backToSignIn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <XploraLogo variant="full" className="h-16" />
          </div>
          <h1 className="text-3xl mb-2">{t('forgotPassword.title')}</h1>
          <p className="text-muted-foreground">{t('forgotPassword.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">{t('forgotPassword.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity mt-6 disabled:opacity-60"
          >
            {loading ? t('forgotPassword.sending') : t('forgotPassword.sendLink')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('forgotPassword.remembered')}{' '}
          <button onClick={() => navigate('/login')} className="text-primary hover:underline">
            {t('forgotPassword.signIn')}
          </button>
        </p>
      </div>
    </div>
  );
}
