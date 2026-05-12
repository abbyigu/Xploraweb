import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LayoutDashboard, LogOut, Users, Ticket, Star, TrendingUp, Archive, Trash2, RotateCcw, Clock, MessageSquare, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { XploraLogo } from './XploraLogo';
import { AdminExperiencePanel } from './AdminExperiencePanel';
import { SimpleFooter } from './SimpleFooter';

const ADMIN_EMAIL = 'ariel.blouin@live.ca';

interface Stats {
  total: number;
  active: number;
  draft: number;
  free: number;
  paid: number;
  totalSpots: number;
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

function daysLeft(archivedAt: string): number {
  const diff = Date.now() - new Date(archivedAt).getTime();
  const elapsed = diff / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(2 - elapsed));
}

export function AdminDashboardScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [detectedEmail, setDetectedEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'experiences' | 'archive' | 'reviews'>('experiences');
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, draft: 0, free: 0, paid: 0, totalSpots: 0, partnerOffers: 0, archived: 0 });
  const [archived, setArchived] = useState<ArchivedExp[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data: profile } = await supabase.from('profiles').select('is_admin, name, email').eq('id', user.id).single();
        setDetectedEmail(user.email ?? 'unknown');
        if (!profile?.is_admin) { setLoading(false); return; }
        setAuthorized(true);
        setAdminName(user.email ?? '');
        await Promise.all([loadStats(), loadArchived(), loadPendingReviews()]);
      } catch (e) {
        console.error('Admin init error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function loadStats() {
    const [expRes, perksRes] = await Promise.all([
      supabase.from('xplora_experiences').select('status, price_cents, spots'),
      supabase.from('business_perks').select('id', { count: 'exact', head: true }),
    ]);
    const exps = expRes.data || [];
    setStats({
      total: exps.filter(e => e.status !== 'archived').length,
      active: exps.filter(e => e.status === 'active').length,
      draft: exps.filter(e => e.status === 'draft').length,
      free: exps.filter(e => e.status !== 'archived' && (!e.price_cents || e.price_cents === 0)).length,
      paid: exps.filter(e => e.status !== 'archived' && e.price_cents && e.price_cents > 0).length,
      totalSpots: exps.filter(e => e.status !== 'archived').reduce((sum, e) => sum + (e.spots || 0), 0),
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

    // Fetch experience names
    const expIds = [...new Set(reviews.map(r => r.experience_id))];
    const { data: exps } = await supabase
      .from('xplora_experiences')
      .select('id, name')
      .in('id', expIds);

    const expMap = Object.fromEntries((exps || []).map(e => [e.id, e.name]));
    setPendingReviews(reviews.map(r => ({ ...r, experience_name: expMap[r.experience_id] || r.experience_id })));
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading admin dashboard…</p>
    </div>
  );

  if (!authorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-center px-6">
      <p className="text-muted-foreground text-sm">Not authorized.</p>
      <p className="text-xs text-muted-foreground">Logged in as: <span className="font-mono text-foreground">{detectedEmail ?? '…'}</span></p>
      <p className="text-xs text-muted-foreground">Expected: <span className="font-mono text-foreground">{ADMIN_EMAIL}</span></p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XploraLogo variant="icon" className="h-8 w-8" />
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <LayoutDashboard className="w-3 h-3" /> Admin Dashboard
              </p>
              <p className="text-sm font-medium">{adminName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div>
          <h2 className="text-xl mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Star className="w-5 h-5 text-primary" />} value={stats.total} label="Total experiences" />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-green-500" />} value={stats.active} label="Live" sub={`${stats.draft} draft`} />
            <StatCard icon={<Ticket className="w-5 h-5 text-secondary" />} value={stats.paid} label="Paid" sub={`${stats.free} free`} />
            <StatCard icon={<Archive className="w-5 h-5 text-amber-500" />} value={stats.archived} label="Archived" sub="auto-deletes in 2 days" />
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Tabs */}
        <div>
          <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit mb-6">
            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'experiences' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Experiences
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
          </div>

          {activeTab === 'experiences' && (
            <AdminExperiencePanel onStatsChange={loadStats} />
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
      <SimpleFooter />
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
