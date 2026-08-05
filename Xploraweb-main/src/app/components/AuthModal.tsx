import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { emailSignIn, emailSignUp } from '../lib/useEmailAuth';

type Mode = 'signup' | 'signin';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful signup or sign-in — the modal stays mounted
   * (loading state) until the caller closes it, so it can save the pending
   * itinerary and show a success state before this modal disappears. */
  onAuthenticated: () => void;
}

export function AuthModal({ open, onOpenChange, onAuthenticated }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
    setMode('signup');
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = mode === 'signup'
      ? await emailSignUp({ name, email, password, newsletter: false })
      : await emailSignIn(email, password);
    if (!result.ok) {
      setLoading(false);
      setError(result.error || t('authModal.genericError'));
      return;
    }
    onAuthenticated();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'signup' ? t('authModal.title') : t('authModal.signinTitle')}</DialogTitle>
          <DialogDescription>{mode === 'signup' ? t('authModal.body') : t('authModal.signinBody')}</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('signup.fullNamePlaceholder')}
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('signup.emailPlaceholder')}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {mode === 'signup' ? t('authModal.createButton') : t('authModal.signinButton')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'signup' ? (
            <>
              {t('authModal.hasAccount')}{' '}
              <button type="button" onClick={() => switchMode('signin')} className="text-primary hover:underline">
                {t('authModal.signinLink')}
              </button>
            </>
          ) : (
            <>
              {t('authModal.noAccount')}{' '}
              <button type="button" onClick={() => switchMode('signup')} className="text-primary hover:underline">
                {t('authModal.signupLink')}
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
