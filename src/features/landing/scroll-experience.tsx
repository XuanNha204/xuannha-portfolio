"use client";

import { useEffect } from "react";

/** Native scroll only: one queued frame, no wheel interception or scroll hijacking. */
export function ScrollExperience() {
  useEffect(() => {
    const root = document.documentElement;
    const reveals = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const hero = document.querySelector<HTMLElement>(".hero-track");
    const scene = document.querySelector<HTMLElement>(".hero-scene");
    const statement = document.querySelector<HTMLElement>(".about-statement");
    const cards = [...document.querySelectorAll<HTMLElement>(".skill-card")];
    const update = () => {
      frame = 0;
      const height = innerHeight;
      const maxScroll = root.scrollHeight - height;
      // Read geometry together before changing styles to avoid layout thrashing.
      const heroRect = hero?.getBoundingClientRect();
      const statementTop = statement?.getBoundingClientRect().top;
      const cardTops = cards.map((card) => card.getBoundingClientRect().top);
      root.style.setProperty("--page-progress", String(maxScroll > 0 ? scrollY / maxScroll : 0));
      root.classList.toggle("page-scrolled", scrollY > 40);
      if (heroRect && scene) {
        const rect = heroRect;
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - height)));
        scene.style.setProperty("--hero-progress", progress.toFixed(4));
      }
      if (statement && statementTop !== undefined) {
        const progress = Math.min(1, Math.max(0, (height * .85 - statementTop) / (height * .55)));
        statement.style.setProperty("--statement-progress", progress.toFixed(4));
      }
      cards.forEach((card, index) => {
        const nextTop = cardTops[index + 1];
        const progress = nextTop !== undefined ? Math.min(1, Math.max(0, (height * .7 - nextTop) / (height * .55))) : 0;
        card.style.setProperty("--stack-progress", progress.toFixed(4));
      });
    };
    const queue = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(update); };
    const setup = () => {
      observer?.disconnect();
      root.classList.add("motion-ready");
      observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer?.unobserve(entry.target); }
      }), { threshold: .12, rootMargin: "0px 0px -24px 0px" });
      reveals.forEach((el) => observer!.observe(el));
      update();
    };
    setup();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    document.addEventListener("visibilitychange", queue);
    return () => {
      cancelAnimationFrame(frame); observer?.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      document.removeEventListener("visibilitychange", queue);
      root.classList.remove("motion-ready", "page-scrolled");
      root.style.removeProperty("--page-progress");
    };
  }, []);
  return null;
}
