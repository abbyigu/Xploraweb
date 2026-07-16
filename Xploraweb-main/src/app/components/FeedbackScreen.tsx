import { useState } from 'react';
import { Check, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';
import { submitFeedback } from '../lib/feedback';
import { analytics } from '../lib/analytics';

export function FeedbackScreen() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || status === 'loading') return;
    setStatus('loading');
    const result = await submitFeedback(message.trim(), email.trim());
    if (result.ok) analytics.feedbackSubmitted();
    setStatus(result.ok ? 'done' : 'error');
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">

      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Xplora</p>
          <h1 className="text-2xl md:text-3xl mb-1">{t('feedback.title')}</h1>
          <p className="text-sm md:text-base opacity-90">{t('feedback.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 md:px-8 py-14">
        {status === 'done' ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <p className="font-medium">{t('feedback.successTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('feedback.successDesc')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t('feedback.formIntro')}</p>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('feedback.messageLabel')}</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('feedback.messagePlaceholder')}
                className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">{t('feedback.emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('feedback.emailPlaceholder')}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600">{t('feedback.errorDesc')}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#12343B] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {status === 'loading' ? t('feedback.submitting') : t('feedback.submit')}
            </button>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
