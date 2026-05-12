import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, Users, MapPin, ChevronLeft, Globe, Check, ShoppingCart, ChevronLeft as Prev, ChevronRight as Next } from 'lucide-react';
import { useExperiences } from '../hooks/useExperiences';
import { useCart } from '../context/CartContext';
import { SimpleFooter } from './SimpleFooter';
import { useTranslation } from 'react-i18next';

export function ExperienceDetailScreen() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { experiences } = useExperiences();
  const exp = experiences.find(e => e.id === id);
  const { addItem, items } = useCart();
  const [photoIndex, setPhotoIndex] = useState(0);

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

  const purchaseAndAdd = () => {
    if (inCart) return;
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
      {/* Photo gallery */}
      <div className="relative h-72 md:h-[480px] bg-muted">
        <img
          src={photos[photoIndex]}
          alt={exp.name}
          className="w-full h-full object-cover"
        />
        {photos.length > 1 && (
          <>
            <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow">
              <Prev className="w-5 h-5" />
            </button>
            <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow">
              <Next className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setPhotoIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {exp.badge && (
          <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full">
            {exp.badge}
          </span>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-8">
        <div className="md:grid md:grid-cols-3 md:gap-12">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* Header */}
            <div>
              {exp.category && (
                <p className="text-xs uppercase tracking-widest text-secondary mb-2">
                  {exp.category === 'xplorators' ? 'Xplora-tors'
                    : exp.category === 'xplorastories' ? 'Xplora-stories'
                    : exp.category === 'xploratours' ? 'Xplora-tours'
                    : 'Xplora Nights'}
                </p>
              )}
              <h1 className="text-2xl md:text-3xl mb-3">{exp.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {exp.duration && (
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{exp.duration}</span>
                )}
                {exp.spots && (
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{t('experienceDetail.upTo')} {exp.spots} {t('experienceDetail.people')}</span>
                )}
                {exp.difficulty && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{exp.difficulty}</span>
                )}
                {exp.languages && (
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{exp.languages.join(' · ')}</span>
                )}
                {exp.neighbourhood && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{exp.neighbourhood}</span>
                )}
              </div>
            </div>

            {/* Host */}
            {exp.hostName && (
              <div className="flex items-center gap-4 py-6 border-t border-b border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg flex-shrink-0">
                  {exp.hostName[0]}
                </div>
                <div>
                  <p className="font-medium">{t('experienceDetail.hostedBy')} {exp.hostName}</p>
                  {exp.hostBio && <p className="text-sm text-muted-foreground mt-0.5">{exp.hostBio}</p>}
                </div>
              </div>
            )}

            {/* Highlights */}
            {exp.highlights && exp.highlights.length > 0 && (
              <div>
                <h2 className="text-lg mb-3">{t('experienceDetail.highlights')}</h2>
                <ul className="space-y-2">
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's included + What to bring — side by side */}
            {((exp.includes && exp.includes.length > 0) || (exp.toBring && exp.toBring.length > 0)) && (
              <div className="grid grid-cols-2 gap-6">
                {exp.includes && exp.includes.length > 0 && (
                  <div>
                    <h2 className="text-lg mb-3">{t('experienceDetail.whatsIncluded')}</h2>
                    <ul className="space-y-2">
                      {exp.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {exp.toBring && exp.toBring.length > 0 && (
                  <div>
                    <h2 className="text-lg mb-3">{t('experienceDetail.whatToBring')}</h2>
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

            {/* Itinerary — xplorators only */}
            {exp.category === 'xplorators' && exp.itinerary && exp.itinerary.length > 0 && (
              <div>
                <h2 className="text-lg mb-3">{t('experienceDetail.itinerary')}</h2>
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

            {/* Description */}
            {exp.longDescription && (
              <div>
                <h2 className="text-lg mb-3">{t('experienceDetail.about')}</h2>
                <div className="space-y-3">
                  {exp.longDescription.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting point */}
            {exp.meetingPoint && (
              <div>
                <h2 className="text-lg mb-3">{t('experienceDetail.meetingPoint')}</h2>
                <div className="bg-muted/40 rounded-2xl p-4 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">{exp.meetingPoint}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(exp.meetingPoint)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      {t('experienceDetail.getDirections')}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking panel — desktop sidebar */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-3xl p-6 shadow-sm">
              {exp.price === 0 ? (
                <>
                  <p className="text-3xl font-medium mb-1">{t('experienceDetail.free')}</p>
                  <p className="text-sm text-muted-foreground mb-6">{t('experienceDetail.selfGuided')}</p>
                  <button
                    onClick={purchaseAndAdd}
                    className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${inCart ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                  >
                    {inCart ? <><Check className="w-4 h-4" /> {t('experienceDetail.savedRoute')}</> : t('experienceDetail.getRoute')}
                  </button>
                  <div className="mt-5 pt-5 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center mb-3">{t('experienceDetail.groupPrompt')}</p>
                    <button onClick={() => navigate('/itinerary?category=xploratours')} className="w-full py-2.5 rounded-2xl border border-border text-sm hover:bg-muted/40 transition-colors">
                      {t('experienceDetail.toursLink')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-3xl font-medium mb-1">${(exp.price / 100).toFixed(0)}<span className="text-base text-muted-foreground font-normal"> {t('experienceDetail.perPerson')}</span></p>
                  {exp.spots && <p className="text-sm text-muted-foreground mb-6">{exp.spots} {t('experienceDetail.spotsAvailable')}</p>}
                  <button
                    onClick={purchaseAndAdd}
                    className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${inCart ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                  >
                    {inCart ? <><Check className="w-4 h-4" /> {t('experienceDetail.addedToCart')}</> : <><ShoppingCart className="w-4 h-4" /> {t('experienceDetail.bookExperience')}</>}
                  </button>
                  {inCart && (
                    <button onClick={() => navigate('/cart')} className="w-full mt-3 py-2.5 rounded-2xl border border-border text-sm hover:bg-muted/40 transition-colors">
                      {t('experienceDetail.viewCart')}
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground text-center mt-4">{t('experienceDetail.noCharge')}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking bar — mobile sticky bottom */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-border px-6 py-4 flex items-center justify-between z-40">
        <div>
          <p className="text-xl font-medium">{exp.price === 0 ? t('experienceDetail.free') : `$${(exp.price / 100).toFixed(0)}`}<span className="text-sm text-muted-foreground font-normal">{exp.price > 0 ? ` ${t('experienceDetail.perPerson')}` : ''}</span></p>
          <p className="text-xs text-muted-foreground">{exp.price === 0 ? t('experienceDetail.selfGuided').split(' — ')[0] : `${exp.spots} spots left`}</p>
        </div>
        <button
          onClick={() => { if (!inCart) purchaseAndAdd(); else navigate('/cart'); }}
          className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all flex items-center gap-2 ${inCart ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
        >
          {exp.price === 0
            ? (inCart ? <><Check className="w-4 h-4" /> {t('experienceDetail.saved')}</> : t('experienceDetail.getRoute'))
            : (inCart ? <><Check className="w-4 h-4" /> {t('experienceDetail.inCart')}</> : <><ShoppingCart className="w-4 h-4" /> {t('experienceDetail.book')}</>)
          }
        </button>
      </div>

      <SimpleFooter />
    </div>
  );
}
