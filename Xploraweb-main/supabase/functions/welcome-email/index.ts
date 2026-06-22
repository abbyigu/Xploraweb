import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL = 'Xplora <hello@goxplora.ca>';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

function memberEmail(name: string, confirmUrl: string): string {
  const firstName = name?.split(' ')[0] || 'there';
  return `
<div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#F7F8F5;padding:40px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <img src="https://goxplora.ca/goxplora-logo.png" alt="GoXplora" style="height:56px;" />
  </div>
  <div style="background:#ffffff;border-radius:24px;padding:40px;border:1px solid #ECEEE8;">
    <h1 style="font-size:26px;color:#12343B;margin:0 0 8px;">Thanks for joining, ${firstName}!</h1>
    <p style="color:#5E7278;font-size:15px;line-height:1.6;margin:0 0 24px;">
      We're really glad you're here. Xplora is built for people who want to actually experience Québec City — not just visit it. Your account is your starting point.
    </p>
    <a href="${confirmUrl}" style="display:inline-block;background:#119FB3;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:16px;font-size:15px;font-weight:500;margin-bottom:32px;">
      Confirm my account →
    </a>
    <hr style="border:none;border-top:1px solid #ECEEE8;margin:32px 0;" />
    <h2 style="font-size:18px;color:#12343B;margin:0 0 16px;">What your account gives you</h2>
    <ul style="color:#5E7278;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
      <li>🗺️ Browse curated experiences across Québec City</li>
      <li>📍 Discover local spots in Saint-Roch, Old Port, Petit-Champlain and more</li>
      <li>🎟️ Book self-guided itineraries and Xplora Nights</li>
      <li>✨ Access exclusive perks at local venues — just for having an account</li>
      <li>💾 Save your favourite experiences and come back to them anytime</li>
    </ul>
    <hr style="border:none;border-top:1px solid #ECEEE8;margin:32px 0;" />
    <p style="color:#5E7278;font-size:14px;line-height:1.7;margin:0;">
      Want even more? <strong>Xplora memberships</strong> unlock early access to new experiences, monthly guest passes, members-only events, and insider perks at local spots. <a href="https://goxplora.ca" style="color:#119FB3;">Explore membership options at goxplora.ca</a>.
    </p>
  </div>
  <p style="text-align:center;color:#5E7278;font-size:12px;margin-top:24px;">
    Xplora · Québec City, QC · <a href="https://goxplora.ca" style="color:#119FB3;">goxplora.ca</a>
  </p>
</div>`;
}

function businessEmail(name: string, businessName: string, confirmUrl: string): string {
  const firstName = name?.split(' ')[0] || 'there';
  return `
<div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#F7F8F5;padding:40px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <img src="https://goxplora.ca/goxplora-logo.png" alt="GoXplora" style="height:56px;" />
  </div>
  <div style="background:#ffffff;border-radius:24px;padding:40px;border:1px solid #ECEEE8;">
    <h1 style="font-size:26px;color:#12343B;margin:0 0 8px;">Congratulations, ${firstName}! 🎉</h1>
    <p style="color:#5E7278;font-size:15px;line-height:1.6;margin:0 0 6px;">
      <strong>${businessName}</strong> is now part of the Xplora Partner Collective.
    </p>
    <p style="color:#5E7278;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You're joining a growing group of Québec City businesses helping locals and explorers discover the best the city has to offer. Thank you for being part of what makes this possible.
    </p>
    <a href="${confirmUrl}" style="display:inline-block;background:#119FB3;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:16px;font-size:15px;font-weight:500;margin-bottom:32px;">
      Confirm my account →
    </a>
    <hr style="border:none;border-top:1px solid #ECEEE8;margin:32px 0;" />
    <h2 style="font-size:18px;color:#12343B;margin:0 0 16px;">Your partner benefits</h2>
    <ul style="color:#5E7278;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
      <li>📣 Free listing in the Xplora perks feed — seen by all members</li>
      <li>🍸 Host your own members-only 5 à 7 at your venue</li>
      <li>📍 Featured placement in curated local itineraries</li>
      <li>🎯 Direct exposure to engaged Québec City locals and young professionals</li>
      <li>📊 Manage and update your perks anytime from your dashboard</li>
      <li>💸 Zero cost — completely free to offer a perk</li>
    </ul>
    <hr style="border:none;border-top:1px solid #ECEEE8;margin:32px 0;" />
    <h2 style="font-size:18px;color:#12343B;margin:0 0 12px;">What happens next?</h2>
    <p style="color:#5E7278;font-size:14px;line-height:1.7;margin:0;">
      1. <strong>Confirm your account</strong> using the button above.<br/>
      2. <strong>Log in</strong> to your business dashboard at <a href="https://goxplora.ca/business/login" style="color:#119FB3;">goxplora.ca/business/login</a>.<br/>
      3. <strong>Submit your perk</strong> — a discount, welcome drink, skip-the-line, anything exclusive.<br/>
      4. <strong>Go live</strong> — your offer is visible to Xplora members immediately.
    </p>
  </div>
  <p style="text-align:center;color:#5E7278;font-size:12px;margin-top:24px;">
    Questions? Reply to this email — we're happy to help.<br/>
    Xplora · Québec City, QC · <a href="https://goxplora.ca" style="color:#119FB3;">goxplora.ca</a>
  </p>
</div>`;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const user = payload?.record;

    if (!user?.email) {
      return new Response('No user email', { status: 400 });
    }

    const accountType = user.raw_user_meta_data?.account_type ?? 'member';
    const name = user.raw_user_meta_data?.name ?? '';
    const businessName = user.raw_user_meta_data?.business_name ?? 'Your Business';

    // Generate confirmation link (falls back to site URL if user is already confirmed)
    const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: user.email,
    });

    const confirmUrl = linkData?.properties?.action_link ?? 'https://goxplora.ca';

    if (accountType === 'business') {
      await sendEmail(
        user.email,
        `Welcome to Xplora Partners, ${name.split(' ')[0] || 'there'}!`,
        businessEmail(name, businessName, confirmUrl),
      );
    } else {
      await sendEmail(
        user.email,
        `Welcome to Xplora, ${name.split(' ')[0] || 'there'}!`,
        memberEmail(name, confirmUrl),
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
