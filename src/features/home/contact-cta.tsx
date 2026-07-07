import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function ContactCta() {
  return (
    <section className="py-24">
      <div className="container-page">
        <Reveal direction="scale">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-8 py-16 text-center shadow-[var(--shadow-card)] md:px-16">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[480px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
            <span className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
              {"// contact"}
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl font-heading text-3xl font-bold text-primary md:text-4xl">
              Bạn có ý tưởng? Hãy cùng biến nó thành sản phẩm.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Tôi luôn sẵn sàng lắng nghe về dự án mới, cơ hội hợp tác hoặc đơn giản là một cuộc
              trò chuyện về công nghệ.
            </p>
            <Link
              href="/contact"
              className="group mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-8 text-base font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg"
            >
              <Mail className="h-4 w-4" />
              Liên hệ ngay
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
