import { useNavigate } from 'react-router';
import { MapPin, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';
import { useNeighbourhoods, type Neighbourhood } from '../hooks/useNeighbourhoods';

// Shown when the admin hasn't added any neighbourhoods yet (or the table is
// missing), so the page is never empty.
const FALLBACK: Neighbourhood[] = [
  { id: 'old-port',        name: 'Old Port',        slug: 'old-port',        tagline: 'History & waterfront',  description: '', coverImage: '/nbhd/old-port.jpeg',  sortOrder: 0, lat: null, lng: null, boundary: null },
  { id: 'saint-roch',      name: 'Saint-Roch',      slug: 'saint-roch',      tagline: 'Art, coffee & cool',    description: '', coverImage: '/nbhd/saint-roch.webp', sortOrder: 1, lat: null, lng: null, boundary: null },
  { id: 'petit-champlain', name: 'Petit-Champlain', slug: 'petit-champlain', tagline: 'Cobblestones & charm',  description: '', coverImage: '/nbhd/champlain.jpeg',  sortOrder: 2, lat: null, lng: null, boundary: null },
  { id: 'montcalm',        name: 'Montcalm',        slug: 'montcalm',        tagline: 'Parks & grand avenues', description: '', coverImage: '/nbhd/montcalm.jpg',    sortOrder: 3, lat: null, lng: null, boundary: null },
  { id: 'limoilou',        name: 'Limoilou',        slug: 'limoilou',        tagline: 'Murals & local eats',   description: '', coverImage: '/nbhd/limoilou.jpeg',  sortOrder: 4, lat: null, lng: null, boundary: null },
];

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600';

export function NeighbourhoodsScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { neighbourhoods, loading } = useNeighbourhoods();

  const list = neighbourhoods.length ? neighbourhoods : FALLBACK;

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans">
      <PageSEO
        title={t('neighbourhoods.seoTitle', 'Québec City Neighbourhoods — Xplora')}
        description={t('neighbourhoods.seoDesc', 'Explore Québec City neighbourhood by neighbourhood — from the Old Port to Saint-Roch and Limoilou. Discover curated self-guided tours and local experiences in each area.')}
        canonical="/neighbourhoods"
      />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(to bottom, rgba(126,207,207,0.70), rgba(126,207,207,0.40))' }}>
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 text-center flex flex-col items-center gap-4">
          <p className="text-xs uppercase tracking-widest text-gray-500">{t('neighbourhoods.kicker', 'Québec City')}</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight text-gray-900">
            {t('neighbourhoods.title', 'Explore by neighbourhood')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl">
            {t('neighbourhoods.subtitle', 'Every corner of the city has its own character. Pick a neighbourhood to see the experiences waiting there.')}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14">
        {loading && neighbourhoods.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {list.map(n => (
              <button
                key={n.id}
                onClick={() => navigate(`/neighbourhoods/${encodeURIComponent(n.slug || n.id)}`)}
                className="group text-left rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img
                    src={n.coverImage || DEFAULT_IMG}
                    alt={n.name}
                    onError={e => { if (e.currentTarget.src !== DEFAULT_IMG) e.currentTarget.src = DEFAULT_IMG; }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-lg leading-tight flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 flex-shrink-0" /> {n.name}
                    </p>
                    {n.tagline && <p className="text-white/80 text-sm mt-0.5">{n.tagline}</p>}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <span className="text-sm text-[#12343B] font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t('neighbourhoods.discover', 'Discover')}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
