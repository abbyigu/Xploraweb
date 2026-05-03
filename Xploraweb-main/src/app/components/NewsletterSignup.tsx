import { useEffect, useRef } from "react";

/**
 * Xplora Newsletter Signup — powered by Kit (club-horizon)
 * Embed UID: 361503f84f
 */
export default function NewsletterSignup() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const existingScript = document.querySelector(
      'script[data-uid="361503f84f"]'
    );
    if (existingScript) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.ck && typeof w.ck.initForms === "function") {
        w.ck.initForms();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://club-horizon.kit.com/361503f84f/index.js";
    script.async = true;
    script.setAttribute("data-uid", "361503f84f");
    container.appendChild(script);

    return () => {
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="newsletter-signup w-full"
      aria-label="Newsletter signup"
    />
  );
}
