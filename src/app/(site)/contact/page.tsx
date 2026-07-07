import type { Metadata } from "next";
import { Mail, MapPin, Phone, Download } from "lucide-react";
import { getProfile, getSocialLinks } from "@/services/profile.service";
import { ContactForm } from "@/features/contact/contact-form";
import { SocialIcon } from "@/components/shared/social-icon";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ với Xuân Nhã — hợp tác dự án, tuyển dụng hoặc trao đổi về công nghệ.",
};

export default async function ContactPage() {
  const [profile, socialLinks] = await Promise.all([getProfile(), getSocialLinks()]);

  return (
    <div className="py-20">
      <div className="container-page">
        <Reveal className="mb-14 max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
            {"// contact"}
          </span>
          <h1 className="mt-3 font-heading text-4xl font-bold text-primary md:text-5xl">
            Liên hệ với tôi
          </h1>
          <p className="mt-4 text-lg text-muted">
            Có dự án cần xây dựng, cơ hội hợp tác hay đơn giản muốn trò chuyện về công nghệ? Gửi
            tin nhắn cho tôi bên dưới.
          </p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          <Reveal direction="right">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
                <h2 className="font-heading text-lg font-semibold text-primary">
                  Thông tin liên hệ
                </h2>
                <div className="mt-4 space-y-3 text-sm">
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-3 text-secondary transition-colors hover:text-accent"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Mail className="h-4 w-4" />
                    </span>
                    {profile.email}
                  </a>
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-3 text-secondary transition-colors hover:text-accent"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Phone className="h-4 w-4" />
                      </span>
                      {profile.phone}
                    </a>
                  )}
                  {profile.location && (
                    <p className="flex items-center gap-3 text-secondary">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <MapPin className="h-4 w-4" />
                      </span>
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
                  <h2 className="font-heading text-lg font-semibold text-primary">Mạng xã hội</h2>
                  <div className="mt-4 space-y-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link._id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:bg-accent/5 hover:text-accent"
                      >
                        <SocialIcon platform={link.platform} className="h-4 w-4" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  download="xuan-nha-cv.pdf"
                  className="flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/5 p-5 font-medium text-accent transition-all hover:-translate-y-0.5 hover:bg-accent/10"
                >
                  <Download className="h-5 w-5" />
                  Tải CV của tôi
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
