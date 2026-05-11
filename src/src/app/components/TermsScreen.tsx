import { SimpleFooter } from './SimpleFooter';

export function TermsScreen() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/20 to-transparent px-6 md:px-8 pt-12 pb-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Xplora</p>
          <h1 className="text-3xl md:text-4xl">Terms of Service</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: May 8, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 space-y-10 text-sm leading-relaxed text-foreground">

        <section className="space-y-3">
          <p className="text-muted-foreground">
            These Terms of Service govern your use of Xplora (goxplora.ca), operated by Club Horizon, Québec City, QC. By creating an account or using the platform, you agree to these terms. If you do not agree, do not use Xplora.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">1. Your account</h2>
          <p className="text-muted-foreground">
            You must be 18 years or older to create an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. Notify us immediately at{' '}
            <a href="mailto:hello@goxplora.ca" className="text-primary underline underline-offset-2">hello@goxplora.ca</a>{' '}
            if you suspect unauthorized access.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">2. Experiences and bookings</h2>
          <p className="text-muted-foreground">
            Xplora offers curated experiences in Québec City. By booking an experience, you agree to the following:
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>Bookings are confirmed upon successful payment.</li>
            <li>Cancellations made more than 48 hours before the experience start time are eligible for a full refund.</li>
            <li>Cancellations within 48 hours of the start time are non-refundable.</li>
            <li>If Xplora cancels an experience, you will receive a full refund or credit toward a future booking.</li>
            <li>Self-guided (Xplorators) routes are free and require no booking.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">3. Membership</h2>
          <p className="text-muted-foreground">
            Xplora Membership is a recurring subscription billed monthly ($10/month) or annually ($100/year). By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel.
          </p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>You may cancel your membership at any time from your account settings.</li>
            <li>Cancellation takes effect at the end of the current billing period — you retain access until then.</li>
            <li>Membership benefits (early access, guest pass, 5 à 7 invites) are subject to availability and may change with reasonable notice.</li>
            <li>We do not offer prorated refunds for partial billing periods.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">4. Business accounts</h2>
          <p className="text-muted-foreground">
            Businesses may list perks and experiences on Xplora. By submitting a listing, you confirm that you have the right to offer the described perk or experience, that all information is accurate, and that you will honour what is listed. Xplora reserves the right to remove listings that are misleading, unavailable, or inconsistent with our standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">5. Acceptable use</h2>
          <p className="text-muted-foreground">You agree not to:</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Use Xplora for any unlawful purpose.</li>
            <li>Attempt to gain unauthorized access to any part of the platform.</li>
            <li>Scrape, copy, or redistribute content without permission.</li>
            <li>Post false, misleading, or abusive content.</li>
            <li>Interfere with the integrity or performance of the platform.</li>
          </ul>
          <p className="text-muted-foreground">We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">6. Intellectual property</h2>
          <p className="text-muted-foreground">
            All content on Xplora — including text, design, logos, and curated routes — is owned by or licensed to Club Horizon. You may not reproduce, distribute, or create derivative works from our content without written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">7. Limitation of liability</h2>
          <p className="text-muted-foreground">
            Xplora is provided "as is." To the extent permitted by law, Club Horizon is not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, personal injury during an experience, or disputes with third-party businesses.
          </p>
          <p className="text-muted-foreground">
            Our total liability for any claim related to Xplora will not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">8. Governing law</h2>
          <p className="text-muted-foreground">
            These terms are governed by the laws of the Province of Québec and the federal laws of Canada applicable therein. Any disputes will be resolved in the courts of Québec City, QC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">9. Changes to these terms</h2>
          <p className="text-muted-foreground">
            We may update these terms from time to time. We will notify you of material changes by email or in-app notice. Continued use of Xplora after changes are posted means you accept the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">10. Contact</h2>
          <p className="text-muted-foreground">
            Questions about these terms?{' '}
            <a href="mailto:hello@goxplora.ca" className="text-primary underline underline-offset-2">hello@goxplora.ca</a>
            <br />
            Xplora · Club Horizon · Québec City, QC, Canada
          </p>
        </section>

      </div>

      <SimpleFooter />
    </div>
  );
}
