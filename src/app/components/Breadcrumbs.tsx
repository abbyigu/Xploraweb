import { Link, useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { useExperiences } from '../hooks/useExperiences';

type Crumb = { label: string; href?: string };

function useCrumbs(): Crumb[] {
  const { pathname } = useLocation();
  const { experiences } = useExperiences();

  if (pathname === '/') return [];

  const segments = pathname.split('/');

  if (pathname.startsWith('/experience/') && segments[2]) {
    const id = segments[2];
    const exp = experiences.find(e => String(e.id) === id);
    return [
      { label: 'Experiences', href: '/itinerary' },
      { label: exp?.name ?? 'Experience' },
    ];
  }

  if (pathname.startsWith('/host/') && segments[2]) {
    return [
      { label: 'Hosts' },
    ];
  }

  const map: Record<string, Crumb[]> = {
    '/itinerary':           [{ label: 'Experiences' }],
    '/about':               [{ label: 'About' }],
    '/members':             [{ label: 'Perks' }],
    '/cart':                [{ label: 'Cart' }],
    '/account':             [{ label: 'Account' }],
    '/membership':          [{ label: 'Membership' }],
    '/business':            [{ label: 'For Businesses' }],
    '/business/dashboard':  [{ label: 'For Businesses', href: '/business' }, { label: 'Dashboard' }],
    '/business/signup':     [{ label: 'For Businesses', href: '/business' }, { label: 'Sign Up' }],
    '/privacy':             [{ label: 'Privacy Policy' }],
    '/terms':               [{ label: 'Terms' }],
  };

  return map[pathname] ?? [{ label: pathname.replace('/', '') }];
}

export function Breadcrumbs() {
  const crumbs = useCrumbs();
  if (!crumbs.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:block bg-muted/30 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-2 flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            {crumb.href
              ? <Link to={crumb.href} className="hover:text-foreground transition-colors">{crumb.label}</Link>
              : <span className="text-foreground font-medium">{crumb.label}</span>
            }
          </span>
        ))}
      </div>
    </nav>
  );
}
