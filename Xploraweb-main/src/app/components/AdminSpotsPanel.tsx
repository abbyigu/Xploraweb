import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, X, Check, MapPin, Lightbulb, LocateFixed, Languages, Loader2, Star, Flame, Heart, Award, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadViaApi } from '../lib/uploadImage';
import { useNeighbourhoods } from '../hooks/useNeighbourhoods';
import { SPOT_CATEGORIES } from '../data/products';
import { TagInput } from './TagInput';

const PRICE_OPTIONS = [
  { value: 'Free', label: 'Free', hint: 'No cost' },
  { value: '$', label: '$', hint: 'Budget' },
  { value: '$$', label: '$$', hint: 'Moderate' },
  { value: '$$$', label: '$$$', hint: 'Pricey' },
  { value: '$$$$', label: '$$$$', hint: 'Splurge' },
];

const BLANK = {
  name: '', description: '', address: '', lat: '', lng: '',
  website: '', michelin_url: '', neighbourhood: '', category: '', visit_time: '', price_range: '',
  xplora_tips: '',
  tags: [] as string[],
  name_fr: '', description_fr: '', xplora_tips_fr: '',
  is_brunch: false,
  is_hotspot: false,
  is_loved: false,
};

export function AdminSpotsPanel() {
  const [spots, setSpots] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<typeof BLANK>({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeMsg, setGeocodeMsg] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');
  const [michelinEnabled, setMichelinEnabled] = useState(false);
  const { neighbourhoods } = useNeighbourhoods();

  const autoTranslate = async () => {
    if (!form.name.trim() && !form.description.trim() && !form.xplora_tips.trim()) return;
    setTranslating(true);
    setTranslateError('');
    try {
      const res = await fetch('/api/translate-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, description: form.description, tips: form.xplora_tips }),
      });
      const data = await res.json();
      if (!res.ok) { setTranslateError(data?.error || 'Translation failed.'); return; }
      setForm(f => ({ ...f, name_fr: data.name_fr || f.name_fr, description_fr: data.description_fr || f.description_fr, xplora_tips_fr: data.tips_fr || f.xplora_tips_fr }));
    } catch {
      setTranslateError('Translation failed — check your connection.');
    } finally {
      setTranslating(false);
    }
  };

  const geocodeAddress = async () => {
    const address = form.address.trim();
    if (!address) return;
    setGeocoding(true);
    setGeocodeMsg('');
    // Greater Québec City bounding box — biases the search and sanity-checks the result.
    const QC = { minLat: 46.70, maxLat: 46.95, minLng: -71.60, maxLng: -71.10 };
    const viewbox = `${QC.minLng},${QC.maxLat},${QC.maxLng},${QC.minLat}`; // left,top,right,bottom
    const inQC = (lat: number, lon: number) =>
      lat >= QC.minLat && lat <= QC.maxLat && lon >= QC.minLng && lon <= QC.maxLng;
    // Strip postal code / province suffix that Google Maps appends, keep street + city
    let clean = address.replace(/,?\s*[A-Z]\d[A-Z]\s*\d[A-Z]\d\s*$/i, '').trim();
    // Expand French direction abbreviations that Google Maps shortens but OSM stores in full
    clean = clean
      .replace(/\bE\b/g, 'Est')
      .replace(/\bO\b/g, 'Ouest')
      .replace(/\bN\b/g, 'Nord')
      .replace(/\bS\b/g, 'Sud');
    // Ensure "Québec" appears so OSM anchors the search to this city
    const q = /qu[eé]bec/i.test(clean) ? clean : `${clean}, Québec, Canada`;

    // Nominatim is a shared free service. Bias the query to Québec/Canada so results
    // come back ranked locally, and tell a throttled/empty response apart from a real
    // miss — otherwise transient rate-limiting looks identical to "address not found".
    const query = async (bounded: boolean): Promise<{ data: any[] } | { error: number }> => {
      const params = new URLSearchParams({
        q, format: 'json', limit: '5', addressdetails: '0',
        countrycodes: 'ca', viewbox,
      });
      if (bounded) params.set('bounded', '1');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'Accept-Language': 'en' },
      });
      if (!res.ok) return { error: res.status };
      try { return { data: await res.json() }; } catch { return { error: 0 }; }
    };

    try {
      // 1) Restrict strictly to the Québec City box. 2) Retry with a soft city bias.
      let r = await query(true);
      if ('data' in r && r.data.length === 0) r = await query(false);
      if ('error' in r) {
        setGeocodeMsg('Geocoding service is busy — wait a few seconds and try again.');
        return;
      }
      const hit = r.data.find((x: any) => inQC(parseFloat(x.lat), parseFloat(x.lon)));
      if (!hit) {
        setGeocodeMsg('Not found in Québec City — check the spelling or add a street number.');
      } else {
        setForm(f => ({ ...f, lat: parseFloat(hit.lat).toFixed(6), lng: parseFloat(hit.lon).toFixed(6) }));
        setGeocodeMsg(`✓ ${hit.display_name}`);
      }
    } catch {
      setGeocodeMsg('Geocoding failed — check your connection.');
    } finally {
      setGeocoding(false);
    }
  };

  const load = async () => {
    const { data } = await supabase
      .from('xplora_spots')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSpots(data);
  };

  useEffect(() => { load(); }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File): Promise<{ url: string | null; error: string | null }> {
    return uploadViaApi(file);
  }

  const openNew = () => {
    setForm({ ...BLANK }); setEditing(null);
    setImageFile(null); setImagePreview(''); setError(''); setGeocodeMsg(''); setTranslateError(''); setMichelinEnabled(false); setShowForm(true);
  };

  const formRef = useRef<HTMLDivElement>(null);

  const openEdit = (spot: any) => {
    setImageFile(null);
    setImagePreview(spot.image_url || '');
    setError('');
    setTranslateError('');
    setMichelinEnabled(!!spot.michelin_url);
    setForm({
      name: spot.name || '',
      description: spot.description || '',
      address: spot.address || '',
      lat: spot.lat != null ? String(spot.lat) : '',
      lng: spot.lng != null ? String(spot.lng) : '',
      website: spot.website || '',
      michelin_url: spot.michelin_url || '',
      neighbourhood: spot.neighbourhood || '',
      category: spot.category || '',
      visit_time: spot.visit_time || '',
      price_range: spot.price_range || '',
      xplora_tips: (spot.xplora_tips || []).join('\n'),
      tags: spot.vibes || [],
      name_fr: spot.name_fr || '',
      description_fr: spot.description_fr || '',
      xplora_tips_fr: (spot.xplora_tips_fr || []).join('\n'),
      is_brunch: !!spot.is_brunch,
      is_hotspot: !!spot.is_hotspot,
      is_loved: !!spot.is_loved,
    });
    setEditing(spot.id);
    setGeocodeMsg('');
    setShowForm(true);
  };

  useEffect(() => {
    if (showForm) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showForm, editing]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      let imageUrl: string | null = imagePreview && !imageFile ? imagePreview : null;
      if (imageFile) {
        const result = await uploadImage(imageFile);
        if (result.error) { setError(`Image upload failed: ${result.error}`); return; }
        imageUrl = result.url;
      }
      const lat = parseFloat(form.lat);
      const lng = parseFloat(form.lng);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        address: form.address.trim() || null,
        lat: isNaN(lat) ? null : lat,
        lng: isNaN(lng) ? null : lng,
        website: form.website.trim() || null,
        michelin_url: form.michelin_url.trim() || null,
        image_url: imageUrl,
        neighbourhood: form.neighbourhood.trim() || null,
        category: form.category || null,
        visit_time: form.visit_time.trim() || null,
        price_range: form.price_range || null,
        xplora_tips: form.xplora_tips ? form.xplora_tips.split('\n').map(s => s.trim()).filter(Boolean) : null,
        vibes: form.tags.length > 0 ? form.tags : null,
        name_fr: form.name_fr.trim() || null,
        description_fr: form.description_fr.trim() || null,
        xplora_tips_fr: form.xplora_tips_fr ? form.xplora_tips_fr.split('\n').map(s => s.trim()).filter(Boolean) : null,
        is_brunch: form.is_brunch,
        is_hotspot: form.is_hotspot,
        is_loved: form.is_loved,
      };

      let dbError: any;
      if (editing) {
        ({ error: dbError } = await supabase.from('xplora_spots').update(payload).eq('id', editing));
      } else {
        ({ error: dbError } = await supabase.from('xplora_spots').insert({ ...payload, status: 'active' }));
      }
      if (dbError) { setError(dbError.message); return; }

      await load();
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowForm(false); setEditing(null); }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this spot? Trails referencing it will simply skip it.')) return;
    await supabase.from('xplora_spots').delete().eq('id', id);
    await load();
  };

  const toggleStatus = async (spot: any) => {
    const next = spot.status === 'active' ? 'draft' : 'active';
    await supabase.from('xplora_spots').update({ status: next }).eq('id', spot.id);
    await load();
  };

  const filtered = spots.filter(s => {
    if (selectedCategory && (s.category || 'Uncategorized') !== selectedCategory) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (s.name || '').toLowerCase().includes(q)
      || (s.neighbourhood || '').toLowerCase().includes(q)
      || (s.category || '').toLowerCase().includes(q);
  });

  // Group spots by neighbourhood, ordered to match the neighbourhoods list (sort_order),
  // with unrecognized names after and unassigned spots last.
  const groupByNeighbourhood = (list: any[]): [string, any[]][] => {
    const groups = new Map<string, any[]>();
    for (const spot of list) {
      const key = spot.neighbourhood || '';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(spot);
    }
    const knownNames = neighbourhoods.map(n => n.name);
    const known = knownNames.filter(name => groups.has(name)).map(name => [name, groups.get(name)!] as [string, any[]]);
    const extraNames = [...groups.keys()].filter(k => k && !knownNames.includes(k)).sort();
    const extra = extraNames.map(name => [name, groups.get(name)!] as [string, any[]]);
    const unassigned = groups.has('') ? [['', groups.get('')!] as [string, any[]]] : [];
    return [...known, ...extra, ...unassigned];
  };

  // Full (unfiltered by search) grouping — powers the neighbourhood buttons and counters
  // so they reflect the whole library, not just what's currently matched by the search box.
  const groupedAll = groupByNeighbourhood(spots);

  // Distinct tags already used across the library, offered as suggestions in the tag input.
  const tagSuggestions = [...new Set(spots.flatMap(s => (s.vibes as string[] | null) || []))].sort();

  const categoryCounts = (list: any[]): [string, number][] => {
    const counts = new Map<string, number>();
    for (const spot of list) {
      const cat = spot.category || 'Uncategorized';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  };

  const activeNeighbourhoodSpots = selectedNeighbourhood
    ? groupedAll.find(([name]) => name === selectedNeighbourhood)?.[1] || []
    : spots;

  const groupedSpots = groupByNeighbourhood(filtered).filter(([name]) => !selectedNeighbourhood || name === selectedNeighbourhood);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg">Spots</h3>
          <p className="text-xs text-muted-foreground">{spots.length} place{spots.length === 1 ? '' : 's'} in the library · the building blocks for trails</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Spot
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div ref={formRef} className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium">{editing ? 'Edit Spot' : 'New Spot'}</h4>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Name *</label>
              <input value={form.name} onChange={set('name')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Café Largo" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Description</label>
              <textarea value={form.description} onChange={set('description')} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="A neighbourhood staple with exposed brick and rotating art" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Address</label>
              <div className="flex gap-2 mt-1">
                <input
                  value={form.address}
                  onChange={e => { set('address')(e); setGeocodeMsg(''); }}
                  className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="643 Rue Saint-Joseph Est, Québec"
                />
                <button
                  type="button"
                  onClick={geocodeAddress}
                  disabled={geocoding || !form.address.trim()}
                  title="Look up coordinates from address"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-[#12343B] hover:bg-[#12343B]/5 disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  <LocateFixed className={`w-4 h-4 ${geocoding ? 'animate-spin' : ''}`} />
                  {geocoding ? 'Locating…' : 'Get coords'}
                </button>
              </div>
              {geocodeMsg && (
                <p className={`text-[11px] mt-1 ${geocodeMsg.startsWith('No') || geocodeMsg.startsWith('Geocoding') ? 'text-red-500' : 'text-green-700'}`}>
                  {geocodeMsg}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Latitude</label>
              <input value={form.lat} onChange={set('lat')} inputMode="decimal" className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" placeholder="46.8125" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Longitude</label>
              <input value={form.lng} onChange={set('lng')} inputMode="decimal" className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" placeholder="-71.2210" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Neighbourhood</label>
              <select value={form.neighbourhood} onChange={set('neighbourhood')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">—</option>
                {form.neighbourhood && !neighbourhoods.some(n => n.name === form.neighbourhood) && (
                  <option value={form.neighbourhood}>{form.neighbourhood}</option>
                )}
                {neighbourhoods.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select value={form.category} onChange={set('category')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">—</option>
                {SPOT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Website</label>
              <input value={form.website} onChange={set('website')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://…" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Suggested visit time</label>
              <input value={form.visit_time} onChange={set('visit_time')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 20 min" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Price range</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PRICE_OPTIONS.map(p => {
                  const active = form.price_range === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, price_range: active ? '' : p.value }))}
                      title={p.hint}
                      className={`px-4 py-1.5 rounded-full text-sm font-mono transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Tap to set how pricey the spot is — tap again to clear.</p>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_brunch: !f.is_brunch }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.is_brunch
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Star className={`w-4 h-4 ${form.is_brunch ? 'fill-white' : ''}`} />
                  Brunch spot
                </button>
                <p className="text-[11px] text-muted-foreground mt-1">Starred highlight wherever it's shown.</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_hotspot: !f.is_hotspot }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.is_hotspot
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${form.is_hotspot ? 'fill-white' : ''}`} />
                  Hotspot
                </button>
                <p className="text-[11px] text-muted-foreground mt-1">Featured on the home "Hotspots" tile.</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_loved: !f.is_loved }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    form.is_loved
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${form.is_loved ? 'fill-white' : ''}`} />
                  Place We Love
                </button>
                <p className="text-[11px] text-muted-foreground mt-1">Featured on the home "Places We Love" tile.</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !michelinEnabled;
                    setMichelinEnabled(next);
                    if (!next) setForm(f => ({ ...f, michelin_url: '' }));
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    michelinEnabled
                      ? 'bg-red-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Award className={`w-4 h-4 ${michelinEnabled ? 'fill-white' : ''}`} />
                  Michelin Guide
                </button>
                <p className="text-[11px] text-muted-foreground mt-1">Shows the Michelin Guide badge on this spot.</p>
              </div>
            </div>

            {michelinEnabled && (
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">Michelin Guide URL *</label>
                <input value={form.michelin_url} onChange={set('michelin_url')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://guide.michelin.com/…" />
              </div>
            )}

            <div className="md:col-span-2 border-t border-border pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tags</p>
              </div>
              <TagInput
                value={form.tags}
                onChange={next => setForm(f => ({ ...f, tags: next }))}
                suggestions={tagSuggestions}
                placeholder="e.g. pizza, drinks, dessert — type and press comma"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Not shown to explorers — helps the AI itinerary generator understand what's actually here.</p>
            </div>

            <div className="md:col-span-2 border-t border-border pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Xplora Tips</p>
              </div>
              <textarea
                value={form.xplora_tips}
                onChange={set('xplora_tips')}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder={"Go early to beat the crowd\nAsk for the off-menu hot chocolate\nBest light for photos is late afternoon"}
              />
              <p className="text-[11px] text-muted-foreground mt-1">One tip per line — insider advice shown to explorers.</p>
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

            {/* French translations */}
            <div className="md:col-span-2 border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Français</p>
                <button
                  type="button"
                  onClick={autoTranslate}
                  disabled={translating || (!form.name.trim() && !form.description.trim() && !form.xplora_tips.trim())}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border text-xs text-[#12343B] hover:bg-[#12343B]/5 disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                  {translating ? 'Translating…' : 'Auto-translate'}
                </button>
              </div>
              {translateError && <p className="text-[11px] text-red-500 mb-2">{translateError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Nom (FR)</label>
                  <input value={form.name_fr} onChange={set('name_fr')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nom du lieu" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Description (FR) *</label>
                  <input value={form.description_fr} onChange={set('description_fr')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Description courte" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground">Xplora Tips (FR) *</label>
                  <textarea
                    value={form.xplora_tips_fr}
                    onChange={set('xplora_tips_fr')}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder={"Arrivez tôt pour éviter la foule\nDemandez le chocolat chaud hors-menu"}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Un conseil par ligne.</p>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.description_fr.trim() || !form.xplora_tips_fr.trim() || (michelinEnabled && !form.michelin_url.trim())}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Spot'}
          </button>
        </div>
      )}

      {/* Neighbourhood filter buttons */}
      {spots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedNeighbourhood(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedNeighbourhood ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            All <span className="opacity-70">· {spots.length}</span>
          </button>
          {groupedAll.map(([name, group]) => (
            <button
              key={name || '__unassigned'}
              onClick={() => setSelectedNeighbourhood(name === selectedNeighbourhood ? null : name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedNeighbourhood === name ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {name || 'Unassigned'} <span className="opacity-70">· {group.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Counters: category breakdown for the active view + grand total */}
      {spots.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-xl p-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-foreground whitespace-nowrap">
            {selectedNeighbourhood || 'All neighbourhoods'} · {activeNeighbourhoodSpots.length} stop{activeNeighbourhoodSpots.length === 1 ? '' : 's'}
          </span>
          {categoryCounts(activeNeighbourhoodSpots).map(([cat, count]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`px-2 py-0.5 rounded-full border whitespace-nowrap transition-colors text-xs ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {cat} <span className={selectedCategory === cat ? 'font-medium' : 'text-foreground font-medium'}>{count}</span>
            </button>
          ))}
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:text-foreground whitespace-nowrap text-xs"
            >
              Clear category ✕
            </button>
          )}
          <span className="ml-auto text-muted-foreground whitespace-nowrap">{spots.length} stop{spots.length === 1 ? '' : 's'} across all neighbourhoods</span>
        </div>
      )}

      {/* Search */}
      {spots.length > 0 && (
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search spots by name, neighbourhood, or category…"
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}

      {/* List */}
      {spots.length === 0 && !showForm ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
          <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No spots yet. Add places here, then assemble them into trails.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedSpots.map(([name, group]) => (
            <div key={name || '__unassigned'} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{name || 'Unassigned'}</h4>
                <span className="text-[11px] text-muted-foreground">{group.length}</span>
              </div>
              {group.map(spot => (
                <div key={spot.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {spot.image_url ? (
                      <img src={spot.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate flex items-center gap-1.5">
                        {spot.name}
                        {spot.is_brunch && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                        {spot.is_hotspot && <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 flex-shrink-0" />}
                        {spot.is_loved && <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 flex-shrink-0" />}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[spot.category, spot.price_range].filter(Boolean).join(' · ') || 'No location'}
                        {spot.lat == null || spot.lng == null ? ' · ⚠ no coords' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleStatus(spot)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        spot.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${spot.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                      {spot.status === 'active' ? 'Live' : 'Draft'}
                    </button>
                    <button onClick={() => openEdit(spot)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(spot.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
