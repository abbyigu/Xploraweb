import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, Users, MapPin, ChevronLeft, Globe, Check, ShoppingCart, ChevronLeft as Prev, ChevronRight as Next } from 'lucide-react';
import { useExperiences } from '../hooks/useExperiences';
import { useCart } from '../context/CartContext';
import { SimpleFooter } from './SimpleFooter';

export function ExperienceDetailScreen() {
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
          <p className="text-muted-foreground mb-4">Experience not found.</p>
          <button onClick={() => navigate('/itinerary')} className="text-primary hover:underline">← Back to Explore</button>
        </div>
      </div>
    );
  }

  const photos = exp.images && exp.images.length > 0 ? exp.images : [exp.image];
  const inCart = items.some(i => i.id === exp.id);

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
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />Up to {exp.spots} people</span>
                )}
                {exp.difficulty && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{exp.difficulty}</span>
                )}
                {exp.languages && (
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{exp.languages.join(' · ')}</span>
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
                  <p className="font-medium">Hosted by {exp.hostName}</p>
                  {exp.hostBio && <p className="text-sm text-muted-foreground mt-0.5">{exp.hostBio}</p>}
                </div>
              </div>
            )}

            {/* Highlights */}
            {exp.highlights && exp.highlights.length > 0 && (
              <div>
                <h2 className="text-lg mb-3">Highlights</h2>
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

            {/* Description */}
            {exp.longDescription && (
              <div>
                <h2 className="text-lg mb-3">About this experience</h2>
                <div className="space-y-3">
                  {exp.longDescription.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* What's included */}
            {exp.includes && exp.includes.length > 0 && (
              <div>
                <h2 className="text-lg mb-3">What's included</h2>
                <ul className="space-y-2">
                  {exp.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What to bring */}
            {exp.toBring && exp.toBring.length > 0 && (
              <div>
                <h2 className="text-lg mb-3">What to bring</h2>
                <ul className="space-y-2">
                  {exp.toBring.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Meeting point */}
            {exp.meetingPoint && (
              <div>
                <h2 className="text-lg mb-3">Meeting point</h2>
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
                      Get directions →
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
                  <p className="text-3xl font-medium mb-1">Free</p>
                  <p className="text-sm text-muted-foreground mb-6">Self-guided — go at your own pace</p>
                  <button
                    onClick={() => { if (!inCart) addItem(exp); }}
                    className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${inCart ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                  >
                    {inCart ? <><Check className="w-4 h-4" /> Saved to my routes</> : 'Get the route'}
                  </button>
                  <div className="mt-5 pt-5 border-t border-border space-y-2">
                    <p className="text-xs text-muted-foreground text-center mb-3">Want more from these spots?</p>
                    <button onClick={() => navigate('/itinerary')} className="w-full py-2.5 rounded-2xl border border-border text-sm hover:bg-muted/40 transition-colors">
                      Xplora-stories — Discover hidden layers
                    </button>
                    <button onClick={() => navigate('/itinerary')} className="w-full py-2.5 rounded-2xl border border-border text-sm hover:bg-muted/40 transition-colors">
                      Xplora-tours — Experience together
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-3xl font-medium mb-1">${(exp.price / 100).toFixed(0)}<span className="text-base text-muted-foreground font-normal"> / person</span></p>
                  {exp.spots && <p className="text-sm text-muted-foreground mb-6">{exp.spots} spots available</p>}
                  <button
                    onClick={() => { if (!inCart) addItem(exp); }}
                    className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${inCart ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                  >
                    {inCart ? <><Check className="w-4 h-4" /> Added to cart</> : <><ShoppingCart className="w-4 h-4" /> Book this experience</>}
                  </button>
                  {inCart && (
                    <button onClick={() => navigate('/cart')} className="w-full mt-3 py-2.5 rounded-2xl border border-border text-sm hover:bg-muted/40 transition-colors">
                      View cart →
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground text-center mt-4">You won't be charged yet</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking bar — mobile sticky bottom */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-border px-6 py-4 flex items-center justify-between z-40">
        <div>
          <p className="text-xl font-medium">{exp.price === 0 ? 'Free' : `$${(exp.price / 100).toFixed(0)}`}<span className="text-sm text-muted-foreground font-normal">{exp.price > 0 ? ' / person' : ''}</span></p>
          <p className="text-xs text-muted-foreground">{exp.price === 0 ? 'Self-guided' : `${exp.spots} spots left`}</p>
        </div>
        <button
          onClick={() => { if (!inCart) addItem(exp); else navigate('/cart'); }}
          className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all flex items-center gap-2 ${inCart ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
        >
          {exp.price === 0
            ? (inCart ? <><Check className="w-4 h-4" /> Saved</> : 'Get route')
            : (inCart ? <><Check className="w-4 h-4" /> In cart</> : <><ShoppingCart className="w-4 h-4" /> Book</>)
          }
        </button>
      </div>

      <SimpleFooter />
    </div>
  );
}
