"use client";

import { motion } from "framer-motion";
import type { SkillDTO } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { Wrench } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  devops: "DevOps",
  tools: "Công cụ",
  other: "Khác",
};

export function SkillsSection({ skills }: { skills: SkillDTO[] }) {
  const grouped = skills.reduce<Record<string, SkillDTO[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  const categories = Object.keys(CATEGORY_LABELS).filter((c) => grouped[c]?.length);

  return (
    <section className="py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="// skills"
          title="Kỹ năng chuyên môn"
          description="Công nghệ và công cụ tôi sử dụng hàng ngày để xây dựng sản phẩm."
        />

        {categories.length === 0 ? (
          <EmptyState
            icon={<Wrench className="h-6 w-6" />}
            title="Chưa có kỹ năng nào"
            description="Danh sách kỹ năng sẽ được cập nhật qua CMS."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
              >
                <h3 className="mb-5 font-mono text-sm font-semibold uppercase tracking-wider text-accent">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {grouped[category].map((skill) => (
                    <span
                      key={skill._id}
                      className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-primary"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
