"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, Moon, Sun, Terminal, X } from "lucide-react";
import { useSitePreferences, type SiteLanguage } from "@/components/site/site-preferences";
import { FlagIcon } from "@/components/site/flag-icon";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/projects", labelKey: "nav.projects" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/contact", labelKey: "nav.contact" },
];

const LANGUAGES: { value: SiteLanguage; code: string; name: string }[] = [
  { value: "vi", code: "VI", name: "Tiếng Việt" },
  { value: "en", code: "EN", name: "English" },
  { value: "zh", code: "中文", name: "中文" },
];

interface HeaderProps {
  siteName: string;
  logo?: string;
}

export function Header({ siteName, logo }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { language, setLanguage, theme, setTheme, t } = useSitePreferences();
  const currentLanguage = LANGUAGES.find((item) => item.value === language) ?? LANGUAGES[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLanguageOpen(false);
  }, [pathname]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const chooseLanguage = (nextLanguage: SiteLanguage) => {
    setLanguage(nextLanguage);
    setLanguageOpen(false);
  };

  const languageMenu = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLanguageOpen((open) => !open)}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-medium text-secondary transition-colors duration-200 hover:border-muted/50 hover:text-primary"
        aria-label={t("prefs.language")}
        aria-expanded={languageOpen}
      >
        <FlagIcon language={currentLanguage.value} />
        <span className="text-xs font-bold">{currentLanguage.code}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", languageOpen && "rotate-180")}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {languageOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow-card-hover)]"
          >
            {LANGUAGES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => chooseLanguage(item.value)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-150",
                  language === item.value
                    ? "bg-accent/10 text-accent"
                    : "text-secondary hover:bg-border/50 hover:text-primary"
                )}
              >
                <FlagIcon language={item.value} />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-border/70" : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          {logo ? (
            <Image src={logo} alt={siteName} width={32} height={32} unoptimized className="rounded-md" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-inverse text-inverse-fg">
              <Terminal className="h-4 w-4" aria-hidden />
            </span>
          )}
          <span>
            {siteName.replace(".Dev", "")}
            <span className="text-accent">.Dev</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                  active ? "text-primary" : "text-muted hover:text-primary"
                )}
              >
                {t(link.labelKey)}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-px rounded-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-3 inline-flex h-9 items-center rounded-full bg-inverse px-4 text-sm font-medium text-inverse-fg transition-colors duration-200 hover:bg-inverse-hover"
          >
            {t("nav.work")}
          </Link>
          <div className="ml-2">{languageMenu}</div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-secondary transition-colors duration-200 hover:border-muted/50 hover:text-primary"
            aria-label={theme === "dark" ? t("prefs.themeLight") : t("prefs.themeDark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </nav>

        <button
          className="rounded-lg p-2 text-primary md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="glass overflow-hidden border-b border-border/70 md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-lg px-3 py-3 text-[15px] font-medium transition-colors duration-150",
                      active ? "bg-accent/10 text-accent" : "text-secondary hover:bg-border/40"
                    )}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
              <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => chooseLanguage(item.value)}
                      className={cn(
                        "flex h-10 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors",
                        language === item.value
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-background text-secondary hover:border-accent hover:text-accent"
                      )}
                    >
                      <FlagIcon language={item.value} />
                      <span className="text-xs font-bold">{item.code}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-secondary"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? t("prefs.themeLight") : t("prefs.themeDark")}
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
