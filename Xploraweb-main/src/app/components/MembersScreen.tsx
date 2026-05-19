import { useState, useEffect } from 'react';
import { Sparkles, Lock, MapPin, Clock, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SimpleFooter } from './SimpleFooter';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';

// ─── Paywall (shown when not logged in) ──────────────────────────────────────

function Paywall() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const previewPerks = [
    { title: "Secret dessert menu unlocked", venue: "Café Névé", image: "https://images.unsplash.com/photo-1774758959178-094de5122e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "First sip on us", venue: "Le Perché Rooftop", image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
    { title: "Skip the line access", venue: "Musée National", image: "https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO
        title="Xplora Members — Exclusive Québec City Perks & Experiences"
        description="Unlock exclusive perks and insider access across Québec City. Xplora members get discounts, free drinks, skip-the-line privileges, and more at the best local venues."
        canonical="/members"
      />
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">{t('members.sectionTitle')}</h1>
          <p className="text-sm opacity-90">{t('members.sectionSubtitle')}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 relative">
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mx-6 max-w-sm w-full text-center border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl mb-2">{t('members.title')}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('members.subtitle')}
            </p>
            <button onClick={() => navigate('/membership')} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity mb-3">
              {t('members.join')}
            </button>
            <button onClick={() => navigate('/login')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('members.alreadyMember')}
            </button>
          </div>
        </div>
      </div>
      <SimpleFooter />
    </div>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────

const STATIC_PERKS = [
  { id: 1, title: "Secret dessert menu unlocked", venue: "Café Névé", description: "Chef's private creations, not on the regular menu", image: "https://images.unsplash.com/photo-1774758959178-094de5122e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", timing: "Tonight only", unlocked: true, location: "Saint-Roch" },
  { id: 2, title: "First sip on us", venue: "Le Perché Rooftop", description: "Welcome cocktail for Xplora members", image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", timing: "This week", unlocked: true, location: "Downtown" },
  { id: 3, title: "Skip the line access", venue: "Musée National", description: "Walk right in, no waiting", image: "https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", timing: "Anytime", unlocked: true, location: "Old Quebec" },
  { id: 4, title: "Chef's table unlocked", venue: "Le Bistro Local", description: "Reserved seating and special tasting menu", image: "https://images.unsplash.com/photo-1758346970392-4e9e1031d58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", timing: "Weekends", unlocked: false, location: "Petit-Champlain", requirement: "Complete 2 experiences to unlock" },
  { id: 5, title: "Late night studio access", venue: "Art Collective Space", description: "Private viewings after hours", image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", timing: "Friday nights", unlocked: false, location: "Saint-Roch", requirement: "Attend 1 meetup to unlock" },
  { id: 6, title: "Rooftop sunrise sessions", venue: "Hidden Garden", description: "Morning yoga & coffee before the city wakes", image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", timing: "Saturdays", unlocked: false, location: "Old Port", requirement: "Complete 3 experiences to unlock" },
];

const MEETUPS = [
  { id: 1, title: "Tonight 6–8pm — Chill 5à7 @ Le Perché", description: "First drink perk included", time: "Tonight, 6:00 PM", urgency: "happening soon", attendees: 12, maxAttendees: 15, location: "Le Perché", image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", host: "Alex + 4 regulars" },
  { id: 2, title: "Right now — Coffee crew @ Café Névé", description: "We're here until noon, join anytime", time: "Now until 12pm", urgency: "live now", attendees: 6, maxAttendees: 10, location: "Café Névé", image: "https://images.unsplash.com/photo-1774758959178-094de5122e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", host: "Marie + friends" },
  { id: 3, title: "Tomorrow 2pm — Street art walk", description: "Thomas knows all the hidden spots", time: "Sat 2:00 PM", urgency: "tomorrow", attendees: 6, maxAttendees: 10, location: "Starting at Café Névé", image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", host: "Thomas B." },
  { id: 4, title: "Saturday 7pm — Wine & conversation", description: "Small group, good wine, no pressure", time: "Sat 7:00 PM", urgency: "this weekend", attendees: 8, maxAttendees: 12, location: "Petit-Champlain Wine Bar", image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", host: "Sophie M." },
  { id: 5, title: "Sunday 9:30am — Yoga then brunch", description: "Riverside flow + food after", time: "Sun 9:30 AM", urgency: "this weekend", attendees: 8, maxAttendees: 15, location: "Old Port riverside", image: "https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", host: "Emma R." },
  { id: 6, title: "Sunday 5pm — Golden hour photo walk", description: "Bring a camera (phone is fine)", time: "Sun 5:00 PM", urgency: "this weekend", attendees: 4, maxAttendees: 8, location: "Dufferin Terrace", image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600", host: "Lucas P." },
];

// ─── Main screen ──────────────────────────────────────────────────────────────

export function MembersScreen() {
  const { t } = useTranslation();
  const [authStatus, setAuthStatus] = useState<'loading' | 'member' | 'guest'>('loading');
  const [businessPerks, setBusinessPerks] = useState<any[]>([]);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'perks' | 'social'>('perks');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { setAuthStatus('guest'); return; }
      const { data: bPerks } = await supabase
        .from('business_perks').select('*').eq('status', 'active').order('created_at', { ascending: false });
      if (bPerks) setBusinessPerks(bPerks);
      setAuthStatus('member');
    });
  }, []);

  if (authStatus === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  }

  if (authStatus === 'guest') return <Paywall />;

  async function handleBuyExperience(exp: any) {
    setBuyingId(exp.rawId);
    const { data: { user } } = await supabase.auth.getUser();
    const res = await fetch('/api/buy-experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experienceId: exp.rawId, userId: user?.id || '', customerEmail: user?.email || '', successUrl: `${window.location.origin}/members?booking=success`, cancelUrl: `${window.location.origin}/members` }),
    });
    const data = await res.json();
    setBuyingId(null);
    if (data.url) window.location.href = data.url;
  }

  const fromBusiness = businessPerks.map((p, i) => ({
    id: 1000 + i, rawId: p.id, title: p.title, venue: p.business_name, description: p.description,
    image: p.image_url || "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    timing: p.timing, unlocked: true, location: p.location, type: p.type as 'free' | 'paid', price_cents: p.price_cents, spots_remaining: p.spots_remaining,
  }));

  const allPerks = [...fromBusiness, ...STATIC_PERKS.map(p => ({ ...p, type: 'free' as const, rawId: null as string | null, price_cents: null as number | null, spots_remaining: null as number | null }))];
  const unlockedPerks = allPerks.filter(p => p.unlocked);
  const lockedPerks = allPerks.filter(p => !p.unlocked);

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">{t('members.sectionTitle')}</h1>
          <p className="text-sm md:text-base opacity-90 mb-5">{t('members.sectionSubtitle')}</p>

          <div className="flex gap-2">
            <button
              onClick={() => setTab('perks')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'perks' ? 'bg-white text-foreground shadow-sm' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> {t('members.perks')}
            </button>
            <button
              onClick={() => setTab('social')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'social' ? 'bg-white text-foreground shadow-sm' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <Users className="w-3.5 h-3.5" /> {t('members.social')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8">

        {/* ── Perks tab ── */}
        {tab === 'perks' && (
          <div className="space-y-8 md:space-y-12">
            {/* Stats */}
            <div className="bg-card border border-border rounded-2xl p-4 md:p-6 flex items-center justify-between max-w-sm">
              <div>
                <p className="text-sm text-muted-foreground">{t('members.ready')}</p>
                <p className="text-2xl md:text-3xl font-serif">{unlockedPerks.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('members.unlock')}</p>
                <p className="text-2xl md:text-3xl font-serif">{lockedPerks.length}</p>
              </div>
              <Sparkles className="w-9 h-9 text-primary/30" />
            </div>

            {unlockedPerks.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl mb-4 md:mb-6">{t('members.ready')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {unlockedPerks.map(perk => (
                    <div key={perk.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group">
                      <div className="relative h-40">
                        <ImageWithFallback src={perk.image} alt={perk.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs">{perk.timing}</div>
                        <div className="absolute top-3 left-3 text-2xl group-hover:scale-110 transition-transform">✨</div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-base mb-0.5 group-hover:text-secondary transition-colors">{perk.title}</h3>
                        <p className="text-sm text-secondary mb-2">{perk.venue}</p>
                        <p className="text-sm text-muted-foreground mb-3">{perk.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />{perk.location}
                          </div>
                          {perk.type === 'paid' && perk.rawId && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleBuyExperience(perk); }}
                              disabled={buyingId === perk.rawId || perk.spots_remaining === 0}
                              className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {buyingId === perk.rawId ? '…' : perk.spots_remaining === 0 ? 'Sold out' : `Buy — $${((perk.price_cents || 0) / 100).toFixed(0)}`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {lockedPerks.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl mb-4 md:mb-6">{t('members.unlock')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {lockedPerks.map(perk => (
                    <div key={perk.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border opacity-60 hover:opacity-75 transition-opacity">
                      <div className="relative h-40">
                        <ImageWithFallback src={perk.image} alt={perk.title} className="w-full h-full object-cover grayscale" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-xs">{perk.timing}</div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-base mb-0.5">{perk.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{perk.venue}</p>
                        <p className="text-sm text-muted-foreground mb-3">{perk.description}</p>
                        {'requirement' in perk && perk.requirement && (
                          <div className="bg-muted rounded-lg p-3 text-xs text-center">🔒 {perk.requirement}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── Social tab ── */}
        {tab === 'social' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl mb-1">{t('members.happeningNow')}</h2>
              <p className="text-sm text-muted-foreground">{t('meetups.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {MEETUPS.map(meetup => (
                <div key={meetup.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative h-40">
                    <ImageWithFallback src={meetup.image} alt={meetup.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-medium">{meetup.urgency}</div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />{meetup.attendees} {t('meetups.going')}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base mb-1 leading-snug">{meetup.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{meetup.description}</p>
                    <div className="space-y-1.5 text-sm mb-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-4 h-4" />{meetup.location}
                      </div>
                      <div className="text-xs text-muted-foreground">{meetup.host}</div>
                    </div>
                    <button className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity font-medium">
                      {t('meetups.imIn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <SimpleFooter />
    </div>
  );
}
