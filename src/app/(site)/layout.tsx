import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/services/settings.service";
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return <div className="single-site"><Header siteName={settings.siteName} /><main id="main-content">{children}</main><Footer /></div>;
}
