import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-[#0d2328] text-white pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="overflow-hidden mb-3" style={{ width: 178, height: 46 }}>
              <img
                src="/goxplora-logo.png"
                alt="GoXplora"
                style={{ height: 100, marginTop: -24, marginLeft: -10, mixBlendMode: 'screen', filter: 'invert(1) hue-rotate(180deg) brightness(1.6)' }}
              />
            </div>
            <p className="text-sm text-white/50 leading-relaxed">Self-guided neighbourhood walks in Québec City.</p>
            <div className="flex gap-3 mt-5">
              <a href="https://www.instagram.com/goxplora.qc" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.851s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.516 2.497 5.783 2.226 7.15 2.163 8.416 2.105 8.796 2.163 12 2.163zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61589277074215" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Explore</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/itinerary" className="hover:text-white transition">Neighbourhoods</Link></li>
              <li><Link to="/itinerary" className="hover:text-white transition">Walks</Link></li>
              <li><Link to="/itinerary" className="hover:text-white transition">Map view</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Company</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#about" className="hover:text-white transition">About us</a></li>
              <li><Link to="/business" className="hover:text-white transition">For businesses</Link></li>
              <li><a href="mailto:hello@goxplora.ca" className="hover:text-white transition">Contact us</a></li>
              <li><a href="mailto:press@goxplora.ca" className="hover:text-white transition">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Legal</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of service</Link></li>
              <li><a href="#" className="hover:text-white transition">Cookie policy</a></li>
              <li><a href="#" className="hover:text-white transition">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/10 pt-6 flex items-center justify-center">
          <p className="text-xs text-white/40">© 2026 GoXplora · Québec City, QC</p>
        </div>
      </div>
    </footer>
  );
}
