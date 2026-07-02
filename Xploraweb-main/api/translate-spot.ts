import { generateObject } from 'ai';
import { z } from 'zod';

const RequestSchema = z.object({
  name: z.string().max(200),
  description: z.string().max(2000),
});

const ResultSchema = z.object({
  name_fr: z.string(),
  description_fr: z.string(),
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
  const { name, description } = parsed.data;
  if (!name.trim() && !description.trim()) {
    return res.status(400).json({ error: 'A name or description is required.' });
  }

  try {
    const result = await generateObject({
      model: 'anthropic/claude-haiku-4.5',
      schema: ResultSchema,
      prompt: `Translate this Québec City tourist spot listing from English to French (Québécois French, natural tone used in local tourism copy). Keep proper nouns and place names as-is. If a field is empty, return an empty string for it.

Name: ${name || '(none)'}
Description: ${description || '(none)'}`,
    });
    return res.status(200).json(result.object);
  } catch (err: any) {
    return res.status(502).json({ error: 'Translation failed. Please try again.' });
  }
}
