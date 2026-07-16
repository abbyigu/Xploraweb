import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { subscribeToNewsletter } from '../lib/newsletter';
import { analytics } from '../lib/analytics';

export function NotifyMeForm({ className = '', source = 'unknown' }: { className?: string; source?: string }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    await subscribeToNewsletter(email);
    analytics.leadCaptured(source);
    setStatus('done');
  }

  if (status === 'done') {
    return (
      <p className={`flex items-center gap-1.5 text-sm text-primary font-medium ${className}`}>
        <Check className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        {t('notify.success')}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t('notify.emailPlaceholder')}
        aria-label={t('notify.emailPlaceholder')}
        className="flex-1 min-w-0 border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
      >
        {status === 'loading' ? t('notify.loading') : t('notify.cta')}
      </button>
    </form>
  );
}
