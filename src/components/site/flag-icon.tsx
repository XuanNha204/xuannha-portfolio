import type { SiteLanguage } from "@/components/site/site-preferences";
import { cn } from "@/lib/utils";

// Self-contained SVG flags (emoji flags don't render on Windows/Chrome).
const FLAGS: Record<SiteLanguage, React.ReactElement> = {
  vi: (
    <svg viewBox="0 0 24 16" aria-hidden>
      <rect width="24" height="16" fill="#DA251D" />
      <path
        d="M12 3 L13.18 6.38 L16.76 6.45 L13.90 8.62 L14.94 12.05 L12 10 L9.06 12.05 L10.10 8.62 L7.25 6.45 L10.82 6.38 Z"
        fill="#FFFF00"
      />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 24 16" aria-hidden>
      <rect width="24" height="16" fill="#FFFFFF" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={i * (16 / 13)} width="24" height={16 / 13} fill="#B22234" />
      ))}
      <rect width="9.6" height={7 * (16 / 13)} fill="#3C3B6E" />
      {[1.6, 4, 6.4].flatMap((y) =>
        [1.4, 3.4, 5.4, 7.4].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" fill="#FFFFFF" />
        ))
      )}
    </svg>
  ),
  zh: (
    <svg viewBox="0 0 24 16" aria-hidden>
      <rect width="24" height="16" fill="#DE2910" />
      <path
        d="M5 1.5 L5.71 3.53 L7.85 3.57 L6.14 4.87 L6.76 6.93 L5 5.7 L3.24 6.93 L3.86 4.87 L2.15 3.57 L4.30 3.53 Z"
        fill="#FFDE00"
      />
      {[
        [9, 2],
        [11, 4],
        [11, 7],
        [9, 9],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.75" fill="#FFDE00" />
      ))}
    </svg>
  ),
};

export function FlagIcon({ language, className }: { language: SiteLanguage; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-6 shrink-0 overflow-hidden rounded-sm ring-1 ring-black/10",
        className
      )}
    >
      {FLAGS[language]}
    </span>
  );
}
