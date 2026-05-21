import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Calendar, Star, Building2, Play, X } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Footer } from './Footer';
import { supabase } from '../lib/supabase';

const AVATAR_SEEDS = ['Alex', 'Béa', 'Cam', 'Dana'];

export function LandingPage() {
  const [explorerCount, setExplorerCount] = useState<number | null>(null);
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setExplorerCount(count); });
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('hiw_fab_dismissed')) return;
    const timer = setTimeout(() => setShowFab(true), 8000);
    return () => clearTimeout(timer);
  }, []);

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
            <XploraLogo variant="full" className="h-36 md:h-52" />

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest opacity-60">Xplora — Québec City</p>
              <h1 className="text-3xl md:text-5xl leading-tight">
                Your guide to the best<br />of Québec City
              </h1>
              <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto">
                Curated experiences, insider perks, and local events — whether you're visiting for a weekend or calling Québec City home.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <button
                onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Explore Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                to="/how-it-works"
                className="px-8 py-4 bg-white/40 backdrop-blur-sm text-foreground rounded-2xl text-base hover:bg-white/50 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                See how it works
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm pt-2">
              <span className="text-yellow-500 tracking-wide">★★★★★</span>
              <span className="opacity-80">4.9 · Free cancellation · 48h</span>
              <span className="opacity-40">|</span>
              <span className="opacity-70">1,200+ guests hosted</span>
            </div>

            <Link to="/login" className="text-sm opacity-60 hover:opacity-80 transition-opacity underline underline-offset-2 pt-1">
              Already a member? Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Explorer count banner */}
      <div className="bg-[#12343B] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {AVATAR_SEEDS.map((seed) => (
              <div
                key={seed}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold border-2 border-[#12343B]"
              >
                {seed[0]}
              </div>
            ))}
          </div>
          <p className="text-sm text-white/90">
            Join{' '}
            <span className="font-semibold text-white">
              {explorerCount !== null ? `${explorerCount.toLocaleString()}+` : '...'}
            </span>{' '}
            explorers discovering Québec City
          </p>
        </div>
      </div>

      {/* How it works — thin strip directly below fold */}
      <div className="border-t-4 border-primary bg-card">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary whitespace-nowrap hidden md:block">
              How it works
            </span>
            {[
              { n: 1, title: 'Pick your vibe', desc: 'Tell us your mood & neighbourhood' },
              { n: 2, title: 'Book in seconds', desc: 'Instant confirmation, free cancellation' },
              { n: 3, title: 'Show up & explore', desc: 'Your guide handles everything else' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-3 flex-1">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {n}
                </div>
                <div>
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
            <Link
              to="/how-it-works"
              className="text-sm text-primary font-semibold hover:underline whitespace-nowrap md:ml-auto"
            >
              See full details →
            </Link>
          </div>
        </div>
      </div>

      {/* How it works — full section */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-3">Stop searching. Start exploring.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">No more generic Google searches. Xplora is your insider guide to Québec City's trendy spots — curated by people who actually know the city.</p>
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
      <div id="experiences" className="bg-muted/30 py-16 md:py-24">
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
                  Xplora reaches locals who explore their city on purpose and visitors who want to experience it like an insider. Offering a perk puts your business in front of people who are actively looking for it — no ad spend, no algorithm.
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
                  { stat: 'Real', label: 'Local, engaged audience' },
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

      {/* Floating "How it works" FAB — appears after 8s on first visit */}
      {showFab && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <Link
            to="/how-it-works"
            className="flex items-center gap-2 bg-[#12343B] text-white px-5 py-3 rounded-full shadow-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
            New here? Learn how it works
          </Link>
          <button
            onClick={() => {
              setShowFab(false);
              sessionStorage.setItem('hiw_fab_dismissed', '1');
            }}
            aria-label="Dismiss"
            className="w-6 h-6 rounded-full bg-white text-foreground shadow border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
