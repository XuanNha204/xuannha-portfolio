import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { PageTransition } from "@/components/motion/page-transition";
import { SitePreferencesProvider } from "@/components/site/site-preferences";
import { ChatWidget } from "@/features/chat/chat-widget";
import { getSiteSettings } from "@/services/settings.service";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <SitePreferencesProvider>
      <SmoothScroll>
        <Header siteName={settings.siteName} logo={settings.logo} />
        <main className="min-h-screen pt-16">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <ChatWidget />
      </SmoothScroll>
    </SitePreferencesProvider>
  );
}
