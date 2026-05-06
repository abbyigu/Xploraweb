import { XploraLogo } from './XploraLogo';

export function SimpleFooter() {
  return (
    <div className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <XploraLogo variant="icon" className="h-8 w-8 rounded-full" />
            <span className="text-sm text-muted-foreground">© 2026 Xplora. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Join Us</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}
