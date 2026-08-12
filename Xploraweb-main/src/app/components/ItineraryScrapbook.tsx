import { useRef, useState } from 'react';
import { Camera, Check, Clock, Loader2, MessageCircle, Plus, Star, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { uploadViaApi } from '../lib/uploadImage';
import { updateItineraryScrapbook } from '../lib/savedItineraries';
import type { SavedItinerary } from '../lib/savedItineraries';
import { containsInappropriateLanguage } from '../lib/contentModeration';

function StarRating({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star className={`w-4 h-4 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
        </button>
      ))}
    </div>
  );
}

export function ItineraryScrapbook({
  itinerary,
  onChange,
  standalone,
}: {
  itinerary: SavedItinerary;
  onChange: (updated: SavedItinerary) => void;
  /** Render as its own page section (heading + no inline top border) instead
   * of nested inside another card, e.g. an expanded dashboard row. */
  standalone?: boolean;
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState(itinerary.notes);
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesBlockedError, setNotesBlockedError] = useState(false);
  const [newSpot, setNewSpot] = useState('');

  const persist = async (patch: Parameters<typeof updateItineraryScrapbook>[1], updated: SavedItinerary) => {
    onChange(updated); // optimistic
    const result = await updateItineraryScrapbook(itinerary.id, patch);
    // Reconcile with the server-computed review_status/admin_response (a DB
    // trigger sets these — our optimistic `updated` above can't know them).
    if (result.itinerary) onChange(result.itinerary);
  };

  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    const newPhotos = [...itinerary.photos];
    for (const file of files) {
      const { url, error } = await uploadViaApi(file);
      if (url) {
        newPhotos.push({ url, addedAt: new Date().toISOString() });
      } else if (error) {
        setUploadError(error);
      }
    }
    setUploading(false);
    await persist({ photos: newPhotos }, { ...itinerary, photos: newPhotos });
  };

  const removePhoto = async (url: string) => {
    const newPhotos = itinerary.photos.filter((p) => p.url !== url);
    await persist({ photos: newPhotos }, { ...itinerary, photos: newPhotos });
  };

  const saveNotes = async () => {
    if (containsInappropriateLanguage(notesDraft)) {
      setNotesBlockedError(true);
      return;
    }
    setNotesBlockedError(false);
    await persist({ notes: notesDraft }, { ...itinerary, notes: notesDraft });
    setNotesSaved(true);
  };

  const addExtraSpot = async () => {
    const name = newSpot.trim();
    if (!name) return;
    const newExtraSpots = [...itinerary.extraSpots, name];
    setNewSpot('');
    await persist({ extraSpots: newExtraSpots }, { ...itinerary, extraSpots: newExtraSpots });
  };

  const removeExtraSpot = async (index: number) => {
    const newExtraSpots = itinerary.extraSpots.filter((_, i) => i !== index);
    await persist({ extraSpots: newExtraSpots }, { ...itinerary, extraSpots: newExtraSpots });
  };

  const rateStop = async (spotId: string, rating: number) => {
    const newRatings = { ...itinerary.stopRatings, [spotId]: rating };
    await persist({ stopRatings: newRatings }, { ...itinerary, stopRatings: newRatings });
  };

  return (
    <div
      className={standalone ? 'space-y-6' : 'mt-4 pt-4 border-t border-border space-y-6'}
      onClick={(e) => e.stopPropagation()}
    >
      {standalone && (
        <div>
          <h4 className="text-lg font-medium text-xplora-ink">{t('sharedItinerary.scrapbookTitle')}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{t('sharedItinerary.scrapbookSubtitle')}</p>
        </div>
      )}

      {/* Photos */}
      <div>
        <h5 className="text-sm font-medium mb-2">{t('account.scrapbookPhotos')}</h5>
        <div className="flex flex-wrap gap-2">
          {itinerary.photos.map((photo) => (
            <div key={photo.url} className="relative w-20 h-20 rounded-lg overflow-hidden group">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(photo.url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t('common.remove')}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            <span className="text-[10px]">{t('account.addPhoto')}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAddPhotos}
          />
        </div>
        {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
      </div>

      {/* Notes */}
      <div>
        <h5 className="text-sm font-medium mb-2">{t('account.scrapbookNotes')}</h5>
        <textarea
          rows={3}
          value={notesDraft}
          onChange={(e) => { setNotesDraft(e.target.value); setNotesSaved(false); setNotesBlockedError(false); }}
          placeholder={t('account.notesPlaceholder')}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        {notesBlockedError && (
          <p className="text-xs text-red-600 mt-1">{t('common.reviewBlockedLanguage')}</p>
        )}
        {!standalone && (
          <button
            onClick={saveNotes}
            disabled={notesDraft === itinerary.notes}
            className="mt-2 text-sm px-3 py-1.5 rounded-lg bg-[#12343B] text-white hover:opacity-90 transition disabled:opacity-40"
          >
            {notesSaved ? t('account.saved') : t('account.saveNotes')}
          </button>
        )}
      </div>

      {/* Extra spots */}
      <div>
        <h5 className="text-sm font-medium mb-2">{standalone ? t('sharedItinerary.placesYouAlsoWent') : t('account.extraSpotsLabel')}</h5>
        {itinerary.extraSpots.length > 0 && (
          <ul className="space-y-1.5 mb-2">
            {itinerary.extraSpots.map((spot, i) => (
              <li key={i} className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-3 py-1.5">
                <span>{spot}</span>
                <button onClick={() => removeExtraSpot(i)} className="text-muted-foreground hover:text-red-500" aria-label={t('common.remove')}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSpot}
            onChange={(e) => setNewSpot(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExtraSpot(); } }}
            placeholder={t('account.extraSpotsPlaceholder')}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={addExtraSpot}
            disabled={!newSpot.trim()}
            className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            {t('account.addSpot')}
          </button>
        </div>
      </div>

      {/* Per-stop ratings */}
      {itinerary.stops.length > 0 && (
        <div>
          <h5 className="text-sm font-medium mb-2">{t('account.rateStops')}</h5>
          <ul className="space-y-2">
            {itinerary.stops.map((stop) => (
              <li key={stop.spot.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate min-w-0">{stop.order}. {stop.spot.name}</span>
                <StarRating
                  value={itinerary.stopRatings[stop.spot.id] || 0}
                  onChange={(rating) => rateStop(stop.spot.id, rating)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {standalone && itinerary.reviewStatus === 'pending' && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t('sharedItinerary.reviewPending')}</span>
        </div>
      )}

      {standalone && itinerary.adminResponse && (
        <div className="flex items-start gap-2 bg-muted/40 border border-border rounded-xl p-3 text-sm">
          <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('sharedItinerary.adminResponseLabel')}</p>
            <p>{itinerary.adminResponse}</p>
          </div>
        </div>
      )}

      {standalone && (
        <button
          onClick={saveNotes}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          {notesSaved ? <><Check className="w-4 h-4" aria-hidden="true" /> {t('account.saved')}</> : t('sharedItinerary.saveReview')}
        </button>
      )}
    </div>
  );
}
