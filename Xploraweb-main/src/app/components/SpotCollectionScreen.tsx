import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Flame, Heart, Award } from 'lucide-react';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';
import { SpotCard } from './SpotCard';
import { useSpots } from '../hooks/useSpots';
import { useNeighbourhoods } from '../hooks/useNeighbourhoods';
import type { Spot } from '../data/products';

interface Props {
  title: string;
  subtitle: string;
  emptyMessage: string;
  icon: ReactNode;
  filter: (spot: Spot) => boolean;
  seoTitle: string;
  seoDesc: string;
  canonical: string;
}

// Shared shell for the "Hotspots" and "Places We Love" home tiles — both are
// just a filtered slice of the same spots library, admin-curated via a
// boolean flag (isHotspot / isLoved), same pattern as isBrunch.
export function SpotCollectionScreen({ title, subtitle, emptyMessage, icon, filter, seoTitle, seoDesc, canonical }: Props) {
  const navigate = useNavigate();
  const { spots, loading } = useSpots();
  const { neighbourhoods } = useNeighbourhoods();
  const slugByName = new Map(neighbourhoods.map(n => [n.name, n.slug]));

  const matches = spots.filter(filter);

  return (
    <div className="min-h-screen pb-24 md:pb-0 font-sans">
      <PageSEO title={seoTitle} description={seoDesc} canonical={canonical} />

      <section style={{ background: 'linear-gradient(to bottom, rgba(126,207,207,0.70), rgba(126,207,207,0.40))' }}>
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center">{icon}</div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight text-gray-900">{title}</h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl">{subtitle}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-8 py-10 md:py-14">
        {loading && matches.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {matches.map(spot => {
              const slug = spot.neighbourhood ? slugByName.get(spot.neighbourhood) : undefined;
              return (
                <div
                  key={spot.id}
                  onClick={slug ? () => navigate(`/neighbourhoods/${encodeURIComponent(slug)}`) : undefined}
                  className={slug ? 'cursor-pointer' : undefined}
                >
                  <SpotCard spot={spot} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export function HotspotsScreen() {
  const { t } = useTranslation();
  return (
    <SpotCollectionScreen
      title={t('hotspots.title', 'Hotspots')}
      subtitle={t('hotspots.subtitle', 'Buzzing spots our team keeps coming back to.')}
      emptyMessage={t('hotspots.empty', 'No hotspots yet — check back soon.')}
      icon={<Flame className="w-6 h-6 text-red-500" />}
      filter={spot => !!spot.isHotspot}
      seoTitle={t('hotspots.seoTitle', 'Hotspots in Québec City — Xplora')}
      seoDesc={t('hotspots.seoDesc', 'The buzzing spots our team keeps coming back to in Québec City.')}
      canonical="/hotspots"
    />
  );
}

export function MichelinScreen() {
  const { t } = useTranslation();
  return (
    <SpotCollectionScreen
      title={t('michelin.title', 'Michelin Guide')}
      subtitle={t('michelin.subtitle', 'Every spot in Québec City listed in the Michelin Guide.')}
      emptyMessage={t('michelin.empty', 'No Michelin Guide spots yet — check back soon.')}
      icon={<Award className="w-6 h-6 text-red-600" />}
      filter={spot => !!spot.michelinUrl}
      seoTitle={t('michelin.seoTitle', 'Michelin Guide spots in Québec City — Xplora')}
      seoDesc={t('michelin.seoDesc', 'Every restaurant in Québec City listed in the Michelin Guide, handpicked by Xplora.')}
      canonical="/michelin"
    />
  );
}

export function PlacesWeLoveScreen() {
  const { t } = useTranslation();
  return (
    <SpotCollectionScreen
      title={t('placesWeLove.title', 'Places We Love')}
      subtitle={t('placesWeLove.subtitle', 'Our favorite local finds, handpicked by the Xplora team.')}
      emptyMessage={t('placesWeLove.empty', 'No favorites yet — check back soon.')}
      icon={<Heart className="w-6 h-6 text-pink-500" />}
      filter={spot => !!spot.isLoved}
      seoTitle={t('placesWeLove.seoTitle', 'Places We Love in Québec City — Xplora')}
      seoDesc={t('placesWeLove.seoDesc', 'Our favorite local finds, handpicked by the Xplora team in Québec City.')}
      canonical="/loved"
    />
  );
}
