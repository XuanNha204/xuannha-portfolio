"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/** Lenis-powered smooth scrolling for the public site. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      anchors: true,
    });

    let frame: number;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }

    function handleVisibilityChange() {
      cancelAnimationFrame(frame);
      if (document.hidden) {
        lenis.stop();
      } else {
        lenis.start();
        frame = requestAnimationFrame(raf);
      }
    }

    frame = requestAnimationFrame(raf);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
