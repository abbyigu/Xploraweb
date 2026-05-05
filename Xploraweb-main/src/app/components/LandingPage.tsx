import { Link } from 'react-router';
import { ArrowRight, MapPin, Sparkles, Users, Calendar, Star, Building2 } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Footer } from './Footer';

export function LandingPage() {
  const memberBenefits = [
    { icon: '🎟️', label: '48h early access to all experiences' },
    { icon: '👫', label: '1 free guest pass every month' },
    { icon: '🍸', label: 'Monthly members-only 5 à 7' },
    { icon: '✨', label: 'Insider perks at local venues' },
    { icon: '🎁', label: 'Surprise upgrades & bonuses' },
    { icon: '💰', label: 'Member pricing on all experiences' },
  ];

  const highlights = [
    {
      image: 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      label: 'Saint-Roch',
      title: 'Soft Night in Saint-Roch',
      sub: 'wine, wandering & a hidden stop',
    },
    {
      image: 'https://images.unsplash.com/photo-1758346972493-86586fc8e5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      label: 'Vieux-Port',
      title: 'Morning Rituals in Old Port',
      sub: 'fresh bread, market chaos & coffee',
    },
    {
      image: 'https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      label: 'Petit-Champlain',
      title: 'Lost Hours in Petit-Champlain',
      sub: 'cobblestones, antiques & hidden gems',
    },
  ];

  const partnerTypes = [
    { icon: '🍷', label: 'Restaurants & Bars' },
    { icon: '☕', label: 'Cafés' },
    { icon: '🎨', label: 'Galleries & Studios' },
    { icon: '🛍️', label: 'Boutiques' },
    { icon: '🧘', label: 'Wellness & Fitness' },
    { icon: '🎭', label: 'Entertainment' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/20 text-foreground">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <XploraLogo variant="full" className="h-28 md:h-40" />

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest opacity-60">Club Horizon — Québec City</p>
              <h1 className="text-3xl md:text-5xl leading-tight">
                Discover Québec City<br />like you actually live here
              </h1>
              <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto">
                Curated experiences, exclusive 5 à 7 meetups, and insider perks at the best local venues — all in one members-only club.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <Link
                to="/signup"
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Join Club Horizon
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/40 backdrop-blur-sm text-foreground rounded-2xl text-base hover:bg-white/50 transition-colors flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm opacity-70 pt-2">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Québec City</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> Launching June 2026</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Members-only</span>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-3">Made for people who actually want to explore</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">No more generic Google searches. Club Horizon gives you a real local's view of Québec City.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sparkles className="w-7 h-7 text-primary" />,
              step: '01',
              title: 'Get your itinerary',
              desc: 'Curated day plans built around Saint-Roch, Old Port, Petit-Champlain and beyond. No filler, no tourist traps.',
            },
            {
              icon: <Calendar className="w-7 h-7 text-primary" />,
              step: '02',
              title: 'Show up to a 5 à 7',
              desc: 'Monthly meetups hosted at the best local spots. Walk in, meet people, have a drink. First one is on us.',
            },
            {
              icon: <Star className="w-7 h-7 text-primary" />,
              step: '03',
              title: 'Unlock insider perks',
              desc: 'Skip-the-line access, secret menus, welcome cocktails. Real deals from real local venues — not ads.',
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="absolute -top-3 -left-2 text-6xl font-serif text-primary/10 select-none">{item.step}</div>
              <div className="relative space-y-3 pt-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                  {item.icon}
                </div>
                <h3 className="text-xl">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience previews */}
      <div className="bg-muted/30 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl mb-2">This week in Québec City</h2>
              <p className="text-muted-foreground">Curated plans ready to go</p>
            </div>
            <Link to="/signup" className="hidden md:flex items-center gap-2 text-sm text-primary hover:underline">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((h, i) => (
              <div key={i} className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer">
                <ImageWithFallback
                  src={h.image}
                  alt={h.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">{h.label}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-lg mb-1">{h.title}</h3>
                  <p className="text-white/70 text-sm">{h.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Membership CTA */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-14">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 md:items-center">
            <div className="flex-1 space-y-4">
              <p className="text-xs uppercase tracking-widest opacity-60">Club Membership</p>
              <h2 className="text-3xl md:text-4xl">Everything you need to explore Québec City right</h2>
              <ul className="space-y-2">
                {memberBenefits.map((b) => (
                  <li key={b.label} className="flex items-center gap-2 text-sm opacity-90">
                    <span>{b.icon}</span> {b.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0 text-center space-y-4">
              <div>
                <p className="text-5xl font-serif">$10</p>
                <p className="text-sm opacity-70">/month · or $100/year</p>
              </div>
              <Link
                to="/signup"
                className="inline-block bg-white text-primary px-8 py-3 rounded-2xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Join Club Horizon
              </Link>
              <p className="text-xs opacity-50">Cancel anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* B2B Partner Section */}
      <div className="bg-muted/30 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 md:items-center">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm">
                  <Building2 className="w-4 h-4" /> For Québec City Businesses
                </div>
                <h2 className="text-3xl md:text-4xl">Put your venue in front of people who actually show up</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Club Horizon members are engaged locals and young professionals who explore Québec City on purpose. Offering a perk puts your business directly in their hands — no ad spend, no algorithm.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {partnerTypes.map((t) => (
                    <div key={t.label} className="flex items-center gap-2 text-sm">
                      <span>{t.icon}</span>
                      <span className="text-muted-foreground">{t.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to="/business"
                    className="px-6 py-3 bg-secondary text-secondary-foreground rounded-2xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    Become a Perk Partner
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/business/login"
                    className="px-6 py-3 border border-border rounded-2xl text-sm hover:bg-muted/40 transition-colors flex items-center justify-center"
                  >
                    Business Sign In
                  </Link>
                </div>
              </div>

              <div className="flex-shrink-0 grid grid-cols-1 gap-4 w-full md:w-72">
                {[
                  { stat: 'Free', label: 'No cost to offer a perk' },
                  { stat: '5 à 7', label: 'Host your own member event' },
                  { stat: '100%', label: 'Local, engaged audience' },
                ].map((item) => (
                  <div key={item.label} className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-2xl font-serif text-secondary mb-1">{item.stat}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
