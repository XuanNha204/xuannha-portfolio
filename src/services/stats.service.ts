import { dbConnect } from "@/lib/db";
import { Analytics } from "@/models/Analytics";
import { BlogPost } from "@/models/BlogPost";
import { Message } from "@/models/Message";
import { Project } from "@/models/Project";
import { logPerformance } from "@/lib/performance";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const startedAt = performance.now();
  const empty: DashboardStats = {
    totalViews: 0,
    totalProjects: 0,
    totalPosts: 0,
    totalMessages: 0,
    unreadMessages: 0,
    viewsByDay: [],
    topPages: [],
  };

  try {
    await dbConnect();

    const since = new Date();
    since.setDate(since.getDate() - 29);
    const sinceStr = since.toISOString().slice(0, 10);

    const [totalProjects, totalPosts, totalMessages, unreadMessages, viewsAgg, byDay, topPages] =
      await Promise.all([
        Project.countDocuments(),
        BlogPost.countDocuments(),
        Message.countDocuments(),
        Message.countDocuments({ read: false }),
        Analytics.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
        Analytics.aggregate([
          { $match: { date: { $gte: sinceStr } } },
          { $group: { _id: "$date", views: { $sum: "$views" } } },
          { $sort: { _id: 1 } },
        ]),
        Analytics.aggregate([
          { $group: { _id: "$path", views: { $sum: "$views" } } },
          { $sort: { views: -1 } },
          { $limit: 8 },
        ]),
      ]);

    const result = {
      totalViews: viewsAgg[0]?.total ?? 0,
      totalProjects,
      totalPosts,
      totalMessages,
      unreadMessages,
      viewsByDay: byDay.map((d: { _id: string; views: number }) => ({
        date: d._id,
        views: d.views,
      })),
      topPages: topPages.map((p: { _id: string; views: number }) => ({
        path: p._id,
        views: p.views,
      })),
    };
    logPerformance("dashboard.stats", performance.now() - startedAt, { outcome: "ok" });
    return result;
  } catch {
    logPerformance(
      "dashboard.stats",
      performance.now() - startedAt,
      { outcome: "error" },
      true
    );
    return empty;
  }
}
