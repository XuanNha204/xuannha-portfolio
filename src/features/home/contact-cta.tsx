import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function ContactCta() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <Reveal direction="scale">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-8 py-20 text-center shadow-[var(--shadow-card)] md:px-16 md:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
            />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {"// contact"}
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Bạn có ý tưởng? Hãy cùng biến nó thành sản phẩm.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted md:text-lg">
              Tôi luôn sẵn sàng lắng nghe về dự án mới, cơ hội hợp tác hoặc đơn giản là một cuộc
              trò chuyện về công nghệ.
            </p>
            <Link
              href="/contact"
              className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-inverse px-8 text-[15px] font-medium text-inverse-fg transition-colors duration-200 hover:bg-inverse-hover"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Liên hệ ngay
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
