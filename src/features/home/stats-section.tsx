import { FolderGit2, FileText, Wrench, Eye } from "lucide-react";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { Reveal } from "@/components/motion/reveal";

interface StatsSectionProps {
  projects: number;
  posts: number;
  skills: number;
  views: number;
}

export function StatsSection({ projects, posts, skills, views }: StatsSectionProps) {
  const stats = [
    { label: "Dự án hoàn thành", value: projects, icon: FolderGit2 },
    { label: "Bài viết chia sẻ", value: posts, icon: FileText },
    { label: "Kỹ năng công nghệ", value: skills, icon: Wrench },
    { label: "Lượt truy cập", value: views, icon: Eye },
  ];

  return (
    <section className="border-y border-border bg-primary py-20 text-white">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="flex flex-col items-center text-center">
              <stat.icon className="mb-3 h-7 w-7 text-accent" />
              <p className="font-heading text-4xl font-bold">
                <AnimatedCounter value={stat.value} suffix="+" />
              </p>
              <p className="mt-1 text-sm text-white/60">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
