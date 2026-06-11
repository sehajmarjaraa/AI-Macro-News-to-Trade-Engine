import { useEffect, useRef } from "react";

/**
 * Adds .in to a .reveal element the first time it enters (or is found to be
 * at/above) the viewport. Belt-and-suspenders: an element must never stay
 * hidden — anchor jumps, restored scroll positions, and instant scrolls all
 * count as "seen".
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.classList.add("in");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }
    const seen = () => el.getBoundingClientRect().top < window.innerHeight * 0.94;
    if (seen()) {
      show();
      return;
    }
    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            show();
            cleanup();
          }
        }
      },
      { threshold: 0 },
    );
    // Fail-open fallback: scroll/IO events are unreliable in some embedded
    // webviews (e.g. in-app browsers). A cheap position poll guarantees a
    // section can never stay hidden; it stops as soon as the element shows.
    const poll = window.setInterval(() => {
      if (seen()) {
        show();
        cleanup();
      }
    }, 250);
    function cleanup() {
      ob.disconnect();
      window.clearInterval(poll);
    }
    ob.observe(el);
    return cleanup;
  }, []);
  return ref;
}
