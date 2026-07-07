"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import type { ProfileDTO, SocialLinkDTO } from "@/types";
import { SocialIcon } from "@/components/shared/social-icon";
import { useSitePreferences } from "@/components/site/site-preferences";

interface HeroProps {
  profile: ProfileDTO;
  socialLinks: SocialLinkDTO[];
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

export function Hero({ profile, socialLinks }: HeroProps) {
  const { t } = useSitePreferences();

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-page relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
        <motion.div variants={container} initial="hidden" animate="visible" className="flex flex-col items-center">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 font-mono text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </span>
          </motion.div>

          {profile.avatar && (
            <motion.div variants={item} className="mt-8">
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={112}
                height={112}
                priority
                unoptimized
                className="rounded-full border-4 border-surface object-cover shadow-lg"
              />
            </motion.div>
          )}

          <motion.h1
            variants={item}
            className="mt-8 max-w-4xl text-4xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl"
          >
            {t("hero.greeting")}{" "}
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              {profile.name}
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-2xl text-lg text-muted md:text-xl">
            {profile.headline || t("hero.fallbackHeadline")}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/projects"
              className="group inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-7 text-base font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-secondary hover:shadow-lg"
            >
              {t("common.viewProjects")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                download="xuan-nha-cv.pdf"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-surface px-7 text-base font-medium text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                <Download className="h-4 w-4" />
                {t("common.downloadCvShort")}
              </a>
            )}
          </motion.div>

          {socialLinks.length > 0 && (
            <motion.div variants={item} className="mt-10 flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-secondary shadow-sm transition-all hover:-translate-y-1 hover:border-accent hover:text-accent"
                >
                  <SocialIcon platform={link.platform} className="h-4.5 w-4.5" />
                </a>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
