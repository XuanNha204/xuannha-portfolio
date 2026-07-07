import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/features/admin/sidebar";

export const metadata = {
  title: { default: "CMS", template: "%s | XuanNha.CMS" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "owner") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar userName={session.user.name || session.user.email || "Owner"} />
      <main className="px-4 pb-16 pt-20 lg:ml-64 lg:px-8 lg:pt-8">{children}</main>
    </div>
  );
}
