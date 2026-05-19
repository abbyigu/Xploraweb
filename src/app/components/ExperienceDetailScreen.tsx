import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, Users, MapPin, ChevronLeft, Globe, Check, ShoppingCart, ChevronLeft as Prev, ChevronRight as Next, Star, Calendar, Flame, ChevronDown, Bookmark } from 'lucide-react';
import { useExperiences } from '../hooks/useExperiences';
import { useCart } from '../context/CartContext';
import { SimpleFooter } from './SimpleFooter';
import { supabase } from '../lib/supabase';
import { hosts } from '../data/hosts';

function HostPhoto({ hostId, name }: { hostId?: string; name: string }) {
  const host = hostId ? hosts.find(h => h.id === hostId) : null;
  if (host?.photo) {
    return <img src={host.photo} alt={name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/10" />;
  }
  return (
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg flex-shrink-0">
      {name[0]}
    </div>
  );
}

interface Review {
  id: string;
  experience_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_name: string | null;
  created_at: string;
}

export function ExperienceDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { experiences } = useExperiences();
  const exp = experiences.find(e => e.id === id);
  const { addItem, items } = useCart();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(() => {
    if (!exp || exp.price !== 0) return false;
    try {
      const saved = JSON.parse(localStorage.getItem('xplora_saved_routes') || '[]');
      return saved.includes(exp.id);
    } catch { return false; }
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!exp) return;
    loadReviews();
    checkPurchaseAndReview();
  }, [exp?.id]);

  async function loadReviews() {
    const { data } = await supabase
      .from('experience_reviews')
      .select('*')
      .eq('experience_id', exp!.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  }

  async function checkPurchaseAndReview() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: booking }, { data: ownReview }] = await Promise.all([
      supabase.from('bookings').select('id').eq('experience_id', exp!.id).eq('user_id', user.id).maybeSingle(),
      supabase.from('experience_reviews').select('*').eq('experience_id', exp!.id).eq('user_id', user.id).maybeSingle(),
    ]);

    if (booking) setHasPurchased(true);
    if (ownReview) setUserReview(ownReview);
  }

  async function submitReview() {
    if (!userId || rating === 0) return;
    setSubmitting(true);

    const { data: profile } = await supabase
      .from('profiles').select('name').eq('id', userId).single();

    // 4+ stars publish immediately; 3 and below go to admin queue
    const status = rating >= 4 ? 'approved' : 'pending';

    const { data: inserted } = await supabase
      .from('experience_reviews')
      .insert({
        experience_id: exp!.id,
        user_id: userId,
        rating,
        comment: comment.trim() || null,
        reviewer_name: profile?.name || 'Anonymous',
        status,
      })
      .select()
      .single();

    if (inserted) {
      setUserReview(inserted);
      if (status === 'approved') {
        setReviews(prev => [inserted, ...prev]);
      }
    }
    setReviewSubmitted(true);
    setSubmitting(false);
  }

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

  const purchaseAndAdd = () => {
    if (inCart) return;
    addItem({
      ...exp,
      ...(selectedDate && { selectedDate }),
      ...(selectedTime && { selectedTime }),
    });
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('xplora_purchased') || '[]');
      if (!existing.includes(exp.id)) {
        localStorage.setItem('xplora_purchased', JSON.stringify([...existing, exp.id]));
      }
    } catch { /* ignore */ }
  };

  const saveRoute = () => {
    if (isSaved) return;
    try {
      const saved = JSON.parse(localStorage.getItem('xplora_saved_routes') || '[]');
      localStorage.setItem('xplora_saved_routes', JSON.stringify([...saved, exp.id]));
    } catch { /* ignore */ }
    setIsSaved(true);
  };

  const today = new Date().toISOString().split('T')[0];
  const isPaid = exp.price > 0;
  const canBook = !isPaid || (selectedDate !== '' && selectedTime !== '');

  const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00',
  ];
  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const prevPhoto = () => setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex(i => (i + 1) % photos.length);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

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

      {/* Desktop thumbnail strip */}
      {photos.length > 1 && (
        <div className="hidden md:flex gap-2 max-w-3xl mx-auto px-8 pt-3">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setPhotoIndex(i)}
              className={`w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all ${i === photoIndex ? 'ring-2 ring-primary ring-offset-1' : 'opacity-55 hover:opacity-80'}`}
            >
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-8">
        <div className="md:grid md:grid-cols-3 md:gap-12">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* Header */}
            <div>
              {exp.category && (
                <p className="text-xs uppercase tracking-widest text-secondary mb-2">
                  {exp.category === 'xplorators' ? 'Solo'
                    : exp.category === 'xploratorsplus' ? 'Solo+'
                    : exp.category === 'xploratours' ? 'Tours'
                    : exp.category === 'xploranights' ? 'Nights'
                    : exp.category}
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
                {exp.neighbourhood && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{exp.neighbourhood}</span>
                )}
                {reviews.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {avgRating.toFixed(1)} ({reviews.length})
                  </span>
                )}
              </div>
            </div>

            {/* Host */}
            {exp.hostName && (
              <div className="py-6 border-t border-b border-border">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Your guide</p>
                <div className="flex items-center gap-4">
                  <HostPhoto hostId={exp.hostId} name={exp.hostName} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{exp.hostName}</p>
                    {exp.hostBio && <p className="text-sm text-muted-foreground mt-0.5">{exp.hostBio}</p>}
                    {exp.hostId && (
                      <button
                        onClick={() => navigate(`/host/${exp.hostId}`)}
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View full profile →
                      </button>
                    )}
                  </div>
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

            {/* What's included + What to bring — side by side */}
            {((exp.includes && exp.includes.length > 0) || (exp.toBring && exp.toBring.length > 0)) && (
              <div className="grid grid-cols-2 gap-6">
                {exp.includes && exp.includes.length > 0 && (
                  <div>
                    <h2 className="text-lg mb-3">What's included</h2>
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
                    <h2 className="text-lg mb-3">What to bring</h2>
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
            {exp.itinerary && exp.itinerary.length > 0 && (
              <div>
                <h2 className="text-lg mb-3">Itinerary</h2>
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
                <h2 className="text-lg mb-3">About this experience</h2>
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

            {/* FAQ */}
            {exp.faqs && exp.faqs.length > 0 && (
              <div>
                <h2 className="text-lg mb-3">FAQ</h2>
                <div className="space-y-2">
                  {exp.faqs.map((faq, i) => (
                    <div key={i} className="border border-border rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-left hover:bg-muted/30 transition-colors"
                      >
                        {faq.q}
                        <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-3 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-lg mb-4">
                Reviews
                {reviews.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {avgRating.toFixed(1)} ★ · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h2>

              {/* Approved reviews list */}
              {reviews.length > 0 ? (
                <div className="space-y-5 mb-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-border pb-5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${review.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <p className="text-sm font-medium">{review.reviewer_name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">No reviews yet — be the first!</p>
              )}

              {/* Review form — only for users who booked and haven't reviewed yet */}
              {hasPurchased && !userReview && !reviewSubmitted && (
                <div className="bg-muted/40 rounded-2xl p-5">
                  <p className="text-sm font-medium mb-3">Leave a review</p>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}
                      >
                        <Star className={`w-8 h-8 transition-colors ${(hoverRating || rating) >= s ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30 hover:text-amber-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Share your experience (optional)"
                    className="w-full border border-border rounded-xl p-3 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={3}
                  />
                  <button
                    onClick={submitReview}
                    disabled={rating === 0 || submitting}
                    className="mt-3 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {submitting ? 'Submitting…' : 'Submit review'}
                  </button>
                </div>
              )}

              {/* Pending confirmation */}
              {(reviewSubmitted || userReview?.status === 'pending') && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
                  Your review has been submitted and is pending approval. Thank you!
                </div>
              )}

              {/* Already approved */}
              {!reviewSubmitted && userReview?.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700">
                  Your review is live — thank you for sharing!
                </div>
              )}
            </div>
          </div>

          {/* Booking panel — desktop sidebar */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-3xl p-6 shadow-sm">
              {exp.price === 0 ? (
                <>
                  <p className="text-3xl font-medium mb-1">Free</p>
                  <p className="text-sm text-muted-foreground mb-4">Self-guided — go at your own pace</p>
                  {exp.weeklyBookings && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium mb-4">
                      <Flame className="w-3.5 h-3.5" />
                      {exp.weeklyBookings} people saved this week
                    </div>
                  )}
                  <button
                    onClick={saveRoute}
                    className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                  >
                    {isSaved ? <><Check className="w-4 h-4" /> Route saved</> : <><Bookmark className="w-4 h-4" /> Save this route</>}
                  </button>
                  {isSaved && (
                    <button onClick={() => navigate('/account')} className="w-full mt-2 py-2.5 rounded-2xl border border-border text-sm hover:bg-muted/40 transition-colors">
                      View my saved routes →
                    </button>
                  )}
                  <div className="mt-5 pt-5 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center mb-3">Prefer a guided experience with a group?</p>
                    <button onClick={() => navigate('/itinerary?category=xploratours')} className="w-full py-2.5 rounded-2xl border border-border text-sm hover:bg-muted/40 transition-colors">
                      See guided Tours →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-3xl font-medium mb-1">${(exp.price / 100).toFixed(0)}<span className="text-base text-muted-foreground font-normal"> / person</span></p>
                  {exp.weeklyBookings && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium mb-2">
                      <Flame className="w-3.5 h-3.5" />
                      {exp.weeklyBookings} people booked this week
                    </div>
                  )}
                  {exp.spots && exp.spots <= 5
                    ? <p className="text-sm text-red-600 font-medium mb-4">⚡ Only {exp.spots} spots left</p>
                    : exp.spots ? <p className="text-sm text-muted-foreground mb-4">{exp.spots} spots available</p> : null
                  }

                  {/* Date & time picker */}
                  {!inCart && (
                    <div className="space-y-3 mb-5">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Date
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Start time
                        </label>
                        <select
                          value={selectedTime}
                          onChange={e => setSelectedTime(e.target.value)}
                          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select a time</option>
                          {TIME_SLOTS.map(t => (
                            <option key={t} value={t}>{formatTime(t)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={purchaseAndAdd}
                    disabled={!canBook && !inCart}
                    className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${inCart ? 'bg-green-500 text-white' : canBook ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-primary/40 text-primary-foreground cursor-not-allowed'}`}
                  >
                    {inCart ? <><Check className="w-4 h-4" /> Added to cart</> : <><ShoppingCart className="w-4 h-4" /> Book this experience</>}
                  </button>
                  {!inCart && !canBook && (
                    <p className="text-xs text-muted-foreground text-center mt-2">Pick a date and time to continue</p>
                  )}
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
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white border-t border-border z-40">
        {isPaid && !inCart && (
          <div className="flex gap-2 px-4 pt-3">
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="flex-1 border border-border rounded-xl px-2.5 py-2 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              className="flex-1 border border-border rounded-xl px-2.5 py-2 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Time</option>
              {TIME_SLOTS.map(t => (
                <option key={t} value={t}>{formatTime(t)}</option>
              ))}
            </select>
          </div>
        )}
        <div className="px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xl font-medium">{exp.price === 0 ? 'Free' : `$${(exp.price / 100).toFixed(0)}`}<span className="text-sm text-muted-foreground font-normal">{exp.price > 0 ? ' / person' : ''}</span></p>
            <p className="text-xs text-muted-foreground">
              {exp.price === 0 ? 'Self-guided · go at your own pace'
                : exp.spots && exp.spots <= 5 ? `⚡ Only ${exp.spots} spots left`
                : exp.spots ? `${exp.spots} spots available` : ''}
            </p>
          </div>
          {exp.price === 0 ? (
            <button
              onClick={saveRoute}
              className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all flex items-center gap-2 ${isSaved ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
            >
              {isSaved ? <><Check className="w-4 h-4" /> Saved</> : <><Bookmark className="w-4 h-4" /> Save route</>}
            </button>
          ) : (
            <button
              onClick={() => { if (!inCart && canBook) purchaseAndAdd(); else if (inCart) navigate('/cart'); }}
              disabled={!inCart && !canBook}
              className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all flex items-center gap-2 ${inCart ? 'bg-green-500 text-white' : canBook ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-primary/40 text-primary-foreground cursor-not-allowed'}`}
            >
              {inCart ? <><Check className="w-4 h-4" /> In cart</> : <><ShoppingCart className="w-4 h-4" /> Book</>}
            </button>
          )}
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
