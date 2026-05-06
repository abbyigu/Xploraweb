import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { items, successUrl, cancelUrl, userId, customerEmail } = req.body;

    const lineItems = items.map((item: {
      name: string; description: string; price: number; quantity: number; image?: string;
    }) => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: item.name,
          description: item.description,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata: { userId: userId || '' },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
