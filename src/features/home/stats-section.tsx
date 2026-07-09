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
    <section className="border-y border-border bg-surface py-20 md:py-24">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className="flex flex-col items-center text-center lg:border-l lg:border-border lg:first:border-l-0"
            >
              <stat.icon className="mb-4 h-6 w-6 text-accent" aria-hidden />
              <p className="font-heading text-4xl font-bold tracking-tight text-primary md:text-5xl">
                <AnimatedCounter value={stat.value} suffix="+" />
              </p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
