import { getServiceClient, getUsage, resolveIdentity } from './_lib/usage';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-anon-id');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getServiceClient();
  const identity = await resolveIdentity(supabase, req);
  const usage = await getUsage(supabase, identity);

  return res.status(200).json(usage);
}
