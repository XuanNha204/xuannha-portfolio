import { dbConnect } from "@/lib/db";
import { Analytics, BlogPost, Message, Project } from "@/models";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
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

    return {
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
  } catch {
    return empty;
  }
}

export async function trackPageView(path: string) {
  try {
    await dbConnect();
    const date = new Date().toISOString().slice(0, 10);
    await Analytics.updateOne({ path, date }, { $inc: { views: 1 } }, { upsert: true });
  } catch {
    // analytics must never break the site
  }
}
