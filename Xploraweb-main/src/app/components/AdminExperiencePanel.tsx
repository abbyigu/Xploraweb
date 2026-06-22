import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, Code, Archive, ChevronDown, ChevronUp } from 'lucide-react';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function daysUntilDeletion(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const deleteAt = created + THIRTY_DAYS_MS;
  return Math.max(0, Math.ceil((deleteAt - Date.now()) / (24 * 60 * 60 * 1000)));
}
function daysAgo(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000));
}
import { supabase } from '../lib/supabase';
import { EXPERIENCE_CATEGORIES, experiences as staticExperiences } from '../data/products';
import type { Product, Spot } from '../data/products';
import { useSpots } from '../hooks/useSpots';

const VIBE_OPTIONS = ['cozy', 'adventurous', 'foodie', 'romantic', 'hidden gem', 'lively', 'artsy', 'outdoorsy', 'late night', 'family-friendly'];

const BLANK = {
  name: '', description: '', long_description: '', price_cents: 0,
  duration: '', spots: '', difficulty: 'Easy',
  category: 'xplorators', badge: '', meeting_point: '',
  host_name: '', host_bio: '',
  highlights: '', includes: '', to_bring: '', languages: 'English, Français',
  itinerary: '', neighbourhood: '', vibes: '',
  distance: '', distance_mode: 'walking', spot_ids: [] as string[],
  available_dates: '', available_times: '',
  // French fields
  name_fr: '', description_fr: '', long_description_fr: '',
  highlights_fr: '', includes_fr: '', to_bring_fr: '',
  itinerary_fr: '', host_bio_fr: '', badge_fr: '', difficulty_fr: '',
};

function staticToForm(exp: Product) {
  return {
    name: exp.name || '',
    description: exp.description || '',
    long_description: exp.longDescription || '',
    price_cents: exp.price ?? 0,
    duration: exp.duration || '',
    spots: exp.spots?.toString() || '',
    difficulty: exp.difficulty || 'Easy',
    category: exp.category || 'xplorators',
    badge: exp.badge || '',
    meeting_point: exp.meetingPoint || '',
    host_name: exp.hostName || '',
    host_bio: exp.hostBio || '',
    highlights: (exp.highlights || []).join('\n'),
    includes: (exp.includes || []).join('\n'),
    to_bring: (exp.toBring || []).join('\n'),
    languages: (exp.languages || ['English', 'Français']).join(', '),
    itinerary: (exp.itinerary || []).join('\n'),
    distance: exp.distance || '',
    distance_mode: exp.distanceMode || 'walking',
    spot_ids: exp.spotIds || [],
    neighbourhood: exp.neighbourhood || '',
    vibes: (exp.vibes || []).join(', '),
    name_fr: '', description_fr: '', long_description_fr: '',
    highlights_fr: '', includes_fr: '', to_bring_fr: '',
    itinerary_fr: '', host_bio_fr: '', badge_fr: '', difficulty_fr: '',
  };
}

export function AdminExperiencePanel() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [isStaticEdit, setIsStaticEdit] = useState(false);
  const [langTab, setLangTab] = useState<'en' | 'fr'>('en');
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { spots: spotLibrary, byId: spotById } = useSpots();
  const [spotQuery, setSpotQuery] = useState('');

  const load = async () => {
    // Auto-purge archived records older than 30 days
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
    await supabase.from('xplora_experiences').delete().eq('status', 'archived').lt('created_at', cutoff);

    const { data } = await supabase
      .from('xplora_experiences')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setExperiences(data);
  };

  useEffect(() => { load(); }, []);

  // Static experiences not yet promoted to DB (matched by name)
  const dbNames = new Set(experiences.map(e => e.name?.toLowerCase()));
  const staticOnly = staticExperiences.filter(
    e => e.type === 'experience' && !dbNames.has(e.name.toLowerCase())
  );

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  // ── Trail spot selection (ordered references into the spots library) ──────────
  const addSpot = (id: string) => setForm(f => f.spot_ids.includes(id) ? f : ({ ...f, spot_ids: [...f.spot_ids, id] }));
  const removeSpot = (i: number) => setForm(f => ({ ...f, spot_ids: f.spot_ids.filter((_, j) => j !== i) }));
  const moveSpot = (i: number, dir: -1 | 1) =>
    setForm(f => {
      const j = i + dir;
      if (j < 0 || j >= f.spot_ids.length) return f;
      const spot_ids = [...f.spot_ids];
      [spot_ids[i], spot_ids[j]] = [spot_ids[j], spot_ids[i]];
      return { ...f, spot_ids };
    });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File): Promise<{ url: string | null; error: string | null }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { url: null, error: 'Not authenticated' };

    const fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ fileData, fileName: file.name, fileType: file.type }),
    });
    const json = await res.json();
    if (!res.ok) return { url: null, error: json.error };
    return { url: json.url, error: null };
  }

  const openNew = () => {
    setForm({ ...BLANK, spot_ids: [] }); setEditing(null); setIsStaticEdit(false);
    setImageFile(null); setImagePreview(''); setLangTab('en'); setSpotQuery(''); setShowForm(true);
  };

  const openEdit = (exp: any) => {
    setImageFile(null);
    setImagePreview(exp.image_url || '');
    setForm({
      name: exp.name || '',
      description: exp.description || '',
      long_description: exp.long_description || '',
      price_cents: exp.price_cents ?? 0,
      duration: exp.duration || '',
      spots: exp.spots?.toString() || '',
      difficulty: exp.difficulty || 'Easy',
      category: exp.category || 'xplorators',
      badge: exp.badge || '',
      meeting_point: exp.meeting_point || '',
      host_name: exp.host_name || '',
      host_bio: exp.host_bio || '',
      highlights: (exp.highlights || []).join('\n'),
      includes: (exp.includes || []).join('\n'),
      to_bring: (exp.to_bring || []).join('\n'),
      languages: (exp.languages || ['English', 'Français']).join(', '),
      itinerary: (exp.itinerary || []).join('\n'),
      distance: exp.distance || '',
      distance_mode: exp.distance_mode || 'walking',
      spot_ids: Array.isArray(exp.spot_ids) ? exp.spot_ids : [],
      neighbourhood: exp.neighbourhood || '',
      vibes: (exp.vibes || []).join(', '),
      available_dates: (exp.available_dates || []).join('\n'),
      available_times: (exp.available_times || []).join(', '),
      name_fr: exp.name_fr || '',
      description_fr: exp.description_fr || '',
      long_description_fr: exp.long_description_fr || '',
      highlights_fr: (exp.highlights_fr || []).join('\n'),
      includes_fr: (exp.includes_fr || []).join('\n'),
      to_bring_fr: (exp.to_bring_fr || []).join('\n'),
      itinerary_fr: (exp.itinerary_fr || []).join('\n'),
      host_bio_fr: exp.host_bio_fr || '',
      badge_fr: exp.badge_fr || '',
      difficulty_fr: exp.difficulty_fr || '',
    });
    setEditing(exp.id);
    setIsStaticEdit(false);
    setLangTab('en');
    setShowForm(true);
  };

  const archiveStatic = async (exp: Product) => {
    if (!confirm(`Archive "${exp.name}"? It will be hidden from the site and permanently deleted after 30 days.`)) return;
    await supabase.from('xplora_experiences').insert({
      name: exp.name,
      description: exp.description,
      long_description: exp.longDescription || null,
      price_cents: exp.price,
      image_url: exp.image,
      duration: exp.duration || null,
      spots: exp.spots || null,
      difficulty: exp.difficulty || null,
      category: exp.category || null,
      badge: exp.badge || null,
      meeting_point: exp.meetingPoint || null,
      host_name: exp.hostName || null,
      host_bio: exp.hostBio || null,
      highlights: exp.highlights || null,
      includes: exp.includes || null,
      to_bring: exp.toBring || null,
      languages: exp.languages || null,
      itinerary: exp.itinerary || null,
      spot_ids: exp.spotIds || null,
      distance: exp.distance || null,
      distance_mode: exp.distanceMode || 'walking',
      neighbourhood: exp.neighbourhood || null,
      vibes: exp.vibes || null,
      status: 'archived',
    });
    await load();
  };

  const openEditStatic = (exp: Product) => {
    setImageFile(null);
    setImagePreview(exp.image || '');
    setForm(staticToForm(exp));
    setEditing(null);
    setIsStaticEdit(true);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    let imageUrl: string | null = imagePreview && !imageFile ? imagePreview : null;
    if (imageFile) {
      const result = await uploadImage(imageFile);
      if (result.error) { setError(`Image upload failed: ${result.error}`); setSaving(false); return; }
      imageUrl = result.url;
    }
    // Resolve selected spot ids to spots (skipping any that no longer exist).
    const selectedSpots = form.spot_ids
      .map(id => spotById.get(id))
      .filter((s): s is Spot => !!s);
    // Keep the legacy itinerary array in sync so the current detail page still renders.
    const derivedItinerary = selectedSpots.map(s =>
      s.description ? `${s.name} — ${s.description}` : s.name);

    const payload = {
      name: form.name,
      description: form.description,
      long_description: form.long_description || null,
      price_cents: Number(form.price_cents),
      image_url: imageUrl,
      duration: form.duration || null,
      spots: form.spots ? Number(form.spots) : null,
      difficulty: form.difficulty || null,
      category: form.category || null,
      badge: form.badge || null,
      meeting_point: form.meeting_point || null,
      host_name: form.host_name || null,
      host_bio: form.host_bio || null,
      highlights: form.highlights ? form.highlights.split('\n').map(s => s.trim()).filter(Boolean) : null,
      includes: form.includes ? form.includes.split('\n').map(s => s.trim()).filter(Boolean) : null,
      to_bring: form.to_bring ? form.to_bring.split('\n').map(s => s.trim()).filter(Boolean) : null,
      languages: form.languages ? form.languages.split(',').map(s => s.trim()).filter(Boolean) : null,
      itinerary: derivedItinerary.length ? derivedItinerary : null,
      spot_ids: form.spot_ids.length ? form.spot_ids : null,
      distance: form.distance.trim() || null,
      distance_mode: form.distance_mode || 'walking',
      neighbourhood: form.neighbourhood || null,
      vibes: form.vibes ? form.vibes.split(',').map(s => s.trim()).filter(Boolean) : null,
      available_dates: form.available_dates ? form.available_dates.split('\n').map(s => s.trim()).filter(Boolean) : null,
      available_times: form.available_times ? form.available_times.split(',').map(s => s.trim()).filter(Boolean) : null,
      name_fr: form.name_fr || null,
      description_fr: form.description_fr || null,
      long_description_fr: form.long_description_fr || null,
      highlights_fr: form.highlights_fr ? form.highlights_fr.split('\n').map(s => s.trim()).filter(Boolean) : null,
      includes_fr: form.includes_fr ? form.includes_fr.split('\n').map(s => s.trim()).filter(Boolean) : null,
      to_bring_fr: form.to_bring_fr ? form.to_bring_fr.split('\n').map(s => s.trim()).filter(Boolean) : null,
      itinerary_fr: form.itinerary_fr ? form.itinerary_fr.split('\n').map(s => s.trim()).filter(Boolean) : null,
      host_bio_fr: form.host_bio_fr || null,
      badge_fr: form.badge_fr || null,
      difficulty_fr: form.difficulty_fr || null,
    };

    let dbError: any;
    if (editing && !isStaticEdit) {
      ({ error: dbError } = await supabase.from('xplora_experiences').update(payload).eq('id', editing));
    } else {
      // New record — either blank or promoted from static
      ({ error: dbError } = await supabase.from('xplora_experiences').insert({ ...payload, status: 'active' }));
    }
    if (dbError) { setError(dbError.message); setSaving(false); return; }

    await load();
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditing(null); setIsStaticEdit(false); }, 1200);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return;
    await supabase.from('xplora_experiences').delete().eq('id', id);
    await load();
  };

  const toggleStatus = async (exp: any) => {
    const next = exp.status === 'active' ? 'draft' : 'active';
    await supabase.from('xplora_experiences').update({ status: next }).eq('id', exp.id);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg">Experiences</h3>
          <p className="text-xs text-muted-foreground">{experiences.length} in database · {staticOnly.length} static (not yet imported)</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h4 className="font-medium">{editing ? 'Edit Experience' : isStaticEdit ? 'Import & Edit Static Experience' : 'New Experience'}</h4>
              {isStaticEdit && <p className="text-xs text-muted-foreground mt-0.5">Saving will add this to the database so you can manage it here.</p>}
            </div>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {/* EN / FR tab switcher */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
            <button type="button" onClick={() => setLangTab('en')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${langTab === 'en' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>🇨🇦 English</button>
            <button type="button" onClick={() => setLangTab('fr')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${langTab === 'fr' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>🇫🇷 Français</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {langTab === 'en' ? (<>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Name *</label>
              <input value={form.name} onChange={set('name')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Experience name" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Short description <span className="text-primary">— shown on home page cards</span></label>
              <input value={form.description} onChange={set('description')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="One-liner shown on card" />
            </div>
            </>) : (<>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Nom (FR)</label>
              <input value={form.name_fr} onChange={set('name_fr')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nom de l'expérience" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Description courte (FR) <span className="text-primary">— affichée sur les cartes</span></label>
              <input value={form.description_fr} onChange={set('description_fr')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Une ligne affichée sur la carte" />
            </div>
            </>)}

            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select value={form.category} onChange={set('category')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                {EXPERIENCE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Price (CAD) — 0 = Free</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <input type="number" min="0" value={form.price_cents / 100} onChange={e => setForm(f => ({ ...f, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) }))}
                  className="w-full pl-6 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Duration</label>
              <input value={form.duration} onChange={set('duration')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Full Day, 2 hours" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Spots available</label>
              <input type="number" min="0" value={form.spots} onChange={set('spots')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Leave blank for unlimited" />
            </div>

            {langTab === 'en' ? (<>
            <div>
              <label className="text-xs text-muted-foreground">Difficulty</label>
              <select value={form.difficulty} onChange={set('difficulty')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Easy</option><option>Moderate</option><option>Challenging</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Badge (optional)</label>
              <input value={form.badge} onChange={set('badge')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Popular, New, Free" />
            </div>
            </>) : (<>
            <div>
              <label className="text-xs text-muted-foreground">Difficulté (FR)</label>
              <input value={form.difficulty_fr} onChange={set('difficulty_fr')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ex. Facile, Modéré, Difficile" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Badge (FR, optionnel)</label>
              <input value={form.badge_fr} onChange={set('badge_fr')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="ex. Populaire, Nouveau, Gratuit" />
            </div>
            </>)}

            <div>
              <label className="text-xs text-muted-foreground">Neighbourhood</label>
              <input value={form.neighbourhood} onChange={set('neighbourhood')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Saint-Roch, Limoilou" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">What's your vibe?</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {VIBE_OPTIONS.map(v => {
                  const active = form.vibes.split(',').map(s => s.trim()).includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        const current = form.vibes.split(',').map(s => s.trim()).filter(Boolean);
                        const next = active ? current.filter(s => s !== v) : [...current, v];
                        setForm(f => ({ ...f, vibes: next.join(', ') }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                    >
                      {v}
                    </button>
                  );
                })}
                {form.vibes.split(',').map(s => s.trim()).filter(s => s && !VIBE_OPTIONS.includes(s)).map(custom => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => {
                      const next = form.vibes.split(',').map(s => s.trim()).filter(s => s && s !== custom);
                      setForm(f => ({ ...f, vibes: next.join(', ') }));
                    }}
                    className="px-3 py-1.5 rounded-full text-sm capitalize bg-primary text-primary-foreground transition-colors flex items-center gap-1"
                  >
                    {custom} <X className="w-3 h-3" />
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="+ add vibe"
                  className="px-3 py-1.5 rounded-full text-sm border border-dashed border-border bg-transparent text-muted-foreground focus:outline-none focus:border-primary focus:text-foreground w-28"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim().toLowerCase();
                      if (!val) return;
                      const current = form.vibes.split(',').map(s => s.trim()).filter(Boolean);
                      if (!current.includes(val)) setForm(f => ({ ...f, vibes: [...current, val].join(', ') }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Image</label>
              <div className="mt-1 space-y-2">
                <label className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors text-sm text-muted-foreground">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  {imagePreview && !imageFile ? 'Replace with file upload' : imageFile ? 'Change file' : '📷 Upload image'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or paste a URL</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={!imageFile ? imagePreview : ''}
                  onChange={e => { setImageFile(null); setImagePreview(e.target.value); }}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {imagePreview && (
                <div className="mt-2 relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">Remove</button>
                </div>
              )}
            </div>

            {langTab === 'en' ? (<>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Full description <span className="text-muted-foreground/60">— shown on detail page only, not on cards</span></label>
              <textarea value={form.long_description} onChange={set('long_description')} rows={4} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Full experience description (separate paragraphs with a blank line)" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Highlights — one per line</label>
              <textarea value={form.highlights} onChange={set('highlights')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Free & self-guided&#10;Curated stop list&#10;Go at your own pace" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Itinerary stops</label>
              <p className="text-xs text-muted-foreground/70 mt-1">Build the route from your <span className="font-medium text-foreground">Spots</span> in the <span className="font-medium text-foreground">Trail route</span> section below.</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">What's included — one per line</label>
              <textarea value={form.includes} onChange={set('includes')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Digital map&#10;Guide PDF" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">What to bring — one per line</label>
              <textarea value={form.to_bring} onChange={set('to_bring')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Comfortable shoes&#10;Camera" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Host bio</label>
              <input value={form.host_bio} onChange={set('host_bio')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Short bio" />
            </div>
            </>) : (<>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Description complète (FR) <span className="text-muted-foreground/60">— page de détail seulement</span></label>
              <textarea value={form.long_description_fr} onChange={set('long_description_fr')} rows={4} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Description complète (séparez les paragraphes par une ligne vide)" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Points forts (FR) — un par ligne</label>
              <textarea value={form.highlights_fr} onChange={set('highlights_fr')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Gratuit et autoguidé&#10;Parcours curatif&#10;À votre rythme" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Arrêts de l'itinéraire (FR) — un par ligne</label>
              <textarea value={form.itinerary_fr} onChange={set('itinerary_fr')} rows={5} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Place des Arts — Commencez à la galerie à ciel ouvert&#10;Rue Saint-Joseph — Parcourez l'artère créative" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Ce qui est inclus (FR) — un par ligne</label>
              <textarea value={form.includes_fr} onChange={set('includes_fr')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Carte numérique&#10;Guide PDF" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Quoi apporter (FR) — un par ligne</label>
              <textarea value={form.to_bring_fr} onChange={set('to_bring_fr')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Souliers confortables&#10;Appareil photo" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Bio de l'hôte (FR)</label>
              <input value={form.host_bio_fr} onChange={set('host_bio_fr')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Courte biographie" />
            </div>
            </>)}

            {/* Language-neutral fields — always visible */}
            <div>
              <label className="text-xs text-muted-foreground">Meeting point</label>
              <input value={form.meeting_point} onChange={set('meeting_point')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Address or description" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Languages (comma-separated)</label>
              <input value={form.languages} onChange={set('languages')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="English, Français" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Host name</label>
              <input value={form.host_name} onChange={set('host_name')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Your name" />
            </div>

            {/* Trail route — ordered selection of spots from the library */}
            <div className="md:col-span-2 border-t border-border pt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Trail route</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pick spots from your library and order them. Don't see a place? Add it under the <span className="font-medium text-foreground">Spots</span> tab first.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Mode</label>
                  <select value={form.distance_mode} onChange={set('distance_mode')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="walking">🚶 Walking</option>
                    <option value="driving">🚗 Driving</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{form.distance_mode === 'driving' ? 'Driving distance' : 'Walking distance'}</label>
                  <input value={form.distance} onChange={set('distance')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 2.4 km" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Total stops</label>
                  <input value={form.spot_ids.length} readOnly tabIndex={-1} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm bg-muted/40 text-muted-foreground" />
                </div>
              </div>

              {/* Selected, ordered spots */}
              {form.spot_ids.length === 0 ? (
                <p className="text-xs text-muted-foreground/70 italic">No spots yet — add some from the library below.{form.itinerary ? ' (This trail previously listed: ' + form.itinerary.split('\n')[0] + '…)' : ''}</p>
              ) : (
                <div className="space-y-2">
                  {form.spot_ids.map((id, i) => {
                    const spot = spotById.get(id);
                    const noCoords = !spot || spot.lat == null || spot.lng == null;
                    return (
                      <div key={id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-2.5">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{spot ? spot.name : 'Unknown spot (deleted?)'}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {spot ? [spot.category, spot.neighbourhood].filter(Boolean).join(' · ') || '—' : id}
                            {noCoords ? <span className="text-amber-600"> · ⚠ no coords</span> : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button type="button" onClick={() => moveSpot(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent text-muted-foreground" title="Move up">
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => moveSpot(i, 1)} disabled={i === form.spot_ids.length - 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent text-muted-foreground" title="Move down">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removeSpot(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500" title="Remove from trail">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Library picker */}
              <div className="rounded-xl border border-dashed border-border p-3 space-y-2">
                <input
                  value={spotQuery}
                  onChange={e => setSpotQuery(e.target.value)}
                  placeholder="Search the spots library to add…"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {(() => {
                  const available = spotLibrary.filter(s => !form.spot_ids.includes(s.id));
                  const q = spotQuery.trim().toLowerCase();
                  const matches = available.filter(s =>
                    !q || (s.name || '').toLowerCase().includes(q)
                       || (s.neighbourhood || '').toLowerCase().includes(q)
                       || (s.category || '').toLowerCase().includes(q));
                  if (spotLibrary.length === 0) {
                    return <p className="text-xs text-muted-foreground/70 italic px-1">Your spots library is empty. Add places under the Spots tab.</p>;
                  }
                  if (matches.length === 0) {
                    return <p className="text-xs text-muted-foreground/70 italic px-1">No matching spots available.</p>;
                  }
                  return (
                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {matches.slice(0, 30).map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => addSpot(s.id)}
                          className="w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="text-sm truncate flex-1">{s.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{[s.category, s.neighbourhood].filter(Boolean).join(' · ')}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Schedule — only for paid / guided categories */}
            {form.category !== 'xplorators' && (
              <div className="md:col-span-2 border-t border-border pt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Schedule</p>
                <p className="text-xs text-muted-foreground -mt-1">
                  Set specific dates and times that guests can choose when booking. Leave blank to allow any date/time.
                </p>

                <div>
                  <label className="text-xs text-muted-foreground">Available dates — one per line (YYYY-MM-DD)</label>
                  <textarea
                    value={form.available_dates}
                    onChange={set('available_dates')}
                    rows={4}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
                    placeholder={"2026-06-14\n2026-06-21\n2026-06-28"}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Available time slots — comma-separated (24h format)</label>
                  <input
                    value={form.available_times}
                    onChange={set('available_times')}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    placeholder="10:00, 14:00, 18:00"
                  />
                  <p className="text-xs text-muted-foreground/60 mt-1">These slots apply to all dates above.</p>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving…' : editing ? 'Save Changes' : isStaticEdit ? 'Import to Database' : 'Add Experience'}
          </button>
        </div>
      )}

      {/* DB Experiences — one section per category */}
      {experiences.length === 0 && staticOnly.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground py-4 text-center">No experiences yet. Click "Add Experience" to start.</p>
      )}

      {EXPERIENCE_CATEGORIES.map(cat => {
        const catExps = experiences.filter(exp => exp.status !== 'deleted' && exp.status !== 'archived' && exp.category === cat.id);
        return (
          <div key={cat.id} className="space-y-2">
            <div className="flex items-center gap-2 pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cat.name}</p>
              <span className="text-xs text-muted-foreground/60">({catExps.length})</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {catExps.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 pb-1 pl-1">No experiences in this category yet.</p>
            ) : catExps.map(exp => (
              <div key={exp.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{exp.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exp.price_cents === 0 ? 'Free' : `$${(exp.price_cents / 100).toFixed(0)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(exp)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      exp.status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${exp.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    {exp.status === 'active' ? 'Live' : 'Draft'}
                  </button>
                  <button onClick={() => openEdit(exp)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(exp.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Static experiences not yet in DB */}
      {staticOnly.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest pt-2">Static (in code — click edit to import)</p>
          {staticOnly.map(exp => (
            <div key={exp.id} className="bg-muted/30 border border-dashed border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{exp.name}</p>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                    <Code className="w-3 h-3" /> static
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {EXPERIENCE_CATEGORIES.find(c => c.id === exp.category)?.name || exp.category} · {exp.price === 0 ? 'Free' : `$${(exp.price / 100).toFixed(0)}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEditStatic(exp)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => archiveStatic(exp)} className="p-2 rounded-lg hover:bg-amber-50 transition-colors text-muted-foreground hover:text-amber-600" title="Archive (auto-deletes in 30 days)">
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archived */}
      {(() => {
        const archived = experiences.filter(exp => exp.status === 'archived');
        if (archived.length === 0) return null;
        return (
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setShowArchived(v => !v)}
              className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest w-full hover:text-foreground transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              Archived ({archived.length})
              {showArchived ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
            </button>
            {showArchived && archived.map(exp => {
              const daysLeft = daysUntilDeletion(exp.created_at);
              const ago = daysAgo(exp.created_at);
              return (
                <div key={exp.id} className="bg-muted/20 border border-dashed border-border rounded-xl p-4 flex items-center justify-between gap-4 opacity-60">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{exp.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Archived {ago === 0 ? 'today' : `${ago}d ago`} · auto-deletes in {daysLeft}d
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500 flex-shrink-0"
                    title="Delete now"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
