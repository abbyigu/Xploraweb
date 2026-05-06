import { Link } from 'react-router';
import { XploraLogo } from './XploraLogo';
import NewsletterSignup from './NewsletterSignup';

export function Footer() {
  return (
    <div>
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
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/business" className="hover:text-foreground transition-colors font-medium text-secondary">For Businesses</Link>
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
