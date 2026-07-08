"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectDTO } from "@/types";
import { ProjectCard } from "@/components/shared/project-card";
import { cn } from "@/lib/utils";

/**
 * Horizontal project slider: drag-to-scroll, wheel-to-horizontal,
 * snap points, nav buttons and a scroll progress bar.
 */
export function ProjectSlider({ projects }: { projects: ProjectDTO[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    updateState();
    window.addEventListener("resize", updateState);
    return () => window.removeEventListener("resize", updateState);
  }, [updateState, projects.length]);

  // Vertical wheel → horizontal scroll while hovering the track
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (!el) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const max = el.scrollWidth - el.clientWidth;
        const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
        const atEnd = el.scrollLeft >= max && e.deltaY > 0;
        if (!atStart && !atEnd) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !drag.current.active) return;
    const delta = e.clientX - drag.current.startX;
    // Capture the pointer only once the gesture becomes a real drag —
    // capturing on pointerdown would retarget the click to the track
    // and swallow navigation on plain clicks.
    if (!drag.current.moved && Math.abs(delta) > 6) {
      drag.current.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (drag.current.moved) el.scrollLeft = drag.current.startScroll - delta;
  };

  const endDrag = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    drag.current.active = false;
  };

  // Prevent navigation after a drag gesture
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateState}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className="flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
      >
        {projects.map((project) => (
          <div
            key={project._id}
            data-slide
            className="w-[85%] shrink-0 snap-start select-none sm:w-[46%] lg:w-[31.5%]"
          >
            <ProjectCard project={project} className="h-full" />
          </div>
        ))}
      </div>

      {/* Controls + progress */}
      <div className="mt-6 flex items-center gap-6">
        <div className="flex gap-2">
          <button
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Cuộn trái"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-primary shadow-sm transition-all",
              canPrev ? "hover:-translate-y-0.5 hover:border-accent hover:text-accent" : "opacity-40"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Cuộn phải"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-primary shadow-sm transition-all",
              canNext ? "hover:-translate-y-0.5 hover:border-accent hover:text-accent" : "opacity-40"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-150"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
