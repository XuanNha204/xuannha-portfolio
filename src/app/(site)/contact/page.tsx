import type { Metadata } from "next";
import { Mail, MapPin, Phone, Download } from "lucide-react";
import { getProfile, getSocialLinks } from "@/services/profile.service";
import { ContactForm } from "@/features/contact/contact-form";
import { SocialIcon } from "@/components/shared/social-icon";
import { Reveal } from "@/components/motion/reveal";
import { T } from "@/components/site/site-preferences";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ với Xuân Nhã — hợp tác dự án, tuyển dụng hoặc trao đổi về công nghệ.",
};

export default async function ContactPage() {
  const [profile, socialLinks] = await Promise.all([getProfile(), getSocialLinks()]);

  return (
    <div className="py-24 md:py-28">
      <div className="container-page">
        <Reveal className="mb-16 max-w-2xl">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {"// contact"}
          </span>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-primary md:text-5xl">
            <T k="contact.title" />
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">
            <T k="contact.description" />
          </p>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <Reveal direction="right">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] md:p-10">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] md:p-7">
                <h2 className="font-heading text-lg font-semibold tracking-tight text-primary">
                  <T k="contact.info" />
                </h2>
                <div className="mt-5 space-y-4 text-sm">
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
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] md:p-7">
                  <h2 className="font-heading text-lg font-semibold tracking-tight text-primary">
                    <T k="contact.social" />
                  </h2>
                  <div className="mt-5 space-y-1.5">
                    {socialLinks.map((link) => (
                      <a
                        key={link._id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-secondary transition-colors duration-200 hover:bg-accent/[0.06] hover:text-accent"
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
                  className="flex items-center justify-center gap-2 rounded-2xl border border-accent/25 bg-accent/[0.06] p-5 font-medium text-accent transition-colors duration-200 hover:border-accent/50 hover:bg-accent/10"
                >
                  <Download className="h-5 w-5" aria-hidden />
                  <T k="common.downloadCv" />
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
