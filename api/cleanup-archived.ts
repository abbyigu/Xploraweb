import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qnalvzgqrfjbuoqsffbs.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  // Verify Vercel cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

  const { error, count } = await supabase
    .from('xplora_experiences')
    .delete({ count: 'exact' })
    .eq('status', 'archived')
    .lt('archived_at', twoDaysAgo);

  if (error) {
    console.error('Cleanup error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  console.log(`Cleanup: deleted ${count} archived experience(s)`);
  return res.status(200).json({ deleted: count, ranAt: new Date().toISOString() });
}
