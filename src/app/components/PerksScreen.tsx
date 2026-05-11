import { Sparkles, Lock, MapPin, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SimpleFooter } from './SimpleFooter';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';

const STATIC_PERKS = [
  {
    id: 1,
    title: "Secret dessert menu unlocked",
    venue: "Café Névé",
    description: "Chef's private creations, not on the regular menu",
    image: "https://images.unsplash.com/photo-1774758959178-094de5122e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "Tonight only",
    unlocked: true,
    location: "Saint-Roch",
  },
  {
    id: 2,
    title: "First sip on us",
    venue: "Le Perché Rooftop",
    description: "Welcome cocktail for Xplora members",
    image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "This week",
    unlocked: true,
    location: "Downtown",
  },
  {
    id: 3,
    title: "Skip the line access",
    venue: "Musée National",
    description: "Walk right in, no waiting",
    image: "https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "Anytime",
    unlocked: true,
    location: "Old Quebec",
  },
  {
    id: 4,
    title: "Chef's table unlocked",
    venue: "Le Bistro Local",
    description: "Reserved seating and special tasting menu",
    image: "https://images.unsplash.com/photo-1758346970392-4e9e1031d58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "Weekends",
    unlocked: false,
    location: "Petit-Champlain",
    requirement: "Complete 2 experiences to unlock",
  },
  {
    id: 5,
    title: "Late night studio access",
    venue: "Art Collective Space",
    description: "Private viewings after hours",
    image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "Friday nights",
    unlocked: false,
    location: "Saint-Roch",
    requirement: "Attend 1 meetup to unlock",
  },
  {
    id: 6,
    title: "Rooftop sunrise sessions",
    venue: "Hidden Garden",
    description: "Morning yoga & coffee before the city wakes",
    image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "Saturdays",
    unlocked: false,
    location: "Old Port",
    requirement: "Complete 3 experiences to unlock",
  },
  {
    id: 7,
    title: "Tasting menu add-on",
    venue: "Chez Boulay",
    description: "Extra course reserved for Xplora members",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "Any evening",
    unlocked: false,
    location: "Old Quebec",
    requirement: "Complete 2 experiences to unlock",
  },
  {
    id: 8,
    title: "Free rental upgrade",
    venue: "Cyclo Vélo",
    description: "Electric bike upgrade at no extra charge",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "Weekdays",
    unlocked: false,
    location: "Saint-Roch",
    requirement: "Attend 1 meetup to unlock",
  },
  {
    id: 9,
    title: "Private tasting session",
    venue: "Distillerie Menaud",
    description: "Guided spirits tasting before doors open",
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: "Select Saturdays",
    unlocked: false,
    location: "Limoilou",
    requirement: "Complete 2 experiences to unlock",
  },
];

export function PerksScreen() {
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [authStatus, setAuthStatus] = useState<'loading' | 'member' | 'guest'>('loading');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [businessPerks, setBusinessPerks] = useState<any[]>([]);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const { data: bPerks } = await supabase
        .from('business_perks')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (bPerks) setBusinessPerks(bPerks);

      if (data.user) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', data.user.id)
          .eq('status', 'active')
          .maybeSingle();
        setIsSubscribed(!!sub);
        setAuthStatus('member');
      } else {
        setAuthStatus('guest');
      }
    });
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  async function handleBuyExperience(exp: any) {
    setBuyingId(exp.rawId);
    const { data: { user } } = await supabase.auth.getUser();
    const res = await fetch('/api/buy-experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceId: exp.rawId,
        userId: user?.id || '',
        customerEmail: user?.email || '',
        successUrl: `${window.location.origin}/home?booking=success`,
        cancelUrl: `${window.location.origin}/perks`,
      }),
    });
    const data = await res.json();
    setBuyingId(null);
    if (data.url) window.location.href = data.url;
  }

  // Merge business perks (all unlocked) with static perks
  const fromBusiness = businessPerks.map((p, i) => ({
    id: 1000 + i,
    rawId: p.id,
    title: p.title,
    venue: p.business_name,
    description: p.description,
    image: p.image_url || "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: p.timing,
    unlocked: true,
    location: p.location,
    type: p.type as 'free' | 'paid',
    price_cents: p.price_cents,
    spots_remaining: p.spots_remaining,
  }));

  const perks = [...fromBusiness, ...STATIC_PERKS.map(p => ({ ...p, type: 'free' as const, rawId: null, price_cents: null, spots_remaining: null }))];
  const unlockedPerks = perks.filter(p => p.unlocked);
  const lockedPerks = perks.filter(p => !p.unlocked);

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl mb-1">Xplora Perks</h1>
            <p className="text-sm md:text-base opacity-90">Insider access to places you won't find anywhere else</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex items-center justify-between max-w-2xl">
            <div>
              <p className="text-sm md:text-base opacity-90">Active</p>
              <p className="text-2xl md:text-3xl font-serif">{unlockedPerks.length}</p>
            </div>
            <div>
              <p className="text-sm md:text-base opacity-90">Coming Soon</p>
              <p className="text-2xl md:text-3xl font-serif">{lockedPerks.length}</p>
            </div>
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 opacity-50" />
          </div>
        </div>
      </div>

      {authStatus === 'guest' && (
        <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium mb-0.5">These perks are exclusive to members</p>
              <p className="text-sm text-muted-foreground">Join Xplora for $10/month and unlock all of this — plus new perks added every week.</p>
            </div>
            <button
              onClick={() => navigate('/membership')}
              className="shrink-0 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Become a member <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
        {unlockedPerks.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Ready for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {unlockedPerks.map((perk) => (
                <div
                  key={perk.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="relative h-40">
                    <ImageWithFallback
                      src={perk.image}
                      alt={perk.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">
                      {perk.timing}
                    </div>
                    <div className="absolute top-3 left-3 text-2xl group-hover:scale-110 transition-transform">
                      ✨
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base mb-0.5 group-hover:text-secondary transition-colors">{perk.title}</h3>
                    <p className="text-sm text-secondary mb-2">{perk.venue}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {perk.description}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {perk.location}
                      </div>
                      {perk.type === 'paid' && perk.rawId ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBuyExperience(perk); }}
                          disabled={buyingId === perk.rawId || perk.spots_remaining === 0}
                          className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {buyingId === perk.rawId ? '…' : perk.spots_remaining === 0 ? 'Sold out' : `Buy — $${((perk.price_cents || 0) / 100).toFixed(0)}`}
                        </button>
                      ) : isSubscribed ? (() => {
                        const inCart = items.some(i => i.id === `perk-${perk.id}`);
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!inCart) addItem({ id: `perk-${perk.id}`, name: perk.title, description: perk.venue, price: 0, image: perk.image, type: 'perk' });
                            }}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${inCart ? 'bg-green-100 text-green-700' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                          >
                            {inCart ? <><Check className="w-3.5 h-3.5" /> Added</> : <><ShoppingCart className="w-3.5 h-3.5" /> Add to cart</>}
                          </button>
                        );
                      })() : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {lockedPerks.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Unlock More</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {lockedPerks.map((perk) => (
                <div
                  key={perk.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border opacity-60 hover:opacity-75 transition-opacity"
                >
                  <div className="relative h-40">
                    <ImageWithFallback
                      src={perk.image}
                      alt={perk.title}
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs">
                      {perk.timing}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base mb-0.5">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{perk.venue}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {perk.description}
                    </p>
                    <div className="bg-muted rounded-lg p-3 text-xs text-center">
                      🔒 {perk.requirement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <SimpleFooter />
    </div>
  );
}
