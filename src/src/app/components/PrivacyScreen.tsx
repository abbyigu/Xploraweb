import { SimpleFooter } from './SimpleFooter';

export function PrivacyScreen() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/20 to-transparent px-6 md:px-8 pt-12 pb-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Xplora</p>
          <h1 className="text-3xl md:text-4xl">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: May 8, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 space-y-10 text-sm leading-relaxed text-foreground">

        <section className="space-y-3">
          <p className="text-muted-foreground">
            Xplora (operated by Club Horizon, Québec City, QC) is committed to protecting your personal information. This policy explains what we collect, how we use it, and your rights under Canada's <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA) and applicable Québec privacy law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">1. Information we collect</h2>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li><strong className="text-foreground">Account information</strong> — your name, email address, and password when you sign up.</li>
            <li><strong className="text-foreground">Profile data</strong> — your account type (explorer or business), profile photo if you upload one, and any preferences you set.</li>
            <li><strong className="text-foreground">Payment information</strong> — processed by Stripe. We never store your card number, CVV, or banking details. We receive a Stripe customer ID and subscription status only.</li>
            <li><strong className="text-foreground">Usage data</strong> — pages visited, experiences viewed, and interactions within the app, collected to improve the product.</li>
            <li><strong className="text-foreground">Communications</strong> — emails you send to us at hello@goxplora.ca.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">2. How we use your information</h2>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>To create and manage your account.</li>
            <li>To process payments and manage your membership.</li>
            <li>To send transactional emails (booking confirmations, welcome messages, receipts).</li>
            <li>To send our newsletter and event updates, only if you have opted in.</li>
            <li>To improve the app and personalize your experience.</li>
            <li>To comply with legal obligations.</li>
          </ul>
          <p className="text-muted-foreground">We do not sell your personal information to third parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">3. Third-party services</h2>
          <p className="text-muted-foreground">We use the following trusted third-party services to operate Xplora:</p>
          <div className="space-y-2">
            {[
              { name: 'Supabase', use: 'Database, authentication, and file storage. Data is hosted in Canada (AWS ca-central-1).' },
              { name: 'Stripe', use: 'Payment processing and subscription management. Stripe is PCI-DSS compliant.' },
              { name: 'Resend', use: 'Transactional and marketing email delivery.' },
              { name: 'Vercel', use: 'Application hosting and performance analytics.' },
            ].map((s) => (
              <div key={s.name} className="bg-muted/30 rounded-xl p-4">
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-muted-foreground text-sm mt-0.5">{s.use}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground">Each provider operates under their own privacy policy and security standards.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">4. Cookies and local storage</h2>
          <p className="text-muted-foreground">
            Xplora uses browser local storage to save your cart, saved itineraries, and session preferences. We use cookies only as required for authentication (Supabase session tokens) and performance monitoring (Vercel). We do not use advertising or tracking cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">5. Data retention</h2>
          <p className="text-muted-foreground">
            We retain your account data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days, except where retention is required by law or for legitimate business purposes (e.g., financial records).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">6. Your rights</h2>
          <p className="text-muted-foreground">Under PIPEDA and Québec Law 25, you have the right to:</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Access the personal information we hold about you.</li>
            <li>Correct inaccurate or incomplete information.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Withdraw consent for marketing communications at any time by unsubscribing.</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise any of these rights, email us at{' '}
            <a href="mailto:hello@goxplora.ca" className="text-primary underline underline-offset-2">hello@goxplora.ca</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">7. Security</h2>
          <p className="text-muted-foreground">
            We use industry-standard measures to protect your data, including encrypted connections (HTTPS), secure authentication, and row-level security on our database. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">8. Changes to this policy</h2>
          <p className="text-muted-foreground">
            We may update this policy from time to time. If we make material changes, we will notify you by email or by posting a notice in the app. Continued use of Xplora after changes are posted constitutes your acceptance of the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">9. Contact</h2>
          <p className="text-muted-foreground">
            Questions or concerns about this policy? Reach us at{' '}
            <a href="mailto:hello@goxplora.ca" className="text-primary underline underline-offset-2">hello@goxplora.ca</a>.
            <br />
            Xplora · Club Horizon · Québec City, QC, Canada
          </p>
        </section>

      </div>

      <SimpleFooter />
    </div>
  );
}
