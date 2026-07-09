import Link from "next/link";
import { getSocialLinks } from "@/services/profile.service";
import { getSiteSettings } from "@/services/settings.service";
import { SocialIcon } from "@/components/shared/social-icon";
import { T } from "@/components/site/site-preferences";

export async function Footer() {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()]);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-16 md:py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <p className="font-heading text-lg font-bold tracking-tight">
              {settings.siteName.replace(".Dev", "")}
              <span className="text-accent">.Dev</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {settings.footerText || (
                <>
                  {settings.tagline} - <T k="footer.fallback" />
                </>
              )}
            </p>
          </div>

          {/* Explore */}
          <nav className="flex flex-col gap-3.5 text-sm">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              <T k="footer.explore" />
            </p>
            <Link href="/" className="w-fit text-muted transition-colors duration-200 hover:text-primary">
              <T k="nav.home" />
            </Link>
            <Link href="/about" className="w-fit text-muted transition-colors duration-200 hover:text-primary">
              <T k="nav.about" />
            </Link>
            <Link href="/projects" className="w-fit text-muted transition-colors duration-200 hover:text-primary">
              <T k="nav.projects" />
            </Link>
            <Link href="/blog" className="w-fit text-muted transition-colors duration-200 hover:text-primary">
              <T k="nav.blog" />
            </Link>
          </nav>

          {/* Connect */}
          <div className="flex flex-col gap-3.5 text-sm">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              <T k="footer.connect" />
            </p>
            <Link href="/contact" className="w-fit text-muted transition-colors duration-200 hover:text-primary">
              <T k="nav.contact" />
            </Link>
            <Link href="/rss.xml" className="w-fit text-muted transition-colors duration-200 hover:text-primary">
              <T k="common.rss" />
            </Link>
            {socialLinks.length > 0 && (
              <div className="mt-2 flex items-center gap-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors duration-200 hover:border-accent/40 hover:text-accent"
                  >
                    <SocialIcon platform={link.platform} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-8 text-center text-xs text-muted">
          © {new Date().getFullYear()} {settings.siteName}. <T k="footer.builtWith" />
        </div>
      </div>
    </footer>
  );
}
