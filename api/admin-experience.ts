import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', 'https://goxplora.ca');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verify the caller is an admin
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return res.status(403).json({ error: 'Admin only' });

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('xplora_experiences')
      .insert(req.body)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }

  if (req.method === 'PUT') {
    const { id, ...payload } = req.body;
    const { data, error } = await supabase
      .from('xplora_experiences')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await supabase
      .from('xplora_experiences')
      .delete()
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
