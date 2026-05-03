import { XploraLogo } from './XploraLogo';
import NewsletterSignup from './NewsletterSignup';

export function Footer() {
  return (
    <div>
      {/* Join Us Section */}
      <div className="bg-muted/30 border-t border-border py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl mb-3">Join Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Partner with Xplora to showcase your venue, host exclusive events, or offer special perks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-6 border border-border text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg mb-2">Curated Experiences</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Feature your venue in our curated itineraries
              </p>
              <a
                href="mailto:partners@xplora.com?subject=Curated Experience Partnership"
                className="text-sm text-primary hover:underline"
              >
                Get in touch →
              </a>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border text-center">
              <div className="text-3xl mb-3">🍷</div>
              <h3 className="text-lg mb-2">Host a 5à7</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Host exclusive meetup events for our community
              </p>
              <a
                href="mailto:events@xplora.com?subject=5à7 Event Partnership"
                className="text-sm text-primary hover:underline"
              >
                Learn more →
              </a>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border text-center">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="text-lg mb-2">Offer Perks</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Give Xplora members exclusive deals and access
              </p>
              <a
                href="mailto:perks@xplora.com?subject=Perks Partnership"
                className="text-sm text-primary hover:underline"
              >
                Partner with us →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-muted/20 border-t border-border py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl mb-3">Stay in the Loop</h2>
          <p className="text-muted-foreground mb-6">
            Get curated Quebec experiences, exclusive deals, and community events delivered to your inbox.
          </p>
          <NewsletterSignup />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <XploraLogo variant="icon" className="h-8 w-8 rounded-full" />
              <span className="text-sm text-muted-foreground">© 2026 Xplora. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
