import type { Metadata } from "next";
import Image from "next/image";
import {
  GraduationCap,
  Briefcase,
  Award,
  Target,
  Download,
  MapPin,
  Mail,
  ExternalLink,
  User,
} from "lucide-react";
import {
  getProfile,
  getEducations,
  getExperiences,
  getCertificates,
  getSkills,
} from "@/services/profile.service";
import { SectionHeading } from "@/components/shared/section-heading";
import { SkillsSection } from "@/features/home/skills-section";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Hồ sơ, học vấn, kinh nghiệm và kỹ năng của Xuân Nhã.",
};

function TimelineItem({
  title,
  subtitle,
  period,
  description,
  extra,
}: {
  title: string;
  subtitle: string;
  period: string;
  description?: string;
  extra?: React.ReactNode;
}) {
  return (
    <RevealItem className="group relative pl-10">
      <span className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-accent/40 bg-surface transition-colors duration-300 group-hover:border-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span
        aria-hidden
        className="absolute left-[7.5px] top-7 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-border to-transparent"
      />
      <p className="font-mono text-xs uppercase tracking-wider text-muted">{period}</p>
      <h3 className="mt-2 font-heading text-lg font-semibold tracking-tight text-primary">
        {title}
      </h3>
      <p className="mt-0.5 text-sm font-medium text-accent">{subtitle}</p>
      {description && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-secondary">
          {description}
        </p>
      )}
      {extra}
    </RevealItem>
  );
}

export default async function AboutPage() {
  const [profile, educations, experiences, certificates, skills] = await Promise.all([
    getProfile(),
    getEducations(),
    getExperiences(),
    getCertificates(),
    getSkills(),
  ]);

  return (
    <>
      {/* Intro */}
      <section className="border-b border-border bg-surface py-24 md:py-28">
        <div className="container-page">
          <div className="grid items-center gap-12 md:grid-cols-[auto_1fr] md:gap-16">
            <Reveal direction="right" className="mx-auto">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={220}
                  height={220}
                  priority
                  unoptimized
                  className="rounded-2xl border border-border object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-52 w-52 items-center justify-center rounded-2xl border border-border bg-background text-muted">
                  <User className="h-16 w-16" />
                </div>
              )}
            </Reveal>
            <Reveal direction="left">
              <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {"// about me"}
              </span>
              <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-primary md:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-3 text-lg text-muted">{profile.headline}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-secondary">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted" /> {profile.location}
                  </span>
                )}
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-1.5 transition-colors hover:text-accent"
                >
                  <Mail className="h-4 w-4 text-muted" /> {profile.email}
                </a>
              </div>
              <p className="mt-6 max-w-2xl whitespace-pre-line leading-relaxed text-secondary">
                {profile.about || "Thông tin giới thiệu sẽ được cập nhật qua CMS."}
              </p>
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  download="xuan-nha-cv.pdf"
                  className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-inverse px-6 text-sm font-medium text-inverse-fg transition-colors duration-200 hover:bg-inverse-hover"
                >
                  <Download className="h-4 w-4" aria-hidden /> Tải CV của tôi
                </a>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Career goal */}
      {profile.careerGoal && (
        <section className="py-16 md:py-20">
          <div className="container-page">
            <Reveal>
              <div className="flex gap-5 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] md:p-8">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Target className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-heading text-xl font-semibold text-primary">
                    Mục tiêu nghề nghiệp
                  </h2>
                  <p className="mt-2 whitespace-pre-line leading-relaxed text-secondary">
                    {profile.careerGoal}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Experience + Education timeline */}
      <section className="py-16 md:py-24">
        <div className="container-page grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal className="mb-10 flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <Briefcase className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-primary">
                Kinh nghiệm
              </h2>
            </Reveal>
            {experiences.length === 0 ? (
              <p className="text-sm text-muted">Chưa có dữ liệu kinh nghiệm.</p>
            ) : (
              <RevealGroup className="space-y-10">
                {experiences.map((exp) => (
                  <TimelineItem
                    key={exp._id}
                    title={exp.position}
                    subtitle={`${exp.company}${exp.location ? ` · ${exp.location}` : ""}`}
                    period={`${formatDate(exp.startDate)} — ${exp.current ? "Hiện tại" : formatDate(exp.endDate)}`}
                    description={exp.description}
                    extra={
                      exp.technologies.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {exp.technologies.map((tech) => (
                            <Badge key={tech}>{tech}</Badge>
                          ))}
                        </div>
                      ) : undefined
                    }
                  />
                ))}
              </RevealGroup>
            )}
          </div>

          <div>
            <Reveal className="mb-10 flex items-center gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-primary">
                Học vấn
              </h2>
            </Reveal>
            {educations.length === 0 ? (
              <p className="text-sm text-muted">Chưa có dữ liệu học vấn.</p>
            ) : (
              <RevealGroup className="space-y-10">
                {educations.map((edu) => (
                  <TimelineItem
                    key={edu._id}
                    title={edu.school}
                    subtitle={`${edu.degree}${edu.field ? ` · ${edu.field}` : ""}`}
                    period={`${formatDate(edu.startDate)} — ${edu.current ? "Hiện tại" : formatDate(edu.endDate)}`}
                    description={[edu.description, edu.gpa ? `GPA: ${edu.gpa}` : ""]
                      .filter(Boolean)
                      .join("\n")}
                  />
                ))}
              </RevealGroup>
            )}
          </div>
        </div>
      </section>

      {/* Skills */}
      <div className="border-y border-border bg-surface">
        <SkillsSection skills={skills} />
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container-page">
            <SectionHeading
              eyebrow="// certificates"
              title="Chứng chỉ"
              description="Các chứng chỉ và khóa học tôi đã hoàn thành."
            />
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((cert) => (
                <RevealItem key={cert._id}>
                  <div className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-warning/30 hover:shadow-[var(--shadow-card-hover)]">
                    <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-warning/20 bg-warning/10 text-warning">
                      <Award className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="font-heading font-semibold tracking-tight text-primary">
                      {cert.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted">
                      {cert.issuer}
                      {cert.issueDate ? ` · ${formatDate(cert.issueDate)}` : ""}
                    </p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-accent hover:underline"
                      >
                        Xem chứng chỉ <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}
    </>
  );
}
