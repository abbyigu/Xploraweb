import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, LogOut, Trash2, Eye, EyeOff, Building2, CheckCircle, AlertCircle, Shield, Users, ChevronDown, ChevronUp, Star, MapPin, Mail, Globe, LayoutDashboard, Gift, Map } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { XploraLogo } from './XploraLogo';
import { SimpleFooter } from './SimpleFooter';

const PARTNERSHIP_BENEFITS = [
  { icon: Star,   title: 'Featured Venue',             desc: 'Dedicated spotlight in the Xplora member app' },
  { icon: MapPin, title: 'Official Xplora-tours Stop',  desc: 'Named stop on our curated guided city tours' },
  { icon: Mail,   title: 'Newsletter Highlight',        desc: 'Featured in the Xplora member newsletter' },
  { icon: Globe,  title: 'Logo on Website',             desc: 'Your brand in the Partners section of goxplora.ca' },
];

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
  type: 'free' | 'paid';
  price_cents: number | null;
  spots_total: number | null;
  spots_remaining: number | null;
  event_date: string | null;
  address: string | null;
  created_at: string;
}

interface Profile {
  business_name: string;
  name: string;
  email: string;
  stripe_connect_account_id: string | null;
  stripe_connect_onboarded: boolean;
  is_admin: boolean;
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

const CATEGORIES = ['Tonight only', 'This week', 'Weekends', 'Anytime'];
const TIMINGS = ['Tonight only', 'This week', 'Weekends', 'Friday nights', 'Saturdays', 'Anytime'];
const XPLORA_CATEGORIES = [
  { id: 'xplorators', label: 'Xplora-tors (self-guided, free)' },
  { id: 'xplorateurs', label: 'Xplora-tours (guided, paid)' },
  { id: 'xploranights', label: 'Xplora Nights (events)' },
];

const EMPTY_FORM = {
  type: 'free' as 'free' | 'paid' | 'xplora_experience',
  title: '',
  description: '',
  offer: '',
  category: 'Anytime',
  xplora_category: 'xplorators',
  timing: 'Anytime',
  duration: '',
  location: '',
  address: '',
  price: '',
  spots: '',
  event_date: '',
};

export function BusinessDashboardScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [perks, setPerks] = useState<BusinessPerk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [error, setError] = useState('');
  const [stripeJustConnected] = useState(searchParams.get('stripe') === 'connected');
  const [adminBusinesses, setAdminBusinesses] = useState<AdminBusiness[]>([]);
  const [adminPerks, setAdminPerks] = useState<AdminPerk[]>([]);
  const [adminXperiences, setAdminXperiences] = useState<AdminPerk[]>([]);
  const [adminExpanded, setAdminExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<'offers' | 'benefits'>('offers');

  useEffect(() => {
    loadData();
  }, []);

  // Mark Stripe as onboarded if returning from Connect flow
  useEffect(() => {
    if (stripeJustConnected) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          supabase.from('profiles')
            .update({ stripe_connect_onboarded: true })
            .eq('id', data.user.id);
        }
      });
    }
  }, [stripeJustConnected]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }

    const [profileRes, perksRes] = await Promise.all([
      supabase.from('profiles').select('business_name, name, email, stripe_connect_account_id, stripe_connect_onboarded, is_admin').eq('id', user.id).single(),
      supabase.from('business_perks').select('*').eq('business_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data);
      if (profileRes.data.is_admin) {
        const [bizRes, allPerksRes, xperiencesRes] = await Promise.all([
          supabase.from('profiles').select('id, business_name, name, email, stripe_connect_onboarded, created_at').eq('account_type', 'business').order('created_at', { ascending: false }),
          supabase.from('business_perks').select('id, business_id, business_name, title, type, price_cents, status, location, timing, created_at').neq('type', 'xplora_experience').order('created_at', { ascending: false }),
          supabase.from('business_perks').select('id, business_id, business_name, title, type, price_cents, status, location, timing, created_at').eq('type', 'xplora_experience').order('created_at', { ascending: false }),
        ]);
        if (bizRes.data) setAdminBusinesses(bizRes.data);
        if (allPerksRes.data) setAdminPerks(allPerksRes.data);
        if (xperiencesRes.data) setAdminXperiences(xperiencesRes.data);
      }
    }
    if (perksRes.data) setPerks(perksRes.data);
    setLoading(false);
  }

  async function handleConnectStripe() {
    setConnectingStripe(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const returnUrl = `${window.location.origin}/business/dashboard`;
      const res = await fetch('/api/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, returnUrl }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start Stripe onboarding');
        setConnectingStripe(false);
      }
    } catch (err: any) {
      setError('Server error — check Vercel env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
      setConnectingStripe(false);
    }
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File, userId: string): Promise<string | null> {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('perk-images').upload(path, file, { upsert: true });
    if (error) { setError('Image upload failed: ' + error.message); return null; }
    return supabase.storage.from('perk-images').getPublicUrl(path).data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.type === 'paid' && !profile?.stripe_connect_onboarded) {
      setError('Connect your Stripe account before adding paid experiences.');
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, user.id);
      if (!imageUrl) { setSubmitting(false); return; }
    }

    let insertError: any = null;

    ({ error: insertError } = await supabase.from('business_perks').insert({
      business_id: user.id,
      business_name: profile?.business_name || '',
      title: form.title,
      description: form.description,
      offer: form.type === 'paid' ? `$${form.price} CAD` : form.type === 'xplora_experience' ? form.duration : form.offer,
      category: form.type === 'xplora_experience' ? form.xplora_category : form.category,
      timing: form.type === 'xplora_experience' ? (form.duration || 'Anytime') : form.timing,
      image_url: imageUrl,
      location: form.location,
      address: form.type === 'paid' ? form.address : null,
      type: form.type,
      price_cents: (form.type === 'paid' || form.type === 'xplora_experience') && form.price ? Math.round(parseFloat(form.price) * 100) : null,
      spots_total: form.spots ? parseInt(form.spots) : null,
      spots_remaining: form.spots ? parseInt(form.spots) : null,
      event_date: form.type === 'paid' && form.event_date ? form.event_date : null,
      status: 'active',
    }));

    if (insertError) { setError(insertError.message); setSubmitting(false); return; }

    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
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

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;

  const stripeConnected = profile?.stripe_connect_onboarded || stripeJustConnected;

  return (
    <div className="min-h-screen bg-background pb-24">
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
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Benefits tab */}
        {tab === 'benefits' && (
          <div className="grid grid-cols-2 gap-3">
            {PARTNERSHIP_BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-snug">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'offers' && <>

        {/* Stripe Connect banner */}
        {stripeConnected ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Stripe connected</p>
              <p className="text-xs text-green-600">You'll automatically receive 80% of every ticket sale.</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Connect Stripe to offer paid experiences</p>
                <p className="text-xs text-amber-600 mt-0.5">You'll receive 80% of each ticket sale automatically. Free perks work without this.</p>
              </div>
            </div>
            {connectingStripe ? (
              <div className="flex-shrink-0 flex items-center gap-2 px-5 py-2 text-amber-700 text-sm">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Opening Stripe…
              </div>
            ) : (
              <button
                onClick={handleConnectStripe}
                className="flex-shrink-0 bg-amber-600 text-white px-5 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                Connect Stripe
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-3xl font-serif">{perks.filter(p => p.status === 'active').length}</p>
            <p className="text-sm text-muted-foreground mt-1">Active</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-3xl font-serif">{perks.filter(p => p.type === 'paid').length}</p>
            <p className="text-sm text-muted-foreground mt-1">Paid experiences</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-3xl font-serif">{perks.filter(p => p.type === 'free').length}</p>
            <p className="text-sm text-muted-foreground mt-1">Free perks</p>
          </div>
        </div>

        {/* Add perk */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl">Your Offers</h2>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Cancel' : 'Add Offer'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* Type toggle */}
              <div className="flex gap-2">
                {(['free', 'paid', 'xplora_experience'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${form.type === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/40'}`}
                  >
                    {t === 'free' ? '✨ Free Perk' : t === 'paid' ? '🎟️ Paid Experience' : '🗺️ Xplora Xperience'}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1.5">Title</label>
                  <input type="text" value={form.title} onChange={set('title')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder={form.type === 'free' ? 'First drink on us' : 'Evening Wine Tasting'} required />
                </div>
                {form.type === 'free' ? (
                  <div>
                    <label className="block text-sm mb-1.5">Offer</label>
                    <input type="text" value={form.offer} onChange={set('offer')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Free welcome cocktail" required />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm mb-1.5">Price per ticket (CAD)</label>
                    <input type="number" value={form.price} onChange={set('price')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="50" min="1" step="0.01" required={form.type === 'paid'} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1.5">Description</label>
                <textarea value={form.description} onChange={set('description')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none" rows={2} placeholder="What members will experience" required />
              </div>

              {form.type === 'paid' && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5">Spots available</label>
                    <input type="number" value={form.spots} onChange={set('spots')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="10" min="1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1.5">Date & Time <span className="text-muted-foreground">(optional)</span></label>
                    <input type="datetime-local" value={form.event_date} onChange={set('event_date')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                </div>
              )}

              {form.type === 'xplora_experience' ? (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5">Xplora Category</label>
                    <select value={form.xplora_category} onChange={set('xplora_category')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background">
                      {XPLORA_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Duration</label>
                    <input type="text" value={form.duration} onChange={set('duration')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="2–3 hours" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Neighbourhood</label>
                    <input type="text" value={form.location} onChange={set('location')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Saint-Roch" required />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5">Category</label>
                    <select value={form.category} onChange={set('category')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Timing</label>
                    <select value={form.timing} onChange={set('timing')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background">
                      {TIMINGS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Neighbourhood</label>
                    <input type="text" value={form.location} onChange={set('location')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="Saint-Roch" required />
                  </div>
                </div>
              )}

              {form.type === 'paid' && (
                <div>
                  <label className="block text-sm mb-1.5">Full Address <span className="text-muted-foreground">(sent to clients for GPS)</span></label>
                  <input type="text" value={form.address} onChange={set('address')} className="w-full px-4 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm" placeholder="123 Rue Saint-Jean, Québec City, QC" />
                </div>
              )}

              <div>
                <label className="block text-sm mb-1.5">Image <span className="text-muted-foreground">(optional)</span></label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors text-sm text-muted-foreground">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  {imagePreview ? 'Change image' : '📷 Upload image'}
                </label>
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">Remove</button>
                  </div>
                )}
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
                {submitting ? 'Publishing…' : form.type === 'free' ? 'Publish Free Perk' : form.type === 'paid' ? 'Publish Paid Experience' : 'Publish Xplora Xperience'}
              </button>
            </form>
          )}

          {perks.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
              <p className="text-muted-foreground text-sm">No offers yet. Add your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {perks.map((perk) => (
                <div key={perk.id} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
                  {perk.image_url && (
                    <img src={perk.image_url} alt={perk.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium">{perk.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${perk.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {perk.status === 'active' ? 'Live' : 'Paused'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${perk.type === 'paid' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                        {perk.type === 'paid' ? `$${((perk.price_cents || 0) / 100).toFixed(0)}` : 'Free'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{perk.location} · {perk.timing}</p>
                    {perk.type === 'paid' && perk.spots_remaining !== null && (
                      <p className="text-xs text-muted-foreground mt-0.5">{perk.spots_remaining} / {perk.spots_total} spots remaining</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleStatus(perk)} className="p-2 rounded-lg hover:bg-muted transition-colors" title={perk.status === 'active' ? 'Pause' : 'Activate'}>
                      {perk.status === 'active' ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                    </button>
                    <button onClick={() => deletePerk(perk.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>}

        {/* Admin section — only visible for is_admin accounts */}
        {profile?.is_admin && (
          <div className="border-t border-border pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl">Admin</h2>
            </div>
            <div
              className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:bg-muted transition-colors"
              onClick={() => navigate('/dashboard')}
            >
              <div>
                <p className="font-medium">Admin Dashboard</p>
                <p className="text-sm text-muted-foreground mt-0.5">Manage experiences, view stats, publish and edit content</p>
              </div>
              <LayoutDashboard className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </div>
        )}

      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto flex">
          {([
            { key: 'offers',   icon: LayoutDashboard, label: 'My Offers' },
            { key: 'benefits', icon: Gift,             label: 'Benefits'  },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors ${tab === key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium">{label}</span>
              {tab === key && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
          <button
            onClick={() => navigate('/itinerary')}
            className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors text-muted-foreground hover:text-foreground"
          >
            <Map className="w-5 h-5" />
            <span className="text-[11px] font-medium">Itinerary</span>
          </button>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
