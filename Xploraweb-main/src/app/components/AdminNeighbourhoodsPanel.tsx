import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NeighbourhoodMap, type MapState } from './NeighbourhoodMap';

const BLANK_MAP: MapState = { lat: null, lng: null, boundary: null };

const BLANK = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  cover_image_url: '',
  sort_order: 0,
  status: 'active' as 'active' | 'draft',
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const SQL = `CREATE TABLE neighbourhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  tagline text DEFAULT '',
  description text DEFAULT '',
  cover_image_url text DEFAULT '',
  latitude numeric,
  longitude numeric,
  boundary jsonb,
  sort_order integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE neighbourhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON neighbourhoods
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admin all" ON neighbourhoods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );`;

export function AdminNeighbourhoodsPanel() {
  const [rows, setRows] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [mapState, setMapState] = useState<MapState>({ ...BLANK_MAP });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [tableReady, setTableReady] = useState<boolean | null>(null);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  async function load() {
    const { data, error: err } = await supabase
      .from('neighbourhoods')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err?.code === '42P01') { setTableReady(false); return; }
    setTableReady(true);
    if (data) setRows(data);
  }

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ ...BLANK });
    setMapState({ ...BLANK_MAP });
    setEditing(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (row: any) => {
    setForm({
      name: row.name || '',
      slug: row.slug || '',
      tagline: row.tagline || '',
      description: row.description || '',
      cover_image_url: row.cover_image_url || '',
      sort_order: row.sort_order ?? 0,
      status: row.status || 'active',
    });
    setMapState({
      lat: row.latitude ?? null,
      lng: row.longitude ?? null,
      boundary: row.boundary ?? null,
    });
    setEditing(row.id);
    setError('');
    setShowForm(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: editing ? f.slug : toSlug(name) }));
  };

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || toSlug(form.name),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      cover_image_url: form.cover_image_url.trim(),
      sort_order: Number(form.sort_order) || 0,
      status: form.status,
      latitude: mapState.lat,
      longitude: mapState.lng,
      boundary: mapState.boundary,
    };

    const { error: err } = editing
      ? await supabase.from('neighbourhoods').update(payload).eq('id', editing)
      : await supabase.from('neighbourhoods').insert(payload);

    setSaving(false);
    if (err) { setError(err.message); return; }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await supabase.from('neighbourhoods').delete().eq('id', id);
    load();
  }

  if (tableReady === false) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-medium text-amber-800">Neighbourhoods table not found</p>
        <p className="text-xs text-amber-700">Run this SQL in your Supabase dashboard under SQL Editor:</p>
        <pre className="bg-amber-100 rounded-xl p-4 text-xs text-amber-900 overflow-x-auto whitespace-pre-wrap">{SQL}</pre>
        <button onClick={load} className="px-4 py-2 bg-amber-800 text-white rounded-xl text-sm hover:opacity-90 transition">
          Retry after running SQL
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg">Neighbourhoods</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Manage the neighbourhoods shown in the app and on the landing page.</p>
        </div>
        {!showForm && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#12343B] text-white rounded-xl text-sm hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Add neighbourhood
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold">{editing ? 'Edit neighbourhood' : 'New neighbourhood'}</h4>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Name *</label>
              <input
                value={form.name}
                onChange={handleNameChange}
                placeholder="Old Port"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Slug</label>
              <input
                value={form.slug}
                onChange={set('slug')}
                placeholder="old-port"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tagline</label>
            <input
              value={form.tagline}
              onChange={set('tagline')}
              placeholder="History & waterfront"
              className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-[11px] text-muted-foreground">Short line shown under the neighbourhood name on cards.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="A longer description shown on the neighbourhood detail page…"
              className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Cover image URL</label>
            <input
              value={form.cover_image_url}
              onChange={set('cover_image_url')}
              placeholder="https://…"
              className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl" />
            )}
          </div>

          {/* Map */}
          <NeighbourhoodMap value={mapState} onChange={setMapState} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Sort order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={set('sort_order')}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={set('status')}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#12343B] text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : saved ? <Check className="w-4 h-4" /> : null}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save neighbourhood'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {rows.length === 0 && !showForm ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
          <p className="text-sm text-muted-foreground">No neighbourhoods yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(row => (
            <div key={row.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              {row.cover_image_url ? (
                <img src={row.cover_image_url} alt={row.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-muted flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{row.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {row.status}
                  </span>
                  {row.latitude && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">📍 pinned</span>
                  )}
                  {row.boundary && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 font-medium">⬡ boundary</span>
                  )}
                </div>
                {row.tagline && <p className="text-xs text-muted-foreground mt-0.5">{row.tagline}</p>}
                <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">/{row.slug}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(row.id, row.name)} className="p-2 rounded-lg hover:bg-red-50 transition text-muted-foreground hover:text-red-500" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
