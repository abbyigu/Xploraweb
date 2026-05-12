import { Tag, Lock, Check, MapPin, Coffee, UtensilsCrossed, Palette, Music } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTranslation } from 'react-i18next';

export function DealsScreen() {
  const { t } = useTranslation();
  const deals = [
    {
      id: 1,
      title: "20% Off Artisanal Coffee",
      business: "Café Névé",
      description: "Premium single-origin coffee and pastries",
      discount: "20% OFF",
      image: "https://images.unsplash.com/photo-1774758959178-094de5122e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      category: "Food & Drink",
      icon: Coffee,
      unlocked: true,
      location: "1234 St-Laurent Blvd",
    },
    {
      id: 2,
      title: "Free Appetizer",
      business: "Le Bistro Local",
      description: "With any main course purchase",
      discount: "FREE",
      image: "https://images.unsplash.com/photo-1758346970392-4e9e1031d58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      category: "Food & Drink",
      icon: UtensilsCrossed,
      unlocked: true,
      location: "5678 Rue Saint-Denis",
    },
    {
      id: 3,
      title: "Gallery Entry Included",
      business: "Modern Art Space",
      description: "Contemporary exhibitions and installations",
      discount: "INCLUDED",
      image: "https://images.unsplash.com/photo-1628269797237-3338449ecd9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      category: "Culture",
      icon: Palette,
      unlocked: false,
      location: "Mile End District",
      requirement: "Complete 3 itineraries to unlock",
    },
    {
      id: 4,
      title: "Happy Hour Special",
      business: "Le Perché Rooftop",
      description: "50% off cocktails 5-7 PM",
      discount: "50% OFF",
      image: "https://images.unsplash.com/photo-1597672468179-aa540e33bf5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      category: "Food & Drink",
      icon: Coffee,
      unlocked: false,
      location: "Downtown",
      requirement: "Attend 1 meetup to unlock",
    },
    {
      id: 5,
      title: "Live Music Night",
      business: "Jazz Corner",
      description: "Complimentary entry to live performances",
      discount: "FREE ENTRY",
      image: "https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
      category: "Entertainment",
      icon: Music,
      unlocked: false,
      location: "Old Quebec",
      requirement: "Complete 5 itineraries to unlock",
    },
  ];

  const unlockedDeals = deals.filter(d => d.unlocked);
  const lockedDeals = deals.filter(d => !d.unlocked);

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-secondary text-secondary-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl mb-1">{t('deals.title')}</h1>
              <p className="text-sm md:text-base opacity-90">{t('deals.subtitle')}</p>
            </div>
            <div className="md:hidden w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <XploraLogo variant="icon" className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex items-center justify-between max-w-2xl">
            <div>
              <p className="text-sm md:text-base opacity-90">{t('deals.active')}</p>
              <p className="text-2xl md:text-3xl font-serif">{unlockedDeals.length}</p>
            </div>
            <div>
              <p className="text-sm md:text-base opacity-90">{t('deals.toUnlock')}</p>
              <p className="text-2xl md:text-3xl font-serif">{lockedDeals.length}</p>
            </div>
            <Tag className="w-10 h-10 md:w-12 md:h-12 opacity-50" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
        {unlockedDeals.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl mb-4 md:mb-6">{t('deals.available')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {unlockedDeals.map((deal) => {
                const Icon = deal.icon;
                return (
                  <div
                    key={deal.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
                  >
                    <div className="relative h-40">
                      <ImageWithFallback
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        {t('deals.unlocked')}
                      </div>
                      <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm">
                        {deal.discount}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg mb-0.5">{deal.title}</h3>
                          <p className="text-sm text-secondary">{deal.business}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {deal.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {deal.location}
                        </div>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:opacity-90 transition-opacity">
                          {t('deals.redeem')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {lockedDeals.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl mb-4 md:mb-6">{t('deals.comingSoon')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {lockedDeals.map((deal) => {
                const Icon = deal.icon;
                return (
                  <div
                    key={deal.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border opacity-75"
                  >
                    <div className="relative h-40">
                      <ImageWithFallback
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-full object-cover grayscale"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm">
                        {deal.discount}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg mb-0.5">{deal.title}</h3>
                          <p className="text-sm text-muted-foreground">{deal.business}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {deal.description}
                      </p>
                      <div className="bg-muted rounded-lg p-3 text-sm text-center">
                        🔒 {deal.requirement}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
