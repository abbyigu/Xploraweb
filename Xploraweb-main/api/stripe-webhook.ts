import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header' });

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === 'subscription' && session.subscription) {
      // Retrieve full subscription to get price/interval info
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id;
      const interval = subscription.items.data[0]?.price.recurring?.interval;
      const plan = interval === 'year' ? 'yearly' : 'monthly';

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: session.metadata?.userId || null,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: subscription.status,
        plan,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' });

      if (error) {
        console.error('Supabase subscription insert failed:', error.message);
        return res.status(500).json({ error: 'Failed to save subscription' });
      }
    } else {
      // One-time purchase — save to orders table
      const { error } = await supabase.from('orders').insert({
        stripe_session_id: session.id,
        user_id: session.metadata?.userId || null,
        customer_email: session.customer_details?.email || session.customer_email,
        amount_total: session.amount_total,
        currency: session.currency,
        status: 'completed',
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase insert failed:', error.message);
        return res.status(500).json({ error: 'Failed to save order' });
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const interval = subscription.items.data[0]?.price.recurring?.interval;
    const plan = interval === 'year' ? 'yearly' : 'monthly';

    const { error } = await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: subscription.items.data[0]?.price.id,
      status: subscription.status,
      plan,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' });

    if (error) {
      console.error('Supabase subscription update failed:', error.message);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;

    const { error } = await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: 'canceled',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' });

    if (error) {
      console.error('Supabase subscription delete failed:', error.message);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }

  res.status(200).json({ received: true });
}
