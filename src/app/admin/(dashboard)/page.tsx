import Link from "next/link";
import { Eye, FolderGit2, FileText, MessageSquare, MailOpen } from "lucide-react";
import { getDashboardStats } from "@/services/stats.service";
import { PageHeader } from "@/features/admin/page-header";
import { ViewsChart } from "@/features/admin/views-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Tổng lượt xem", value: stats.totalViews, icon: Eye, tone: "bg-accent/10 text-accent" },
    {
      label: "Dự án",
      value: stats.totalProjects,
      icon: FolderGit2,
      tone: "bg-success/10 text-success",
      href: "/admin/projects",
    },
    {
      label: "Bài viết",
      value: stats.totalPosts,
      icon: FileText,
      tone: "bg-warning/10 text-warning",
      href: "/admin/posts",
    },
    {
      label: "Tin nhắn",
      value: stats.totalMessages,
      icon: MessageSquare,
      tone: "bg-danger/10 text-danger",
      href: "/admin/messages",
      sub: stats.unreadMessages > 0 ? `${stats.unreadMessages} chưa đọc` : undefined,
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Tổng quan hoạt động của website." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const inner = (
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
              <CardContent className="flex items-center gap-4 p-5">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-primary">{formatNumber(card.value)}</p>
                  <p className="text-xs text-muted">
                    {card.label}
                    {card.sub && <span className="ml-1 font-medium text-danger">· {card.sub}</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {inner}
            </Link>
          ) : (
            <div key={card.label}>{inner}</div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-accent" />
              Lượt xem 30 ngày qua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ViewsChart data={stats.viewsByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MailOpen className="h-4 w-4 text-accent" />
              Trang được xem nhiều
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topPages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Chưa có dữ liệu.</p>
            ) : (
              <ul className="space-y-3">
                {stats.topPages.map((page) => (
                  <li key={page.path} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-mono text-secondary">{page.path}</span>
                    <span className="shrink-0 font-semibold text-primary">
                      {formatNumber(page.views)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
