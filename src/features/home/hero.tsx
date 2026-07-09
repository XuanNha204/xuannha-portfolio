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
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

export function Hero({ profile, socialLinks }: HeroProps) {
  const { t } = useSitePreferences();

  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid fading toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 65% 55% at 50% 38%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 38%, black, transparent)",
        }}
      />
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-120px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-3xl"
      />

      <div className="container-page relative flex min-h-[calc(92svh-4rem)] flex-col items-center justify-center pb-20 pt-10 text-center md:pb-28 md:pt-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 font-mono text-xs font-medium tracking-wide text-secondary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
              {t("hero.badge")}
            </span>
          </motion.div>

          {profile.avatar && (
            <motion.div variants={item} className="mt-12">
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
            className="mt-10 max-w-4xl text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {t("hero.greeting")}{" "}
            <span className="bg-gradient-to-br from-accent via-accent to-accent-hover bg-clip-text text-transparent">
              {profile.name}
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl"
          >
            {profile.headline || t("hero.fallbackHeadline")}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              href="/projects"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-inverse px-7 text-[15px] font-medium text-inverse-fg transition-colors duration-200 hover:bg-inverse-hover"
            >
              {t("common.viewProjects")}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                download="xuan-nha-cv.pdf"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-surface/60 px-7 text-[15px] font-medium text-primary backdrop-blur-sm transition-colors duration-200 hover:border-muted/50 hover:bg-surface"
              >
                <Download className="h-4 w-4 text-muted" aria-hidden />
                {t("common.downloadCvShort")}
              </a>
            )}
          </motion.div>

          {socialLinks.length > 0 && (
            <motion.div variants={item} className="mt-12 flex items-center gap-2.5">
              {socialLinks.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/60 text-muted backdrop-blur-sm transition-colors duration-200 hover:border-accent/40 hover:text-accent"
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
