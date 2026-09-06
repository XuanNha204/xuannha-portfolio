import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/api-helpers";
import { AdminQueryProvider } from "@/features/admin/query-provider";
export const metadata = { title: "Quản lý nội dung", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { error } = await requireOwner();
  if (error) redirect("/admin/login");
  return <AdminQueryProvider><main className="mx-auto min-h-screen max-w-6xl px-5 py-8 md:px-8 md:py-12">{children}</main></AdminQueryProvider>;
}
