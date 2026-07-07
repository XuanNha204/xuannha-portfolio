import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, User } from "lucide-react";
import type { ProfileDTO } from "@/types";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";

export function AboutPreview({ profile }: { profile: ProfileDTO }) {
  return (
    <section className="border-y border-border bg-surface py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="// about"
          title="Về tôi"
          description="Một vài dòng ngắn gọn về con người phía sau những dòng code."
        />

        <div className="grid items-center gap-12 md:grid-cols-[auto_1fr]">
          <Reveal direction="right" className="mx-auto">
            <div className="relative">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={240}
                  height={240}
                  unoptimized
                  className="rounded-2xl border border-border object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-60 w-60 items-center justify-center rounded-2xl border border-border bg-background text-muted">
                  <User className="h-16 w-16" />
                </div>
              )}
              <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl border border-accent/30 bg-accent/5" />
            </div>
          </Reveal>

          <Reveal direction="left">
            <h3 className="font-heading text-2xl font-bold text-primary">{profile.name}</h3>
            {profile.location && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </p>
            )}
            <p className="mt-4 whitespace-pre-line leading-relaxed text-secondary">
              {profile.about ||
                "Tôi là một lập trình viên đam mê xây dựng sản phẩm web hiện đại. Với triết lý Vibe Coding, tôi kết hợp sức mạnh của AI với kinh nghiệm phát triển phần mềm để tạo ra những sản phẩm chất lượng cao trong thời gian ngắn."}
            </p>
            <Link
              href="/about"
              className="group mt-6 inline-flex items-center gap-2 font-medium text-accent"
            >
              Tìm hiểu thêm về tôi
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
