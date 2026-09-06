"use client";

import { useEffect, useRef } from "react";

export function AmbientVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = true;
    const sync = () => {
      if (document.hidden || !visible) video.pause();
      else video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(video);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); video.pause(); document.removeEventListener("visibilitychange", sync); };
  }, [src]);
  return <video key={src} ref={ref} className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={poster} aria-hidden="true">
    <source src={src} type="video/mp4" />
  </video>;
}