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

function generateBookingCode(): string {
  return 'XP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Club Horizon <onboarding@resend.dev>',
      to,
      subject,
      html,
    }),
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

    // --- Experience purchase ---
    if (session.metadata?.type === 'experience') {
      const {
        experienceId, userId, businessId, businessEmail,
        businessName, experienceTitle, address,
      } = session.metadata;

      const bookingCode = generateBookingCode();
      const clientEmail = session.customer_details?.email || session.customer_email || '';
      const clientName = session.customer_details?.name || 'Guest';
      const amountPaid = (session.amount_total || 0) / 100;

      // Save booking
      await supabase.from('bookings').insert({
        booking_code: bookingCode,
        experience_id: experienceId,
        user_id: userId || null,
        business_id: businessId,
        business_name: businessName,
        experience_title: experienceTitle,
        address,
        stripe_session_id: session.id,
        amount_paid_cents: session.amount_total,
        client_email: clientEmail,
        client_name: clientName,
        status: 'confirmed',
      });

      // Decrement spots
      await supabase.rpc('decrement_spots', { experience_id: experienceId });

      // Email to client
      await sendEmail(
        clientEmail,
        `Your booking is confirmed — ${experienceTitle}`,
        `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
            <h1 style="font-size:24px;margin-bottom:8px;">You're confirmed! 🎉</h1>
            <p style="color:#666;">Here's everything you need for your experience.</p>
            <div style="background:#f5f5f0;border-radius:16px;padding:24px;margin:24px 0;">
              <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Experience</p>
              <p style="font-size:20px;font-weight:600;margin:0 0 16px;">${experienceTitle}</p>
              <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Venue</p>
              <p style="font-size:16px;margin:0 0 16px;">${businessName}</p>
              ${address ? `
              <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Address</p>
              <p style="font-size:16px;margin:0 0 16px;">${address}</p>
              <a href="https://maps.google.com/?q=${encodeURIComponent(address)}" style="display:inline-block;background:#2E5B1F;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;margin-bottom:16px;">Get Directions →</a>
              ` : ''}
              <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Booking Code</p>
              <p style="font-size:28px;font-weight:700;letter-spacing:0.05em;color:#2E5B1F;margin:0;">${bookingCode}</p>
            </div>
            <p style="color:#666;font-size:14px;">Show this email (or your booking code) at the venue. Amount paid: <strong>$${amountPaid.toFixed(2)} CAD</strong></p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
            <p style="color:#999;font-size:12px;">Club Horizon by Xplora · Québec City</p>
          </div>
        `,
      );

      // Email to business
      if (businessEmail) {
        await sendEmail(
          businessEmail,
          `New booking: ${experienceTitle} — ${bookingCode}`,
          `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <h1 style="font-size:24px;margin-bottom:8px;">New booking received</h1>
              <div style="background:#f5f5f0;border-radius:16px;padding:24px;margin:24px 0;">
                <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Experience</p>
                <p style="font-size:18px;font-weight:600;margin:0 0 16px;">${experienceTitle}</p>
                <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Client</p>
                <p style="font-size:16px;margin:0 0 4px;">${clientName}</p>
                <p style="font-size:14px;color:#666;margin:0 0 16px;">${clientEmail}</p>
                <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Booking Code</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:0.05em;color:#2E5B1F;margin:0 0 16px;">${bookingCode}</p>
                <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 4px;">Amount</p>
                <p style="font-size:16px;margin:0;">$${amountPaid.toFixed(2)} CAD · Your payout: $${(amountPaid * 0.8).toFixed(2)} CAD</p>
              </div>
              <p style="color:#666;font-size:14px;">Ask the client to show their booking code <strong>${bookingCode}</strong> when they arrive.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
              <p style="color:#999;font-size:12px;">Club Horizon Partner Program · Xplora</p>
            </div>
          `,
        );
      }
    }

    // --- Subscription purchase ---
    else if (session.mode === 'subscription' && session.subscription) {
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
    }

    // --- One-time purchase ---
    else {
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

    await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: subscription.items.data[0]?.price.id,
      status: subscription.status,
      plan,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' });
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: 'canceled',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_subscription_id' });
  }

  res.status(200).json({ received: true });
}
