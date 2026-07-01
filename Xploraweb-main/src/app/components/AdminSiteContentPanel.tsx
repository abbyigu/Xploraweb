import { useState, useEffect } from 'react';
import { Upload, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadViaApi } from '../lib/uploadImage';
import { SITE_CONTENT_DEFAULTS } from '../hooks/useSiteContent';

const SQL = `CREATE TABLE site_content (
  id text PRIMARY KEY DEFAULT 'homepage',
  banner_enabled boolean DEFAULT true,
  banner_text text DEFAULT '',
  hero_headline text DEFAULT '',
  hero_subheadline text DEFAULT '',
  hero_cta_label text DEFAULT '',
  hero_image_url text DEFAULT '',
  itinerary_paywalled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON site_content
  FOR SELECT USING (true);

CREATE POLICY "Admin all" ON site_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );`;

const BLANK = {
  banner_enabled: SITE_CONTENT_DEFAULTS.bannerEnabled,
  banner_text: SITE_CONTENT_DEFAULTS.bannerText,
  hero_headline: SITE_CONTENT_DEFAULTS.heroHeadline,
  hero_subheadline: SITE_CONTENT_DEFAULTS.heroSubheadline,
  hero_cta_label: SITE_CONTENT_DEFAULTS.heroCtaLabel,
  hero_image_url: SITE_CONTENT_DEFAULTS.heroImageUrl,
  itinerary_paywalled: SITE_CONTENT_DEFAULTS.itineraryPaywalled,
};

export function AdminSiteContentPanel() {
  const [form, setForm] = useState({ ...BLANK });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tableReady, setTableReady] = useState<boolean | null>(null);

  const set = (key: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  async function load() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('site_content')
      .select('*')
      .eq('id', 'homepage')
      .maybeSingle();
    if (err?.code === '42P01') { setTableReady(false); setLoading(false); return; }
    setTableReady(true);
    if (data) {
      setForm({
        banner_enabled: data.banner_enabled ?? BLANK.banner_enabled,
        banner_text: data.banner_text || BLANK.banner_text,
        hero_headline: data.hero_headline || BLANK.hero_headline,
        hero_subheadline: data.hero_subheadline || BLANK.hero_subheadline,
        hero_cta_label: data.hero_cta_label || BLANK.hero_cta_label,
        hero_image_url: data.hero_image_url || BLANK.hero_image_url,
        itinerary_paywalled: data.itinerary_paywalled ?? BLANK.itinerary_paywalled,
      });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    const { url, error: uploadError } = await uploadViaApi(file);
    setUploading(false);
    if (uploadError || !url) { setError(`Image upload failed: ${uploadError || 'unknown error'}`); return; }
    setForm(f => ({ ...f, hero_image_url: url }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('site_content').upsert({ id: 'homepage', ...form });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (tableReady === false) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-medium text-amber-800">Site content table not found</p>
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
      <div>
        <h3 className="text-lg">Site Content</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Edit the homepage hero and the top announcement banner without touching code.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-semibold">Announcement banner</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Show banner</p>
            <p className="text-[11px] text-muted-foreground">Displays a bar at the very top of every page.</p>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, banner_enabled: !f.banner_enabled }))}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.banner_enabled ? 'bg-secondary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.banner_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Banner text</label>
          <input
            value={form.banner_text}
            onChange={set('banner_text')}
            placeholder={SITE_CONTENT_DEFAULTS.bannerText}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-semibold">Homepage hero</h4>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Headline</label>
          <textarea
            value={form.hero_headline}
            onChange={set('hero_headline')}
            rows={2}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <p className="text-[11px] text-muted-foreground">A line break here starts a new line on the page.</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Subheadline</label>
          <textarea
            value={form.hero_subheadline}
            onChange={set('hero_subheadline')}
            rows={2}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Button label</label>
          <input
            value={form.hero_cta_label}
            onChange={set('hero_cta_label')}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Background image</label>
          <div className="flex gap-2">
            <input
              value={form.hero_image_url}
              onChange={set('hero_image_url')}
              placeholder="https:// or upload a file"
              className="flex-1 min-w-0 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <label className={`flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm whitespace-nowrap cursor-pointer hover:bg-muted transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              {uploading
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Upload'}
            </label>
          </div>
          {form.hero_image_url && (
            <img src={form.hero_image_url} alt="preview" className="mt-2 w-full h-40 object-cover rounded-xl" />
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-semibold">Xperience page</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Paywall this page</p>
            <p className="text-[11px] text-muted-foreground">Visitors see a "join to unlock" teaser instead of the experience list. Membership status isn't checked yet — this hides the page for everyone until real access checks are built.</p>
          </div>
          <button
            onClick={() => setForm(f => ({ ...f, itinerary_paywalled: !f.itinerary_paywalled }))}
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.itinerary_paywalled ? 'bg-secondary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.itinerary_paywalled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-500 space-y-1">
          <p>{error}</p>
          {error.includes('itinerary_paywalled') && (
            <p className="text-muted-foreground">Run this in Supabase SQL Editor: <code className="bg-muted px-1 rounded">ALTER TABLE site_content ADD COLUMN IF NOT EXISTS itinerary_paywalled boolean DEFAULT false;</code></p>
          )}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#12343B] text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : saved ? <Check className="w-4 h-4" /> : null}
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
      </button>
    </div>
  );
}
