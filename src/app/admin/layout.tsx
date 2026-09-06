import { Providers } from "@/components/providers";

/** Toast notifications are only needed by the CMS and login screen. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
