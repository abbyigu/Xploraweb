import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { EXPERIENCE_CATEGORIES } from '../data/products';

const BLANK = {
  name: '', description: '', long_description: '', price_cents: 0,
  image_url: '', duration: '', spots: '', difficulty: 'Easy',
  category: 'xplorators', badge: '', meeting_point: '',
  host_name: '', host_bio: '',
  highlights: '', includes: '', to_bring: '', languages: 'English, Français',
};

export function AdminExperiencePanel() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const openNew = () => { setForm({ ...BLANK }); setEditing(null); setShowForm(true); };
  const openEdit = (exp: any) => {
    setForm({
      name: exp.name || '',
      description: exp.description || '',
      long_description: exp.long_description || '',
      price_cents: exp.price_cents ?? 0,
      image_url: exp.image_url || '',
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
    });
    setEditing(exp.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      long_description: form.long_description || null,
      price_cents: Number(form.price_cents),
      image_url: form.image_url || null,
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
      status: 'active',
    };

    if (editing) {
      await supabase.from('xplora_experiences').update(payload).eq('id', editing);
    } else {
      await supabase.from('xplora_experiences').insert(payload);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Name *</label>
              <input value={form.name} onChange={set('name')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Experience name" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Short description</label>
              <input value={form.description} onChange={set('description')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="One-liner shown on card" />
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

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Image URL</label>
              <input value={form.image_url} onChange={set('image_url')} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://..." />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Full description</label>
              <textarea value={form.long_description} onChange={set('long_description')} rows={4} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Full experience description (separate paragraphs with a blank line)" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground">Highlights — one per line</label>
              <textarea value={form.highlights} onChange={set('highlights')} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Free & self-guided&#10;Curated stop list&#10;Go at your own pace" />
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
