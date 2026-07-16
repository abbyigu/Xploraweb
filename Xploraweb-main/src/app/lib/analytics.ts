declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

const GTAG_ID = 'G-JF6LR3L9HH';

export function initGtag() {
  if (typeof window === 'undefined') return;
  if (document.querySelector(`script[src*="${GTAG_ID}"]`)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments as unknown as Record<string, unknown>); };
  window.gtag('js', new Date());
  window.gtag('config', GTAG_ID);
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

type CartItem = { id: string; name: string; price: number; quantity: number; category?: string };
type Experience = { id: string; name: string; price: number; category?: string };

function push(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

function toGAItem(item: CartItem | Experience, quantity = 1) {
  return {
    item_id: item.id,
    item_name: item.name,
    item_category: item.category ?? 'experience',
    price: item.price / 100,
    quantity,
  };
}

export const analytics = {
  pageView(path: string) {
    push('page_view', { page_location: `https://goxplora.ca${path}` });
  },

  signUp(method: string) {
    push('sign_up', { method });
  },

  login(method: string) {
    push('login', { method });
  },

  businessSignUp(businessType: string) {
    push('business_sign_up', { business_type: businessType });
  },

  businessLogin() {
    push('business_login');
  },

  generateItinerary(params: { walkLength: string; categories: string[]; neighbourhoods: string[] }) {
    push('generate_itinerary', {
      walk_length: params.walkLength,
      categories: params.categories.join(','),
      neighbourhood_count: params.neighbourhoods.length,
    });
  },

  feedbackSubmitted() {
    push('feedback_submitted');
  },

  leadCaptured(source: string) {
    push('generate_lead', { source });
  },

  saveToggle(itemId: string, itemName: string, saved: boolean) {
    push(saved ? 'add_to_wishlist' : 'remove_from_wishlist', { item_id: itemId, item_name: itemName });
  },

  directionsOpened(itemId: string, itemName: string) {
    push('directions_opened', { item_id: itemId, item_name: itemName });
  },

  viewItem(exp: Experience) {
    push('view_item', {
      currency: 'CAD',
      value: exp.price / 100,
      items: [toGAItem(exp)],
    });
  },

  addToCart(exp: Experience) {
    push('add_to_cart', {
      currency: 'CAD',
      value: exp.price / 100,
      items: [toGAItem(exp)],
    });
  },

  beginCheckout(items: CartItem[], value: number) {
    push('begin_checkout', {
      currency: 'CAD',
      value: value / 100,
      items: items.map(i => toGAItem(i, i.quantity)),
    });
  },

  purchase(transactionId: string, value: number, items: CartItem[]) {
    push('purchase', {
      transaction_id: transactionId,
      currency: 'CAD',
      value: value / 100,
      items: items.map(i => toGAItem(i, i.quantity)),
    });
  },

  subscribe(plan: string) {
    push('subscribe', { plan, currency: 'CAD' });
  },

  // Store cart contents before Stripe redirect so purchase event can fire on return
  stagePurchase(items: CartItem[], total: number) {
    try {
      sessionStorage.setItem('xplora_pending_purchase', JSON.stringify({ items, total, ts: Date.now() }));
    } catch { /* ignore */ }
  },

  // Store subscription plan before Stripe redirect
  stageSubscribe(plan: string) {
    try {
      sessionStorage.setItem('xplora_pending_subscribe', JSON.stringify({ plan, ts: Date.now() }));
    } catch { /* ignore */ }
  },

  // Call on return from Stripe — fires purchase/subscribe events if staged data exists
  flushPending() {
    try {
      const raw = sessionStorage.getItem('xplora_pending_purchase');
      if (raw) {
        const { items, total, ts } = JSON.parse(raw);
        // Only use if staged within the last 30 minutes
        if (Date.now() - ts < 30 * 60 * 1000) {
          this.purchase(`xplora_${ts}`, total, items);
        }
        sessionStorage.removeItem('xplora_pending_purchase');
      }
    } catch { /* ignore */ }

    try {
      const raw = sessionStorage.getItem('xplora_pending_subscribe');
      if (raw) {
        const { plan, ts } = JSON.parse(raw);
        if (Date.now() - ts < 30 * 60 * 1000) {
          this.subscribe(plan);
        }
        sessionStorage.removeItem('xplora_pending_subscribe');
      }
    } catch { /* ignore */ }
  },
};
