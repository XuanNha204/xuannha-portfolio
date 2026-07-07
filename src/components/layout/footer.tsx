import Link from "next/link";
import { getSocialLinks } from "@/services/profile.service";
import { getSiteSettings } from "@/services/settings.service";
import { SocialIcon } from "@/components/shared/social-icon";
import { T } from "@/components/site/site-preferences";

export async function Footer() {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()]);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <p className="font-heading text-lg font-bold">
              {settings.siteName.replace(".Dev", "")}
              <span className="text-accent">.Dev</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted">
              {settings.footerText || (
                <>
                  {settings.tagline} - <T k="footer.fallback" />
                </>
              )}
            </p>
          </div>

          {/* Explore */}
          <nav className="flex flex-col gap-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              <T k="footer.explore" />
            </p>
            <Link href="/" className="text-secondary transition-colors hover:text-accent">
              <T k="nav.home" />
            </Link>
            <Link href="/about" className="text-secondary transition-colors hover:text-accent">
              <T k="nav.about" />
            </Link>
            <Link href="/projects" className="text-secondary transition-colors hover:text-accent">
              <T k="nav.projects" />
            </Link>
            <Link href="/blog" className="text-secondary transition-colors hover:text-accent">
              <T k="nav.blog" />
            </Link>
          </nav>

          {/* Connect */}
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              <T k="footer.connect" />
            </p>
            <Link href="/contact" className="text-secondary transition-colors hover:text-accent">
              <T k="nav.contact" />
            </Link>
            <Link href="/rss.xml" className="text-secondary transition-colors hover:text-accent">
              <T k="common.rss" />
            </Link>
            {socialLinks.length > 0 && (
              <div className="mt-1 flex items-center gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-secondary transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                  >
                    <SocialIcon platform={link.platform} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} {settings.siteName}. <T k="footer.builtWith" />
        </div>
      </div>
    </footer>
  );
}
