import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, User } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { useTranslation } from 'react-i18next';
import { emailSignUp } from '../lib/useEmailAuth';
import { NotifyMeForm } from './NotifyMeForm';

export function SignupScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [newsletter, setNewsletter] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.passwordMismatch'));
      return;
    }

    setLoading(true);
    const result = await emailSignUp({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      newsletter,
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error || '');
      return;
    }

    navigate('/account-setup');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <XploraLogo variant="full" className="h-16" />
          </div>
          <h1 className="text-3xl mb-2">{t('signup.title')}</h1>
          <p className="text-muted-foreground">{t('signup.subtitle')}</p>
        </div>

        <div className="rounded-2xl border border-border bg-primary/5 p-5 space-y-2 mb-6">
          <p className="text-sm font-medium">{t('itinerary.toursComingSoonTitle')}</p>
          <p className="text-sm text-muted-foreground">{t('itinerary.toursComingSoonBody')}</p>
          <NotifyMeForm className="pt-1" source="signup" />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">{t('signup.fullName')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('signup.fullNamePlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">{t('signup.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('signup.emailPlaceholder')}
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

          <div>
            <label className="block text-sm mb-2">{t('signup.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-1 rounded border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">{t('signup.newsletterConsent')}</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity mt-6 disabled:opacity-60"
          >
            {loading ? t('signup.creating') : t('signup.createAccount')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('signup.hasAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">{t('signup.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
