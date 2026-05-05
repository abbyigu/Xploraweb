import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, LogOut, Trash2, Eye, EyeOff, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { XploraLogo } from './XploraLogo';

interface BusinessPerk {
  id: string;
  title: string;
  description: string;
  offer: string;
  category: string;
  timing: string;
  image_url: string;
  location: string;
  status: 'active' | 'paused';
  created_at: string;
}

interface Profile {
  business_name: string;
  name: string;
}

const CATEGORIES = ['Tonight only', 'This week', 'Weekends', 'Anytime'];
const TIMINGS = ['Tonight only', 'This week', 'Weekends', 'Friday nights', 'Saturdays', 'Anytime'];

const EMPTY_FORM = {
  title: '',
  description: '',
  offer: '',
  category: 'Anytime',
  timing: 'Anytime',
  image_url: '',
  location: '',
};

export function BusinessDashboardScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [perks, setPerks] = useState<BusinessPerk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/business/login');
      return;
    }

    const [profileRes, perksRes] = await Promise.all([
      supabase.from('profiles').select('business_name, name').eq('id', user.id).single(),
      supabase.from('business_perks').select('*').eq('business_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (perksRes.data) setPerks(perksRes.data);
    setLoading(false);
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase.from('business_perks').insert({
      business_id: user.id,
      business_name: profile?.business_name || '',
      title: form.title,
      description: form.description,
      offer: form.offer,
      category: form.category,
      timing: form.timing,
      image_url: form.image_url || null,
      location: form.location,
      status: 'active',
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setForm(EMPTY_FORM);
    setShowForm(false);
    setSubmitting(false);
    await loadData();
  }

  async function toggleStatus(perk: BusinessPerk) {
    const next = perk.status === 'active' ? 'paused' : 'active';
    await supabase.from('business_perks').update({ status: next }).eq('id', perk.id);
    setPerks((p) => p.map((x) => x.id === perk.id ? { ...x, status: next } : x));
  }

  async function deletePerk(id: string) {
    if (!confirm('Remove this perk?')) return;
    await supabase.from('business_perks').delete().eq('id', id);
    setPerks((p) => p.filter((x) => x.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/business');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XploraLogo variant="icon" className="h-8 w-8" />
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> Partner Dashboard</p>
              <p className="text-sm font-medium">{profile?.business_name || 'Your Business'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-3xl font-serif">{perks.filter(p => p.status === 'active').length}</p>
            <p className="text-sm text-muted-foreground mt-1">Active perks</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-3xl font-serif">{perks.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total submitted</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 col-span-2 md:col-span-1">
            <p className="text-3xl font-serif">Live</p>
            <p className="text-sm text-muted-foreground mt-1">Perks go live instantly</p>
          </div>
        </div>

        {/* Add perk */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Your Perks</h2>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Cancel' : 'Add Perk'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4">
              <h3 className="text-base font-medium">New Perk</h3>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5">Perk Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={set('title')}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="First drink on us"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Offer / Discount</label>
                  <input
                    type="text"
                    value={form.offer}
                    onChange={set('offer')}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="e.g. Free welcome cocktail"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  rows={2}
                  placeholder="What members will experience"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={set('category')}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Timing</label>
                  <select
                    value={form.timing}
                    onChange={set('timing')}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                  >
                    {TIMINGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Neighbourhood</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={set('location')}
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Saint-Roch"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1.5">Image URL <span className="text-muted-foreground">(optional)</span></label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={set('image_url')}
                  className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="https://…"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? 'Publishing…' : 'Publish Perk'}
              </button>
            </form>
          )}

          {/* Perk list */}
          {perks.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
              <p className="text-muted-foreground text-sm">No perks yet. Add your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {perks.map((perk) => (
                <div key={perk.id} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
                  {perk.image_url && (
                    <img
                      src={perk.image_url}
                      alt={perk.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium">{perk.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${perk.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {perk.status === 'active' ? 'Live' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mb-1">{perk.offer}</p>
                    <p className="text-xs text-muted-foreground">{perk.location} · {perk.timing}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleStatus(perk)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title={perk.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {perk.status === 'active' ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                    </button>
                    <button
                      onClick={() => deletePerk(perk.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
