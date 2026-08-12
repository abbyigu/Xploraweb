import { useState } from 'react';
import { Star, Send, AlertTriangle, Mail } from 'lucide-react';
import type { PendingItineraryReview } from '../lib/adminItineraryReviews';

interface Props {
  review: PendingItineraryReview;
  onRespond: (id: string, response: string) => Promise<void>;
}

export function AdminItineraryReviewCard({ review, onRespond }: Props) {
  const [responseDraft, setResponseDraft] = useState('');
  const [posting, setPosting] = useState(false);

  async function handlePostResponse() {
    if (!responseDraft.trim() || posting) return;
    setPosting(true);
    await onRespond(review.id, responseDraft.trim());
    setPosting(false);
  }

  function handleEmailReviewer() {
    if (!review.reviewerEmail) return;
    const subject = encodeURIComponent(`About your review of "${review.title}"`);
    const body = encodeURIComponent(
      `Hi${review.reviewerName ? ` ${review.reviewerName}` : ''},\n\nWe noticed your ${review.avgRating.toFixed(1)}★ review of "${review.title}" — the rating and your notes ("${review.notes}") seem to point in different directions. Would you mind taking another look and letting us know if either should be corrected?\n\nThanks,\nGoXplora`
    );
    // cc the shared inbox (same address used everywhere else on the site) so
    // replies aren't stranded in the admin's personal mailbox.
    window.location.href = `mailto:${review.reviewerEmail}?cc=hello@goxplora.ca&subject=${subject}&body=${body}`;
  }

  return (
    <div className={`bg-card border rounded-2xl p-5 ${review.mismatchFlag ? 'border-amber-300' : 'border-border'}`}>
      {review.mismatchFlag && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-3 w-fit">
          <AlertTriangle className="w-3.5 h-3.5" /> Rating and notes may not match — worth a second look
        </div>
      )}
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <div className="flex">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-4 h-4 ${review.avgRating >= s - 0.5 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
          ))}
        </div>
        <span className="text-sm font-medium">{review.avgRating.toFixed(1)}★ avg</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm font-medium">{review.reviewerName || 'Anonymous'}</span>
        {review.reviewerEmail && <span className="text-xs text-muted-foreground">{review.reviewerEmail}</span>}
        {review.mismatchFlag && review.reviewerEmail && (
          <button
            onClick={handleEmailReviewer}
            className="flex items-center gap-1 text-xs text-primary hover:underline ml-auto"
          >
            <Mail className="w-3.5 h-3.5" /> Email reviewer
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {review.slug ? (
          <a href={`/i/${review.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{review.title}</a>
        ) : review.title}
        {' · '}{new Date(review.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      <ul className="space-y-1 mb-3">
        {review.stops.map(stop => {
          const rating = review.stopRatings[stop.spot.id];
          if (!rating) return null;
          return (
            <li key={stop.spot.id} className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate min-w-0">{stop.order}. {stop.spot.name}</span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rating}
              </span>
            </li>
          );
        })}
      </ul>

      {review.notes ? (
        <p className="text-sm text-foreground leading-relaxed mb-3">"{review.notes}"</p>
      ) : (
        <p className="text-sm text-muted-foreground italic mb-3">No notes left.</p>
      )}

      {review.extraSpots.length > 0 && (
        <p className="text-xs text-muted-foreground mb-3">Also visited: {review.extraSpots.join(', ')}</p>
      )}

      {review.photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {review.photos.map(photo => (
            <img key={photo.url} src={photo.url} alt="" className="w-16 h-16 rounded-lg object-cover" />
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-border">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Public response — posting this publishes the review on the itinerary's page
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={responseDraft}
            onChange={(e) => setResponseDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePostResponse(); } }}
            placeholder="e.g. Thanks for the feedback — we've swapped stop 3 for a better fit."
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handlePostResponse}
            disabled={!responseDraft.trim() || posting}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#12343B] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" /> Publish
          </button>
        </div>
      </div>
    </div>
  );
}
