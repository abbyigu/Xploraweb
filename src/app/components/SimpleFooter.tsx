import { XploraLogo } from './XploraLogo';

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export function SimpleFooter() {
  return (
    <div className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <XploraLogo variant="icon" className="h-8 w-8 rounded-full" />
            <span className="text-sm text-muted-foreground">© 2026 Xplora. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Join Us</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <a href="https://www.instagram.com/goxplora.qc" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <InstagramIcon />
              @goxplora.qc
            </a>
            <a href="https://www.facebook.com/profile.php?id=61589277074215" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <FacebookIcon />
              Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
