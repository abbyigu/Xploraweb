import { useEffect, useRef, useState } from 'react';

interface RevealOptions {
  delay?: number;
}

const REVEAL_CLASS = 'animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both';
const VIEWPORT_MARGIN = 60;

// Every useReveal() instance used to run its own scroll listener + rAF +
// getBoundingClientRect() loop. With a dozen instances on one page, one
// instance's setVisible() (a DOM write) would land between two other
// instances' geometry reads on the same scroll tick, forcing a synchronous
// layout recalc each time (Chrome DevTools "forced reflow"). Sharing a
// single listener/loop lets every instance read geometry first and only
// write afterward, so reads and writes stay batched instead of interleaved.
type PendingEntry = { el: HTMLElement; reveal: () => void };
const pending = new Set<PendingEntry>();
let ticking = false;
let listenersAttached = false;

function runCheck() {
  ticking = false;
  const threshold = window.innerHeight - VIEWPORT_MARGIN;
  const toReveal: PendingEntry[] = [];
  for (const entry of pending) {
    if (entry.el.getBoundingClientRect().top < threshold) {
      toReveal.push(entry);
    }
  }
  for (const entry of toReveal) {
    pending.delete(entry);
    entry.reveal();
  }
  if (pending.size === 0) detachListeners();
}

function scheduleCheck() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(runCheck);
  }
}

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  window.addEventListener('scroll', scheduleCheck, { passive: true });
  window.addEventListener('resize', scheduleCheck);
}

function detachListeners() {
  if (!listenersAttached) return;
  listenersAttached = false;
  window.removeEventListener('scroll', scheduleCheck);
  window.removeEventListener('resize', scheduleCheck);
}

export function useReveal<T extends HTMLElement>({ delay = 0 }: RevealOptions = {}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    // Checks the element's actual position rather than relying on
    // IntersectionObserver threshold-crossing, which never fires if a
    // scroll jump carries the element past the viewport in one frame.
    if (el.getBoundingClientRect().top < window.innerHeight - VIEWPORT_MARGIN) {
      setVisible(true);
      return;
    }

    const entry: PendingEntry = { el, reveal: () => setVisible(true) };
    pending.add(entry);
    attachListeners();
    return () => {
      pending.delete(entry);
      if (pending.size === 0) detachListeners();
    };
  }, []);

  return {
    ref,
    className: visible ? REVEAL_CLASS : 'opacity-0',
    style: visible && delay ? { animationDelay: `${delay}ms` } : undefined,
  };
}
