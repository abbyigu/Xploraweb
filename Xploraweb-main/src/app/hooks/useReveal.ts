import { useEffect, useRef, useState } from 'react';

interface RevealOptions {
  delay?: number;
}

const REVEAL_CLASS = 'animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both';
const VIEWPORT_MARGIN = 60;

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

    let ticking = false;
    const check = () => {
      ticking = false;
      // Checks the element's actual position rather than relying on
      // IntersectionObserver threshold-crossing, which never fires if a
      // scroll jump carries the element past the viewport in one frame.
      if (el.getBoundingClientRect().top < window.innerHeight - VIEWPORT_MARGIN) {
        setVisible(true);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(check);
      }
    };

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return {
    ref,
    className: visible ? REVEAL_CLASS : 'opacity-0',
    style: visible && delay ? { animationDelay: `${delay}ms` } : undefined,
  };
}
