import { generateObject } from 'ai';
import { z } from 'zod';

const RequestSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(2000),
  tips: z.string().max(3000).optional(),
});

const ResultSchema = z.object({
  name_fr: z.string(),
  description_fr: z.string(),
  tips_fr: z.string(),
});

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'A name or description is required.' });
  }
  const { name, description, tips } = parsed.data;
  if (!name.trim() && !description.trim() && !(tips || '').trim()) {
    return res.status(400).json({ error: 'A name, description, or tip is required.' });
  }

  try {
    const result = await generateObject({
      model: 'anthropic/claude-haiku-4.5',
      schema: ResultSchema,
      prompt: `Translate this Québec City tourist spot listing from English to French (Québécois French, natural tone used in local tourism copy). Keep proper nouns and place names as-is. If a field is empty, return an empty string for it. The tips field is a list of insider tips, one per line — translate each line and keep them in the same one-per-line format (same number of lines, same order).

Name: ${name || '(none)'}
Description: ${description || '(none)'}
Tips:
${tips || '(none)'}`,
    });
    return res.status(200).json(result.object);
  } catch (err: any) {
    return res.status(502).json({ error: 'Translation failed. Please try again.' });
  }
}
