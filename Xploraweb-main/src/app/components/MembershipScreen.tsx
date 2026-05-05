import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SimpleFooter } from './SimpleFooter';

const perks = [
  { icon: '🎟️', text: 'Early access to all experiences (48h priority)' },
  { icon: '💸', text: 'Member-only pricing on events' },
  { icon: '👫', text: '1 free guest pass every month' },
  { icon: '🍸', text: 'Monthly members-only 5 à 7' },
  { icon: '🔓', text: 'Insider perks & local deals' },
  { icon: '🎁', text: 'Surprise upgrades & freebies' },
];

export function MembershipScreen() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // TODO: wire to Stripe subscription checkout once Price IDs are configured
    setJoining(true);
    setTimeout(() => setJoining(false), 2000);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-6 md:px-8 pt-8 pb-10 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Star className="w-6 h-6 fill-current" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl mb-2">Club Membership</h1>
          <p className="text-sm md:text-base opacity-90">
            Your key to Québec City's best-kept secrets
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 md:px-8 py-8 space-y-6">

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 bg-muted rounded-full p-1 w-fit mx-auto">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm transition-all ${billing === 'monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-5 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            Yearly
            <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">Save $20</span>
          </button>
        </div>

        {/* Price card */}
        <div className="bg-card border-2 border-primary rounded-3xl p-6 md:p-8 text-center shadow-sm">
          <div className="mb-1">
            {billing === 'monthly' ? (
              <>
                <span className="text-5xl font-serif">$10</span>
                <span className="text-muted-foreground text-lg">/month</span>
              </>
            ) : (
              <>
                <span className="text-5xl font-serif">$100</span>
                <span className="text-muted-foreground text-lg">/year</span>
                <p className="text-sm text-secondary mt-1">That's $8.33/month — 2 months free</p>
              </>
            )}
          </div>

          <button
            onClick={handleSubscribe}
            className="mt-6 w-full bg-primary text-primary-foreground py-4 rounded-2xl text-base font-medium hover:opacity-90 transition-opacity"
          >
            {joining ? '✓ Coming soon — stay tuned!' : `Join for ${billing === 'monthly' ? '$10/month' : '$100/year'}`}
          </button>
          <p className="text-xs text-muted-foreground mt-3">Cancel anytime. No commitment.</p>
        </div>

        {/* Perks list */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-4">
          <h2 className="text-lg mb-2">What's included</h2>
          {perks.map((perk) => (
            <div key={perk.text} className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{perk.icon}</span>
              <span className="text-sm md:text-base text-foreground">{perk.text}</span>
            </div>
          ))}
        </div>

        {/* Already a member? */}
        <p className="text-center text-sm text-muted-foreground">
          Already a member?{' '}
          <button onClick={() => navigate('/login')} className="text-primary underline underline-offset-2">
            Log in
          </button>
        </p>
      </div>

      <SimpleFooter />
    </div>
  );
}
