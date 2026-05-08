// v2
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EXPERIENCE_CATEGORIES } from '../data/products';

const BLANK = {
  name: '', description: '', long_description: '', price_cents: 0,
  duration: '', spots: '', difficulty: 'Easy',
  category: 'xplorators', badge: '', meeting_point: '',
  host_name: '', host_bio: '',
  highlights: '', includes: '', to_bring: '', languages: 'English, Français',
  itinerary: '', neighbourhood: '', vibes: '',
};

export function AdminExperiencePanel() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('xplora_experiences')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setExperiences(data);
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
    const ext = file.name.split('.').pop();
    const path = `experiences/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('perks-images').upload(path, file, { upsert: true });
    if (error) return { url: null, error: error.message };
    return { url: supabase.storage.from('perks-images').getPublicUrl(path).data.publicUrl, error: null };
  }

  const openNew = () => { setForm({ ...BLANK }); setEditing(null); setImageFile(null); setImagePreview(''); setShowForm(true); };
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
      neighbourhood: exp.neighbourhood || '',
      vibes: (exp.vibes || []).join(', '),
    });
    setEditing(exp.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    let imageUrl: string | null = imagePreview && !imageFile ? imagePreview : null;
    if (imageFile) {
      const result = await uploadImage(imageFile);
      if (result.error) {
        setError(`Image upload failed: ${result.error}`);
        setSaving(false);
        return;
      }
      imageUrl = result.url;
    }
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
      itinerary: form.itinerary ? form.itinerary.split('\n').map(s => s.trim()).filter(Boolean) : null,
      neighbourhood: form.neighbourhood || null,
      vibes: form.vibes ? form.vibes.split(',').map(s => s.trim()).filter(Boolean) : null,
    };

    let dbError: any;
    if (editing) {
      ({ error: dbError } = await supabase.from('xplora_experiences').update(payload).eq('id', editing));
    } else {
      ({ error: dbError } = await supabase.from('xplora_experiences').insert({ ...payload, status: 'active' }));
    }
    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setEditing(null); }, 1200);
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
          <p className="text-xs text-muted-foreground">{experiences.length} in database · static placeholders always shown</p>
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
            <h4 className="font-medium">{editing ? 'Edit Experience' : 'New Experience'}</h4>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Name *</label>
              <input value={form.name} onChange={set('name')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Experience name" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Short description <span className="text-primary">— shown on home page cards</span></label>
              <input value={form.description} onChange={set('description')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="One-liner shown on card (e.g. Bagels, hidden stories & neighbourhood wandering)" />
            </div>

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

            <div>
              <label className="text-xs text-muted-foreground">Neighbourhood</label>
              <input value={form.neighbourhood} onChange={set('neighbourhood')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Saint-Roch, Limoilou" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">What's your vibe? — comma-separated</label>
              <input value={form.vibes} onChange={set('vibes')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. cozy, adventurous, foodie, romantic, hidden gem" />
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

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Full description <span className="text-muted-foreground/60">— shown on detail page only, not on cards</span></label>
              <textarea value={form.long_description} onChange={set('long_description')} rows={4} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Full experience description (separate paragraphs with a blank line)" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Highlights — one per line</label>
              <textarea value={form.highlights} onChange={set('highlights')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Free & self-guided&#10;Curated stop list&#10;Go at your own pace" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Itinerary stops — one per line</label>
              <textarea value={form.itinerary} onChange={set('itinerary')} rows={5} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Place des Arts — Start at the open-air gallery in Saint-Roch&#10;Rue Saint-Joseph — Walk the main creative artery&#10;Escalier Casse-Cou — Oldest staircase in North America" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">What's included — one per line</label>
              <textarea value={form.includes} onChange={set('includes')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Digital map&#10;Guide PDF" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">What to bring — one per line</label>
              <textarea value={form.to_bring} onChange={set('to_bring')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Comfortable shoes&#10;Camera" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Meeting point</label>
              <input value={form.meeting_point} onChange={set('meeting_point')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Address or description" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Languages (comma-separated)</label>
              <input value={form.languages} onChange={set('languages')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="English, Français" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Host name</label>
              <input value={form.host_name} onChange={set('host_name')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Your name" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Host bio</label>
              <input value={form.host_bio} onChange={set('host_bio')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Short bio" />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !form.name}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Experience'}
          </button>
        </div>
      )}

      {/* List */}
      {experiences.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground py-4 text-center">No experiences added yet. Click "Add Experience" to start.</p>
      )}
      <div className="space-y-2">
        {experiences.map(exp => (
          <div key={exp.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{exp.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {EXPERIENCE_CATEGORIES.find(c => c.id === exp.category)?.name || exp.category} · {exp.price_cents === 0 ? 'Free' : `$${(exp.price_cents / 100).toFixed(0)}`}
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
    </div>
  );
}
