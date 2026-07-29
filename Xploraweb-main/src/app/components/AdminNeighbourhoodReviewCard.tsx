import { useState } from 'react';
import { Star, Check, X, Mail, Send } from 'lucide-react';
import {
  type PendingNeighbourhoodReview,
  type NeighbourhoodReviewMessage,
  getNeighbourhoodReviewMessages,
  logNeighbourhoodReviewMessage,
} from '../lib/neighbourhoodReviews';

interface Props {
  review: PendingNeighbourhoodReview;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPostPublicReply: (id: string, reply: string) => Promise<void>;
}

export function AdminNeighbourhoodReviewCard({ review, onApprove, onReject, onPostPublicReply }: Props) {
  const [replyDraft, setReplyDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [messages, setMessages] = useState<NeighbourhoodReviewMessage[] | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [sending, setSending] = useState(false);

  async function loadMessages() {
    if (messages !== null) return;
    setMessages(await getNeighbourhoodReviewMessages(review.id));
  }

  async function handlePostPublicReply() {
    if (!replyDraft.trim() || posting) return;
    setPosting(true);
    await onPostPublicReply(review.id, replyDraft.trim());
    setPosting(false);
  }

  async function handleEmailFollowUp() {
    const message = messageDraft.trim();
    if (!message || sending || !review.reviewer_email) return;
    setSending(true);
    const subject = encodeURIComponent(`Re: your review of ${review.neighbourhood_name || 'your neighbourhood'}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${review.reviewer_email}?subject=${subject}&body=${body}`;
    await logNeighbourhoodReviewMessage(review.id, message);
    setMessages(prev => [...(prev || []), { id: crypto.randomUUID(), message, created_at: new Date().toISOString() }]);
    setMessageDraft('');
    setSending(false);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-4 h-4 ${review.rating >= s ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{review.reviewer_name || 'Anonymous'}</span>
            {review.reviewer_email && <span className="text-xs text-muted-foreground">{review.reviewer_email}</span>}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {review.neighbourhood_name} · {new Date(review.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {review.comment ? (
            <p className="text-sm text-foreground leading-relaxed">"{review.comment}"</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No comment left.</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onApprove(review.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
          <button
            onClick={() => onReject(review.id)}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" /> Reject
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        {review.admin_reply ? (
          <>
            <div className="mb-3">
              <p className="text-xs font-medium text-[#12343B] mb-0.5">Public reply (visible to everyone)</p>
              <p className="text-sm text-muted-foreground">{review.admin_reply}</p>
            </div>
            <div>
              <button onClick={loadMessages} className="text-xs text-muted-foreground underline mb-2">
                {messages === null
                  ? 'Show private follow-ups'
                  : `${messages.length} private follow-up${messages.length !== 1 ? 's' : ''}`}
              </button>
              {messages && messages.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {messages.map(m => (
                    <p key={m.id} className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5">{m.message}</p>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageDraft}
                  onChange={e => setMessageDraft(e.target.value)}
                  placeholder="Private follow-up (visible only to you and the reviewer, sent by email)..."
                  className="flex-1 min-w-0 border border-border rounded-xl px-3 py-1.5 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleEmailFollowUp}
                  disabled={!messageDraft.trim() || sending || !review.reviewer_email}
                  title={review.reviewer_email ? 'Email this reviewer' : 'No email on file for this reviewer'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12343B] text-white rounded-xl text-xs font-medium disabled:opacity-40 flex-shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" /> Email reviewer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={replyDraft}
              onChange={e => setReplyDraft(e.target.value)}
              placeholder="Write a public reply..."
              className="flex-1 min-w-0 border border-border rounded-xl px-3 py-1.5 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handlePostPublicReply}
              disabled={!replyDraft.trim() || posting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12343B] text-white rounded-xl text-xs font-medium disabled:opacity-40 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> Post public reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
