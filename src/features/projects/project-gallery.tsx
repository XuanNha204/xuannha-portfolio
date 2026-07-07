"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectImageDTO } from "@/types";
import { cn } from "@/lib/utils";

/** Embla-powered gallery: drag, touch, loop, keyboard navigation. */
export function ProjectGallery({ images, title }: { images: ProjectImageDTO[]; title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, align: "start" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emblaApi]);

  if (images.length === 0) return null;

  return (
    <div className="relative" role="region" aria-label={`Thư viện ảnh ${title}`}>
      <div ref={emblaRef} className="overflow-hidden rounded-xl border border-border">
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-video min-w-0 flex-[0_0_100%] bg-border/30">
              <Image
                src={img.url}
                alt={img.alt || `${title} — ảnh ${i + 1}`}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Ảnh trước"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-primary shadow-md backdrop-blur transition-transform hover:scale-105"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Ảnh sau"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-primary shadow-md backdrop-blur transition-transform hover:scale-105"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Chuyển đến ảnh ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === selected ? "w-6 bg-accent" : "w-2 bg-border hover:bg-muted"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
