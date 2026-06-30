import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Created lazily so a missing env var returns a clear message instead of a
  // module-load crash (opaque 500). Vercel env vars are scoped per environment,
  // so this key must be set for Preview as well as Production.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: 'Image upload is not configured for this environment (missing SUPABASE_SERVICE_ROLE_KEY).' });
  }
  const supabase = createClient('https://qnalvzgqrfjbuoqsffbs.supabase.co', serviceKey);

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const { fileData, fileName, fileType } = req.body;
  if (!fileData || !fileName || !fileType) {
    return res.status(400).json({ error: 'Missing fileData, fileName, or fileType' });
  }

  const buffer = Buffer.from(fileData, 'base64');
  const ext = fileName.split('.').pop();
  const path = `experiences/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('perks-images')
    .upload(path, buffer, { contentType: fileType, upsert: true });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabase.storage.from('perks-images').getPublicUrl(path);
  return res.status(200).json({ url: data.publicUrl });
}
