import { Sparkles, Lock, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SimpleFooter } from './SimpleFooter';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router';

function Paywall() {
  const navigate = useNavigate();
  const previewPerks = [
    { title: "Secret dessert menu unlocked", venue: "Café Névé", image: "https://images.unsplash.com/photo-1774758959178-094de5122e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "First sip on us", venue: "Le Perché Rooftop", image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "Skip the line access", venue: "Musée National", image: "https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">Xplora Perks</h1>
          <p className="text-sm opacity-90">Insider access to places you won't find anywhere else</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 relative">
        {/* Blurred preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 blur-sm pointer-events-none select-none">
          {previewPerks.map((perk, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
              <div className="h-40 overflow-hidden">
                <img src={perk.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-base mb-1">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.venue}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Paywall overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mx-6 max-w-sm w-full text-center border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl mb-2">Members Only</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Xplora Perks are exclusive to members. Join to unlock insider access to hidden menus, skip-the-line passes, and more.
            </p>
            <button onClick={() => navigate('/membership')} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity mb-3">
              Join — $10/month
            </button>
            <button onClick={() => navigate('/login')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Already a member? Log in
            </button>
          </div>
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
}

export function PerksScreen() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'member' | 'guest'>('loading');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthStatus(data.user ? 'member' : 'guest');
    });
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (authStatus === 'guest') return <Paywall />;

  const perks = [
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
  ];

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
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {perk.location}
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
