import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const RequestSchema = z.object({
  name: z.string().max(200),
  tips: z.string().max(3000).optional(),
});

const ResultSchema = z.object({
  name_fr: z.string(),
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
    return res.status(400).json({ error: 'A name or tip is required.' });
  }
  const { name, tips } = parsed.data;
  if (!name.trim() && !(tips || '').trim()) {
    return res.status(400).json({ error: 'A name or tip is required.' });
  }

  const prompt = `Translate this Québec City tourist spot listing from English to French (Québécois French, natural tone used in local tourism copy). Keep proper nouns and place names as-is. If a field is empty, return an empty string for it. The tips field is a list of insider tips, one per line — these double as the spot's description, so translate each line naturally and keep them in the same one-per-line format (same number of lines, same order).

Name: ${name || '(none)'}
Tips:
${tips || '(none)'}`;

  // Two independent Groq free-tier TPM budgets — fail fast on the primary
  // (maxRetries: 0) and fall back to the other model rather than retrying
  // the same exhausted budget, mirroring generate-itinerary.ts.
  for (const modelId of ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'] as const) {
    try {
      const result = await generateObject({
        model: groq(modelId),
        schema: ResultSchema,
        prompt,
        maxRetries: 0,
      });
      return res.status(200).json(result.object);
    } catch (err: any) {
      console.error(`translate-spot LLM call failed (${modelId}):`, err?.message || err, err?.cause || '');
    }
  }
  return res.status(502).json({ error: 'Translation failed. Please try again.' });
}
