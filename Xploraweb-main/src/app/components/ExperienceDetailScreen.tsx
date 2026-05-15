import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, Users, MapPin, ChevronLeft, Globe, Check, ShoppingCart, Star, RotateCcw, ChevronLeft as Prev, ChevronRight as Next } from 'lucide-react';
import { useExperiences } from '../hooks/useExperiences';
import { useCart } from '../context/CartContext';
import { SimpleFooter } from './SimpleFooter';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';
import { analytics } from '../lib/analytics';
import { supabase } from '../lib/supabase';

interface Testimonial {
  rating: number;
  comment: string;
  reviewer_name: string | null;
}

const CAT_TYPE_LABEL: Record<string, string> = {
  xplorators: 'Self-guided walk',
  xploratorsplus: 'Premium route',
  xploratours: 'Guided tour',
  xploranights: 'Evening event',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${rating >= s ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} aria-hidden="true" />
      ))}
    </div>
  );
}

export function ExperienceDetailScreen() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { experiences, loading: expLoading } = useExperiences();
  const exp = experiences.find(e => e.id === id);
  const { addItem, items } = useCart();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (exp) analytics.viewItem({ id: exp.id, name: exp.name, price: exp.price, category: exp.category });
  }, [exp?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!id) return;
    supabase
      .from('experience_reviews')
      .select('rating, comment, reviewer_name')
      .eq('experience_id', id)
      .eq('status', 'approved')
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0 && data[0].comment) setTestimonial(data[0] as Testimonial);
      });
  }, [id]);

  if (expLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('experienceDetail.notFound')}</p>
          <button onClick={() => navigate('/itinerary')} className="text-primary hover:underline">{t('experienceDetail.back')}</button>
        </div>
      </div>
    );
  }

  const photos = exp.images && exp.images.length > 0 ? exp.images : [exp.image];
  const inCart = items.some(i => i.id === exp.id);
  const isFree = exp.price === 0;
  const isSelfGuided = exp.category === 'xplorators';
  const langLabel = exp.languages?.map(l => {
    const lower = l.toLowerCase();
    if (lower.includes('english') || lower.includes('anglais')) return 'EN';
    if (lower.includes('français') || lower.includes('french')) return 'FR';
    return l.slice(0, 2).toUpperCase();
  }).join(' · ');

  const touristAttractionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: exp.name,
    description: exp.description,
    image: exp.image,
    url: `https://goxplora.ca/experience/${exp.id}`,
    touristType: 'Tourists, Locals',
    address: {
      '@type': 'PostalAddress',
      addressLocality: exp.neighbourhood ?? 'Québec City',
      addressRegion: 'QC',
      addressCountry: 'CA',
    },
    ...(exp.price > 0 && {
      offers: {
        '@type': 'Offer',
        price: (exp.price / 100).toFixed(2),
        priceCurrency: 'CAD',
        availability: 'https://schema.org/InStock',
      },
    }),
  };

  const purchaseAndAdd = () => {
    if (inCart) return;
    analytics.addToCart({ id: exp.id, name: exp.name, price: exp.price, category: exp.category });
    addItem(exp);
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('xplora_purchased') || '[]');
      if (!existing.includes(exp.id)) {
        localStorage.setItem('xplora_purchased', JSON.stringify([...existing, exp.id]));
      }
    } catch { /* ignore */ }
  };

  const prevPhoto = () => setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex(i => (i + 1) % photos.length);

  return (
    <div className="min-h-screen pb-32 md:pb-12 bg-background">
      <PageSEO
        title={`${exp.name} in Québec City — Xplora`}
        description={exp.description || `Book ${exp.name} in Québec City. ${exp.duration ? `Duration: ${exp.duration}.` : ''} ${exp.neighbourhood ? `Located in ${exp.neighbourhood}.` : ''} Curated by Xplora.`}
        canonical={`/experience/${exp.id}`}
        schema={touristAttractionSchema}
      />

      {/* Photo hero */}
      <div className="relative h-64 sm:h-80 md:h-[420px] bg-muted">
        <img src={photos[photoIndex]} alt={exp.name} className="w-full h-full object-cover" />
        {photos.length > 1 && (
          <>
            <button onClick={prevPhoto} aria-label={t('a11y.prevPhoto')} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow">
              <Prev className="w-5 h-5" aria-hidden="true" />
            </button>
            <button onClick={nextPhoto} aria-label={t('a11y.nextPhoto')} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow">
              <Next className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}
        <button
          onClick={() => navigate(-1)}
          aria-label={t('a11y.goBack')}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        {exp.badge && (
          <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full">
            {exp.badge}
          </span>
        )}
        {/* Photo count pill */}
        {photos.length > 1 && (
          <span className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {photoIndex + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="bg-muted/30 border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                aria-label={t('a11y.photoOf', { current: i + 1, total: photos.length })}
                aria-pressed={i === photoIndex}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === photoIndex ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-6 md:py-8">
        <div className="md:grid md:grid-cols-3 md:gap-10">

          {/* Main content */}
          <div className="md:col-span-2 space-y-8">

            {/* Strong opening: what, how long, who */}
            <div>
              {exp.category && (
                <p className="text-xs uppercase tracking-widest text-secondary font-medium mb-2">
                  {CAT_TYPE_LABEL[exp.category] ?? exp.category}
                </p>
              )}
              <h1 className="text-2xl md:text-3xl font-semibold mb-2 leading-tight">{exp.name}</h1>
              <p className="text-base text-muted-foreground leading-relaxed">{exp.description}</p>
            </div>

            {/* At a glance — practical details high on page */}
            <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{t('experienceDetail.atAGlance')}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none mt-0.5">💰</span>
                  <div>
                    <p className="font-medium">
                      {isFree ? t('experienceDetail.free') : `$${(exp.price / 100).toFixed(0)} ${t('experienceDetail.perPerson')}`}
                    </p>
                    {isFree && <p className="text-xs text-muted-foreground">{isSelfGuided ? 'No booking needed' : 'Free'}</p>}
                  </div>
                </div>
                {exp.duration && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{exp.duration}</p>
                    </div>
                  </div>
                )}
                {langLabel && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{langLabel}</p>
                    </div>
                  </div>
                )}
                {exp.spots && (
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="font-medium">{t('experienceDetail.upTo')} {exp.spots} {t('experienceDetail.people')}</p>
                    </div>
                  </div>
                )}
                {exp.meetingPoint && (
                  <div className="flex items-start gap-2 col-span-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(exp.meetingPoint)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {exp.meetingPoint.split('—')[0].trim()}
                      </a>
                      {exp.meetingPoint.includes('—') && (
                        <p className="text-xs text-muted-foreground">{exp.meetingPoint.split('—')[1].trim()}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2 col-span-2">
                  <RotateCcw className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                  <p className="text-muted-foreground">{t('experienceDetail.cancelPolicy')}</p>
                </div>
              </div>
            </div>

            {/* Highlights */}
            {exp.highlights && exp.highlights.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-3">{t('experienceDetail.highlights')}</h2>
                <ul className="space-y-2">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Testimonial */}
            {testimonial && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{t('experienceDetail.testimonialLabel')}</p>
                <StarRating rating={testimonial.rating} />
                <p className="text-sm leading-relaxed">"{testimonial.comment}"</p>
                <p className="text-sm font-medium text-muted-foreground">— {testimonial.reviewer_name ?? 'Anonymous'}</p>
              </div>
            )}

            {/* What's included + What to bring */}
            {((exp.includes && exp.includes.length > 0) || (exp.toBring && exp.toBring.length > 0)) && (
              <div className="grid grid-cols-2 gap-6">
                {exp.includes && exp.includes.length > 0 && (
                  <div>
                    <h2 className="text-base font-medium mb-3">{t('experienceDetail.whatsIncluded')}</h2>
                    <ul className="space-y-2">
                      {exp.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {exp.toBring && exp.toBring.length > 0 && (
                  <div>
                    <h2 className="text-base font-medium mb-3">{t('experienceDetail.whatToBring')}</h2>
                    <ul className="space-y-2">
                      {exp.toBring.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0 mt-1.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Itinerary — self-guided only */}
            {exp.category === 'xplorators' && exp.itinerary && exp.itinerary.length > 0 && (
              <div>
                <h2 className="text-base font-medium mb-3">{t('experienceDetail.itinerary')}</h2>
                <ol className="space-y-3">
                  {exp.itinerary.map((stop, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">{i + 1}</span>
                      <span className="text-muted-foreground leading-relaxed">{stop}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* About */}
            {exp.longDescription && (
              <div>
                <h2 className="text-base font-medium mb-3">{t('experienceDetail.about')}</h2>
                <div className="space-y-3">
                  {exp.longDescription.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Host */}
            {exp.hostName && (
              <div className="flex items-center gap-4 py-5 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg flex-shrink-0">
                  {exp.hostName[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{t('experienceDetail.hostedBy')} {exp.hostName}</p>
                  {exp.hostBio && <p className="text-sm text-muted-foreground mt-0.5">{exp.hostBio}</p>}
                </div>
              </div>
            )}

            {/* Xplorators upsell */}
            {isSelfGuided && (
              <div className="bg-muted/40 rounded-2xl p-5 space-y-2">
                <p className="text-sm text-muted-foreground">{t('experienceDetail.groupPrompt')}</p>
                <button onClick={() => navigate('/itinerary?category=xploratours')} className="text-sm text-primary font-medium hover:underline">
                  {t('experienceDetail.toursLink')}
                </button>
              </div>
            )}
          </div>

          {/* Booking sidebar — desktop */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <p className="text-3xl font-semibold">
                  {isFree ? t('experienceDetail.free') : `$${(exp.price / 100).toFixed(0)}`}
                  {!isFree && <span className="text-base text-muted-foreground font-normal"> {t('experienceDetail.perPerson')}</span>}
                </p>
                {exp.spots && !isFree && (
                  <p className="text-sm text-muted-foreground mt-0.5">{exp.spots} {t('experienceDetail.spotsAvailable')}</p>
                )}
                {isFree && isSelfGuided && (
                  <p className="text-sm text-muted-foreground mt-0.5">{t('experienceDetail.selfGuided')}</p>
                )}
              </div>

              <button
                onClick={purchaseAndAdd}
                className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
                  inCart ? 'bg-green-500 text-white' : 'bg-[#12343B] text-white hover:bg-[#12343B]/90'
                }`}
              >
                {inCart
                  ? <><Check className="w-4 h-4" aria-hidden="true" /> {isSelfGuided ? t('experienceDetail.savedRoute') : t('experienceDetail.addedToCart')}</>
                  : isSelfGuided
                  ? t('experienceDetail.getRoute')
                  : <><ShoppingCart className="w-4 h-4" aria-hidden="true" /> {t('experienceDetail.bookExperience')}</>
                }
              </button>

              {inCart && !isFree && (
                <button onClick={() => navigate('/cart')} className="w-full py-2.5 rounded-2xl border border-border text-sm hover:bg-muted/40 transition-colors">
                  {t('experienceDetail.viewCart')}
                </button>
              )}

              <div className="pt-1 space-y-1.5 text-xs text-muted-foreground">
                {!isFree && <p className="text-center">{t('experienceDetail.noCharge')}</p>}
                <p className="flex items-center gap-1.5 justify-center">
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  {t('experienceDetail.cancelPolicy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-5 py-3 flex items-center justify-between z-40">
        <div>
          <p className="text-xl font-semibold">
            {isFree ? t('experienceDetail.free') : `$${(exp.price / 100).toFixed(0)}`}
            {!isFree && <span className="text-sm text-muted-foreground font-normal"> {t('experienceDetail.perPerson')}</span>}
          </p>
          <p className="text-xs text-muted-foreground">{t('experienceDetail.cancelPolicy')}</p>
        </div>
        <button
          onClick={() => { if (!inCart) purchaseAndAdd(); else navigate('/cart'); }}
          className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all flex items-center gap-2 ${
            inCart ? 'bg-green-500 text-white' : 'bg-[#12343B] text-white hover:bg-[#12343B]/90'
          }`}
        >
          {isSelfGuided
            ? (inCart ? <><Check className="w-4 h-4" aria-hidden="true" />{t('experienceDetail.saved')}</> : t('experienceDetail.getRoute'))
            : (inCart ? <><Check className="w-4 h-4" aria-hidden="true" />{t('experienceDetail.inCart')}</> : <><ShoppingCart className="w-4 h-4" aria-hidden="true" />{t('experienceDetail.book')}</>)
          }
        </button>
      </div>

      <SimpleFooter />
    </div>
  );
}
