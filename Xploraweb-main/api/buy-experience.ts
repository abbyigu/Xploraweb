import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { experienceId, userId, customerEmail, successUrl, cancelUrl } = req.body;

    // Load the experience and the business's Connect account
    const { data: exp, error: expError } = await supabase
      .from('business_perks')
      .select('*, profiles!business_id(stripe_connect_account_id, email)')
      .eq('id', experienceId)
      .single();

    if (expError || !exp) return res.status(404).json({ error: 'Experience not found' });
    if (exp.spots_remaining !== null && exp.spots_remaining <= 0) {
      return res.status(400).json({ error: 'No spots remaining' });
    }

    const connectAccountId = (exp.profiles as any)?.stripe_connect_account_id;
    if (!connectAccountId) {
      return res.status(400).json({ error: 'Business has not connected Stripe yet' });
    }

    const amountCents = exp.price_cents;
    const platformFee = Math.round(amountCents * 0.2); // 20%

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'cad',
          unit_amount: amountCents,
          product_data: {
            name: exp.title,
            description: exp.description || undefined,
          },
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: { destination: connectAccountId },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: {
        type: 'experience',
        experienceId,
        userId: userId || '',
        businessId: exp.business_id,
        businessEmail: (exp.profiles as any)?.email || '',
        businessName: exp.business_name,
        experienceTitle: exp.title,
        address: exp.address || '',
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
