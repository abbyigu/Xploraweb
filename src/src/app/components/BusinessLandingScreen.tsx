import { Link } from 'react-router';
import { ArrowRight, CheckCircle, Building2 } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { SimpleFooter } from './SimpleFooter';

export function BusinessLandingScreen() {
  const steps = [
    {
      step: '1',
      title: 'Create your business account',
      desc: 'Sign up in under 2 minutes. Just your business name, type, and contact info.',
    },
    {
      step: '2',
      title: 'Submit your perk',
      desc: 'Add your offer — a discount, a welcome drink, skip-the-line access, a special menu. Any exclusive deal works.',
    },
    {
      step: '3',
      title: 'Go live instantly',
      desc: 'Your perk appears in the Club Horizon perks feed for all members to see and redeem.',
    },
  ];

  const benefits = [
    'No upfront cost — completely free to offer a perk',
    'Direct exposure to engaged Québec City locals',
    'Host a members-only 5 à 7 at your venue',
    'Featured placement in curated itineraries',
    'Manage your perks anytime from your dashboard',
    'Build a loyal relationship with Club Horizon members',
  ];

  const partnerTypes = [
    { icon: '🍷', label: 'Restaurants & Bars' },
    { icon: '☕', label: 'Cafés' },
    { icon: '🎨', label: 'Galleries & Art Studios' },
    { icon: '🛍️', label: 'Boutiques & Shops' },
    { icon: '🧘', label: 'Wellness & Fitness Studios' },
    { icon: '🎭', label: 'Entertainment & Events' },
    { icon: '🏨', label: 'Hotels & Accommodations' },
    { icon: '📸', label: 'Experiences & Tours' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20">
          <div className="flex justify-center mb-8">
            <XploraLogo variant="full" className="h-20" />
          </div>
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm">
              <Building2 className="w-4 h-4" /> Partner Program
            </div>
            <h1 className="text-3xl md:text-5xl leading-tight">
              Reach Québec City explorers<br />who actually show up
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Club Horizon members are engaged locals and young professionals actively discovering the city. Offering a perk puts your venue in their hands — for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                to="/business/signup"
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Create Business Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/business/login"
                className="px-8 py-4 bg-white/40 backdrop-blur-sm text-foreground rounded-2xl text-base hover:bg-white/50 transition-colors flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-3">How it works</h2>
          <p className="text-muted-foreground">Up and running in minutes, not weeks</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="relative">
              <div className="absolute -top-3 -left-2 text-6xl font-serif text-primary/10 select-none">{s.step}</div>
              <div className="relative pt-4 space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {s.step}
                </div>
                <h3 className="text-xl">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-muted/30 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 md:items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl">Why partner with Club Horizon?</h2>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/business/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm hover:opacity-90 transition-opacity"
              >
                Get Started — It's Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-shrink-0 bg-card border border-border rounded-3xl p-8 w-full md:w-80 space-y-6">
              <h3 className="text-lg">What kind of perk works?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  '🍸 First drink on us',
                  '🍽️ 10% off your bill',
                  '🎟️ Skip-the-line access',
                  '🥐 Free pastry with coffee',
                  '🎨 Private after-hours viewing',
                  '📦 Members-only discount',
                  '🧘 Free first class',
                  '🛍️ Exclusive product drop',
                ].map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Who can partner */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl mb-3">Who we partner with</h2>
          <p className="text-muted-foreground">Any Québec City business with a great offer</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partnerTypes.map((t) => (
            <div key={t.label} className="bg-card border border-border rounded-2xl p-5 text-center space-y-2">
              <div className="text-3xl">{t.icon}</div>
              <p className="text-sm text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-6 md:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl">Ready to reach Club Horizon members?</h2>
          <p className="opacity-80">Create your free business account and submit your first perk today.</p>
          <Link
            to="/business/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-2xl text-base font-medium hover:opacity-90 transition-opacity"
          >
            Create Business Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
