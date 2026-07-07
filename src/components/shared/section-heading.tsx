import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 font-mono text-xs font-medium text-accent">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">{title}</h2>
      {description && <p className="max-w-2xl text-base text-muted">{description}</p>}
    </Reveal>
  );
}
