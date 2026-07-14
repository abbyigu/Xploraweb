import { useState, useEffect } from 'react';
import { Ticket, Star, TrendingUp, Archive, Trash2, RotateCcw, Clock, MessageSquare, Check, X, Tag, Crown, DollarSign, MapPin, FileText, Users, Eye, EyeOff, ChevronDown, ChevronUp, Building2, Map } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminExperiencePanel } from './AdminExperiencePanel';
import { AdminSpotsPanel } from './AdminSpotsPanel';
import { AdminNeighbourhoodsPanel } from './AdminNeighbourhoodsPanel';
import { AdminSiteContentPanel } from './AdminSiteContentPanel';
import { experiences as staticExperiences } from '../data/products';

interface Stats {
  total: number;
  active: number;
  draft: number;
  free: number;
  paid: number;
  totalSpots: number;
  spotsTotal: number;
  partnerOffers: number;
  archived: number;
}

interface ArchivedExp {
  id: string;
  name: string;
  category: string;
  price_cents: number;
  archived_at: string;
}

interface PendingReview {
  id: string;
  experience_id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string | null;
  created_at: string;
  experience_name?: string;
}

interface AdminBusiness {
  id: string;
  business_name: string;
  name: string;
  email: string;
  stripe_connect_onboarded: boolean;
  created_at: string;
}

interface AdminPerk {
  id: string;
  business_id: string;
  business_name: string;
  title: string;
  type: 'free' | 'paid';
  price_cents: number | null;
  status: 'active' | 'paused';
  location: string;
  timing: string;
  created_at: string;
}

function daysLeft(archivedAt: string): number {
  const diff = Date.now() - new Date(archivedAt).getTime();
  const elapsed = diff / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(2 - elapsed));
}

export function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'outings' | 'spots' | 'neighbourhoods' | 'content' | 'archive' | 'reviews' | 'pricing' | 'businesses'>('outings');
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, draft: 0, free: 0, paid: 0, totalSpots: 0, spotsTotal: 0, partnerOffers: 0, archived: 0 });
  const [archived, setArchived] = useState<ArchivedExp[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [adminBusinesses, setAdminBusinesses] = useState<AdminBusiness[]>([]);
  const [adminPerks, setAdminPerks] = useState<AdminPerk[]>([]);
  const [adminXperiences, setAdminXperiences] = useState<AdminPerk[]>([]);
  const [adminExpanded, setAdminExpanded] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadStats(), loadArchived(), loadPendingReviews(), loadBusinesses()]).finally(() => setLoading(false));
  }, []);

  async function loadStats() {
    const [expRes, perksRes, spotsRes] = await Promise.all([
      supabase.from('xplora_experiences').select('status, price_cents, spots'),
      supabase.from('business_perks').select('id', { count: 'exact', head: true }),
      supabase.from('xplora_spots').select('id', { count: 'exact', head: true }),
    ]);
    const exps = expRes.data || [];
    setStats({
      total: exps.filter(e => e.status !== 'archived').length,
      active: exps.filter(e => e.status === 'active').length,
      draft: exps.filter(e => e.status === 'draft').length,
      free: exps.filter(e => e.status !== 'archived' && (!e.price_cents || e.price_cents === 0)).length,
      paid: exps.filter(e => e.status !== 'archived' && e.price_cents && e.price_cents > 0).length,
      totalSpots: exps.filter(e => e.status !== 'archived').reduce((sum, e) => sum + (e.spots || 0), 0),
      spotsTotal: spotsRes.count || 0,
      partnerOffers: perksRes.count || 0,
      archived: exps.filter(e => e.status === 'archived').length,
    });
  }

  async function loadArchived() {
    const { data } = await supabase
      .from('xplora_experiences')
      .select('id, name, category, price_cents, archived_at')
      .eq('status', 'archived')
      .order('archived_at', { ascending: true });
    if (data) setArchived(data);
  }

  async function loadPendingReviews() {
    const { data: reviews } = await supabase
      .from('experience_reviews')
      .select('id, experience_id, rating, comment, reviewer_name, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (!reviews || reviews.length === 0) { setPendingReviews([]); return; }

    const expIds = [...new Set(reviews.map(r => r.experience_id))];
    const { data: exps } = await supabase
      .from('xplora_experiences')
      .select('id, name')
      .in('id', expIds);

    const expMap = Object.fromEntries((exps || []).map(e => [e.id, e.name]));
    setPendingReviews(reviews.map(r => ({ ...r, experience_name: expMap[r.experience_id] || r.experience_id })));
  }

  async function loadBusinesses() {
    const [bizRes, allPerksRes, xperiencesRes] = await Promise.all([
      supabase.from('profiles').select('id, business_name, name, email, stripe_connect_onboarded, created_at').eq('account_type', 'business').order('created_at', { ascending: false }),
      supabase.from('business_perks').select('id, business_id, business_name, title, type, price_cents, status, location, timing, created_at').neq('type', 'xplora_experience').order('created_at', { ascending: false }),
      supabase.from('business_perks').select('id, business_id, business_name, title, type, price_cents, status, location, timing, created_at').eq('type', 'xplora_experience').order('created_at', { ascending: false }),
    ]);
    if (bizRes.data) setAdminBusinesses(bizRes.data);
    if (allPerksRes.data) setAdminPerks(allPerksRes.data);
    if (xperiencesRes.data) setAdminXperiences(xperiencesRes.data);
  }

  async function handleApprove(id: string) {
    await supabase.from('experience_reviews').update({ status: 'approved' }).eq('id', id);
    setPendingReviews(prev => prev.filter(r => r.id !== id));
  }

  async function handleReject(id: string) {
    await supabase.from('experience_reviews').update({ status: 'rejected' }).eq('id', id);
    setPendingReviews(prev => prev.filter(r => r.id !== id));
  }

  async function handleRestore(id: string) {
    await supabase.from('xplora_experiences').update({ status: 'draft', archived_at: null }).eq('id', id);
    await Promise.all([loadArchived(), loadStats()]);
  }

  async function handleDeleteNow(id: string) {
    if (!confirm('Permanently delete this experience?')) return;
    await supabase.from('xplora_experiences').delete().eq('id', id);
    await Promise.all([loadArchived(), loadStats()]);
  }

  async function adminTogglePerk(perk: AdminPerk) {
    const next = perk.status === 'active' ? 'paused' : 'active';
    await supabase.from('business_perks').update({ status: next }).eq('id', perk.id);
    setAdminPerks(p => p.map(x => x.id === perk.id ? { ...x, status: next } : x));
    setAdminXperiences(p => p.map(x => x.id === perk.id ? { ...x, status: next } : x));
  }

  async function adminDeletePerk(id: string) {
    if (!confirm('Delete this permanently?')) return;
    await supabase.from('business_perks').delete().eq('id', id);
    setAdminPerks(p => p.filter(x => x.id !== id));
    setAdminXperiences(p => p.filter(x => x.id !== id));
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div>
        <h2 className="text-xl mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Star className="w-5 h-5 text-primary" />} value={stats.total} label="Total experiences" />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-green-500" />} value={stats.active} label="Live" sub={`${stats.draft} draft`} />
          <StatCard icon={<Ticket className="w-5 h-5 text-secondary" />} value={stats.paid} label="Paid" sub={`${stats.free} free`} />
          <StatCard icon={<Archive className="w-5 h-5 text-amber-500" />} value={stats.archived} label="Archived" sub="auto-deletes in 2 days" />
          <StatCard icon={<MapPin className="w-5 h-5 text-secondary" />} value={stats.spotsTotal} label="Total spots" />
          <StatCard icon={<Building2 className="w-5 h-5 text-secondary" />} value={adminBusinesses.length} label="Business partners" />
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Tabs */}
      <div>
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('outings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'outings' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Outings
          </button>
          <button
            onClick={() => setActiveTab('spots')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'spots' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Spots
          </button>
          <button
            onClick={() => setActiveTab('neighbourhoods')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'neighbourhoods' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Neighbourhoods
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'businesses' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Users className="w-3.5 h-3.5" />
            Businesses
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'content' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Site Content
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reviews
            {pendingReviews.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">{pendingReviews.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'archive' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
            {stats.archived > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{stats.archived}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'pricing' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Tag className="w-3.5 h-3.5" />
            Pricing
          </button>
        </div>

        {activeTab === 'outings' && (
          <AdminExperiencePanel onStatsChange={loadStats} />
        )}

        {activeTab === 'spots' && (
          <AdminSpotsPanel />
        )}

        {activeTab === 'neighbourhoods' && (
          <AdminNeighbourhoodsPanel />
        )}

        {activeTab === 'content' && (
          <AdminSiteContentPanel />
        )}

        {activeTab === 'businesses' && (
          <div className="space-y-8">
            {/* Xplora Xperiences published by businesses */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-medium">Xplora Xperiences ({adminXperiences.length})</h3>
              </div>
              {adminXperiences.length === 0 ? (
                <p className="text-sm text-muted-foreground">No Xplora Xperiences yet.</p>
              ) : (
                <div className="space-y-2">
                  {adminXperiences.map(xp => (
                    <div key={xp.id} className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{xp.title}</p>
                        <p className="text-xs text-muted-foreground">{xp.timing} · {xp.category || xp.location} · {xp.price_cents ? `$${(xp.price_cents / 100).toFixed(0)}` : 'Free'}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${xp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                          {xp.status === 'active' ? 'Live' : 'Paused'}
                        </span>
                        <button onClick={() => adminTogglePerk(xp)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          {xp.status === 'active' ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
                        </button>
                        <button onClick={() => adminDeletePerk(xp.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All businesses */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-medium">Business Partners ({adminBusinesses.length})</h3>
              </div>
              {adminBusinesses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No business accounts yet.</p>
              ) : (
                <div className="space-y-2">
                  {adminBusinesses.map(biz => {
                    const bizPerks = adminPerks.filter(p => p.business_id === biz.id);
                    const isOpen = adminExpanded === biz.id;
                    return (
                      <div key={biz.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                        <button
                          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                          onClick={() => setAdminExpanded(isOpen ? null : biz.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">{biz.business_name || biz.name}</p>
                              {biz.stripe_connect_onboarded && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Stripe connected</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{biz.email} · {bizPerks.length} offer{bizPerks.length !== 1 ? 's' : ''}</p>
                          </div>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                        </button>

                        {isOpen && (
                          <div className="border-t border-border px-5 py-4 space-y-2 bg-muted/10">
                            {bizPerks.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No offers published.</p>
                            ) : (
                              bizPerks.map(perk => (
                                <div key={perk.id} className="flex items-center justify-between gap-3 bg-card rounded-xl px-4 py-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{perk.title}</p>
                                    <p className="text-xs text-muted-foreground">{perk.location} · {perk.timing} · {perk.type === 'paid' ? `$${((perk.price_cents || 0) / 100).toFixed(0)}` : 'Free'}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${perk.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                      {perk.status === 'active' ? 'Live' : 'Paused'}
                                    </span>
                                    <button onClick={() => adminTogglePerk(perk)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title={perk.status === 'active' ? 'Pause' : 'Activate'}>
                                      {perk.status === 'active' ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
                                    </button>
                                    <button onClick={() => adminDeletePerk(perk.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg">Pending Reviews</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Reviews with 3 stars or below require approval before going live.</p>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No reviews pending approval.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviews.map(review => (
                  <div key={review.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${review.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{review.reviewer_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {review.experience_name} · {new Date(review.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {review.comment ? (
                          <p className="text-sm text-foreground leading-relaxed">"{review.comment}"</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No comment left.</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pricing' && <PricingPanel />}

        {activeTab === 'archive' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg">Archive</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Archived experiences are permanently deleted after 2 days.</p>
            </div>

            {archived.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
                <Archive className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nothing in the archive.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {archived.map(exp => {
                  const days = daysLeft(exp.archived_at);
                  return (
                    <div key={exp.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{exp.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {exp.price_cents === 0 ? 'Free' : `$${(exp.price_cents / 100).toFixed(0)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${days <= 0 ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          <Clock className="w-3 h-3" />
                          {days <= 0 ? 'Deletes tonight' : `${days}d left`}
                        </div>
                        <button onClick={() => handleRestore(exp.id)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary" title="Restore to draft">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteNow(exp.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500" title="Delete now">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PricingPanel() {
  const paid = staticExperiences.filter(e => e.type === 'experience' && e.price > 0);
  const free = staticExperiences.filter(e => e.type === 'experience' && e.price === 0);
  const avgPrice = paid.length ? Math.round(paid.reduce((s, e) => s + e.price, 0) / paid.length) : 0;
  const minPrice = paid.length ? Math.min(...paid.map(e => e.price)) : 0;
  const maxPrice = paid.length ? Math.max(...paid.map(e => e.price)) : 0;
  const memberMonthly = 1000; // $10/month in cents

  const [deals, setDeals] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('xplora_deals') || '[]'); } catch { return []; }
  });

  const toggleDeal = (id: string) => {
    const next = deals.includes(id) ? deals.filter(d => d !== id) : [...deals, id];
    setDeals(next);
    localStorage.setItem('xplora_deals', JSON.stringify(next));
  };

  const memberPrice = (cents: number) => Math.round(cents * 0.75 / 100);
  const savingsAt = (bookings: number) => Math.round((avgPrice * 0.25 * bookings) / 100);

  const CATEGORY_LABEL: Record<string, string> = {
    xplorators: 'Solo', xploratorsplus: 'Solo+', xploratours: 'Tours', xploranights: 'Nights',
  };

  return (
    <div className="space-y-8">
      {/* Stats overview */}
      <div>
        <h3 className="text-lg mb-4">Pricing overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Free experiences</p>
            <p className="text-3xl font-serif text-green-600">{free.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg. paid price</p>
            <p className="text-3xl font-serif">${(avgPrice / 100).toFixed(0)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Price range</p>
            <p className="text-2xl font-serif">${(minPrice / 100).toFixed(0)}–${(maxPrice / 100).toFixed(0)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Member break-even</p>
            <p className="text-3xl font-serif">{Math.ceil(memberMonthly / (avgPrice * 0.25))}×</p>
            <p className="text-xs text-muted-foreground mt-0.5">bookings to save $10</p>
          </div>
        </div>
      </div>

      {/* Member pricing summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-medium">Member discount (25% off all paid experiences)</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">{n} booking{n > 1 ? 's' : ''}/month</p>
              <p className={`text-lg font-semibold mt-0.5 ${savingsAt(n) >= 10 ? 'text-green-600' : 'text-foreground'}`}>
                {savingsAt(n) >= 10 ? `+$${savingsAt(n) - 10} net` : savingsAt(n) === 10 ? 'Break-even' : `-$${10 - savingsAt(n)}`}
              </p>
              <p className="text-xs text-muted-foreground">saves ${savingsAt(n)}, costs $10</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deals management */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg">Deals</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toggled deals show a "Deal" badge on listing cards. Stored locally — connect Supabase to persist.
            </p>
          </div>
          {deals.length > 0 && (
            <span className="bg-secondary/20 text-secondary text-xs px-2.5 py-1 rounded-full font-medium">
              {deals.length} active
            </span>
          )}
        </div>

        <div className="space-y-2">
          {paid.map(exp => {
            const isDeal = deals.includes(exp.id);
            return (
              <div key={exp.id} className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${isDeal ? 'bg-secondary/5 border-secondary/30' : 'bg-card border-border'}`}>
                <img src={exp.image} alt={exp.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{exp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.category ? CATEGORY_LABEL[exp.category] : '—'} ·{' '}
                    <span className="font-medium text-foreground">${(exp.price / 100).toFixed(0)}</span>
                    <span className="mx-1.5 text-muted-foreground/40">→</span>
                    <span className="text-primary">Members ${memberPrice(exp.price)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isDeal && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-secondary font-medium">
                      <Tag className="w-3 h-3" /> Deal active
                    </span>
                  )}
                  <button
                    onClick={() => toggleDeal(exp.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${isDeal ? 'bg-secondary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDeal ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Free experiences list */}
      <div>
        <h3 className="text-lg mb-3">Free experiences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {free.map(exp => (
            <div key={exp.id} className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-3">
              <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{exp.name}</p>
                <p className="text-xs text-muted-foreground">{exp.category ? CATEGORY_LABEL[exp.category] : '—'} · {exp.neighbourhood || 'No location'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, sub }: { icon: React.ReactNode; value: number; label: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-3xl font-serif">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}
