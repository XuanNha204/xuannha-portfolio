"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPut } from "@/lib/fetcher";
import { resolveSiteContent, sampleSkills, type SiteContent } from "@/lib/site-content";
import type { SiteSettingsDTO } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type TextKey = Exclude<keyof SiteContent, "skills" | "chatbotEnabled">;
const sections: { title: string; anchor: string; fields: { key: TextKey; label: string; max: number }[] }[] = [
  { title: "Mở đầu", anchor: "#home", fields: [
    { key: "heroEyebrow", label: "Dòng chữ nhỏ", max: 100 },
    { key: "homeTitle", label: "Tiêu đề (xuống dòng để chia câu)", max: 100 },
    { key: "homeDescription", label: "Giới thiệu ngắn", max: 240 },
    { key: "heroVideo", label: "Đường dẫn video nền", max: 2048 },
    { key: "heroPoster", label: "Ảnh chờ của video", max: 2048 },
  ] },
  { title: "Giới thiệu", anchor: "#about", fields: [
    { key: "aboutTitle", label: "Tiêu đề", max: 150 },
    { key: "aboutNote", label: "Câu ghi chú", max: 120 },
  ] },
  { title: "Kỹ năng", anchor: "#skills", fields: [
    { key: "skillsTitle", label: "Tiêu đề", max: 100 },
    { key: "skillsDescription", label: "Mô tả", max: 200 },
  ] },
  { title: "Dự án trên GitHub", anchor: "#work", fields: [
    { key: "projectsTitle", label: "Tiêu đề", max: 100 },
    { key: "projectsDescription", label: "Giới thiệu ngắn", max: 240 },
    { key: "projectsUrl", label: "Liên kết GitHub", max: 2048 },
  ] },
  { title: "Hợp tác & chân trang", anchor: "#contact", fields: [
    { key: "contactTitle", label: "Tiêu đề", max: 100 },
    { key: "contactDescription", label: "Lời mời hợp tác", max: 240 },
    { key: "contactEmail", label: "Email nhận liên hệ", max: 254 },
    { key: "availability", label: "Trạng thái hợp tác", max: 80 },
    { key: "footerNote", label: "Lời nhắn ở chân trang", max: 240 },
  ] },
];
export function SiteContentForm() {
  const query = useQuery({ queryKey: ["settings"], queryFn: () => apiGet<SiteSettingsDTO>("/api/settings") });
  if (query.isPending) return <p role="status">Đang tải nội dung…</p>;
  if (query.isError) return <div role="alert"><p>Không tải được nội dung.</p><Button onClick={() => query.refetch()}>Thử lại</Button></div>;
  return <ContentFields initial={query.data} />;
}
function ContentFields({ initial }: { initial: SiteSettingsDTO }) {
  const client = useQueryClient();
  const { register, handleSubmit, reset, control, formState: { isSubmitting, isDirty } } = useForm<SiteSettingsDTO>({
    defaultValues: { ...initial, content: resolveSiteContent(initial.content) },
  });
  const skills = useFieldArray({ control, name: "content.skills" });
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);
  async function save(values: SiteSettingsDTO) {
    try {
      const saved = await apiPut<SiteSettingsDTO>("/api/settings", values);
      reset({ ...saved, content: resolveSiteContent(saved.content) });
      client.setQueryData(["settings"], saved);
      toast.success("Đã cập nhật nội dung một trang");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Lưu thất bại"); }
  }
  return <form onSubmit={handleSubmit(save)} className="space-y-6">
    <div className="grid items-start gap-5 lg:grid-cols-2">
      {sections.map((section) => <fieldset key={section.anchor} className="min-w-0 rounded-xl border border-border bg-surface p-5">
        <legend className="px-2 font-semibold">{section.title}</legend>
        <a href={"/" + section.anchor} target="_blank" rel="noopener noreferrer" className="mb-4 block text-right text-xs text-accent">Xem phần này ↗</a>
        <div className="space-y-4">{section.fields.map((field) => <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.key.endsWith("Title") || field.max === 240 || field.max === 200
            ? <Textarea id={field.key} rows={2} maxLength={field.max} {...register(`content.${field.key}`)} />
            : <Input id={field.key} type={field.key === "contactEmail" ? "email" : "text"} maxLength={field.max} {...register(`content.${field.key}`)} />}
        </div>)}</div>
      </fieldset>)}
    </div>
    <fieldset className="rounded-xl border border-border bg-surface p-5">
      <legend className="px-2 font-semibold">Các thẻ kỹ năng</legend>
      <p className="mb-5 text-xs text-muted">Các kỹ năng ban đầu là mẫu. Thay bằng chuyên môn thực tế của bạn.</p>
      <div className="space-y-5">{skills.fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
        <label className="space-y-2 text-xs">Tên nhóm<Input required maxLength={50} {...register(`content.skills.${index}.category`)} /></label>
        <label className="space-y-2 text-xs">Tiêu đề<Input required maxLength={100} {...register(`content.skills.${index}.title`)} /></label>
        <label className="space-y-2 text-xs sm:col-span-2">Mô tả<Textarea rows={2} maxLength={240} {...register(`content.skills.${index}.description`)} /></label>
        <label className="space-y-2 text-xs">Công nghệ (ngăn cách bằng ·)<Input maxLength={150} {...register(`content.skills.${index}.tools`)} /></label>
        <label className="space-y-2 text-xs">Số hiển thị<Input maxLength={10} {...register(`content.skills.${index}.symbol`)} /></label>
        <div className="flex gap-3 sm:col-span-2"><Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => skills.move(index, index - 1)}>Lên trên</Button><Button type="button" size="sm" variant="ghost" disabled={skills.fields.length <= 1} onClick={() => skills.remove(index)}>Xóa thẻ</Button></div>
      </div>)}</div>
      <Button type="button" variant="outline" className="mt-4" disabled={skills.fields.length >= 6} onClick={() => skills.append({ ...sampleSkills[0], symbol: String(skills.fields.length + 1).padStart(2, "0") })}>Thêm kỹ năng</Button>
    </fieldset>
    <fieldset className="rounded-xl border border-border bg-surface p-5">
      <legend className="px-2 font-semibold">Trợ lý AI</legend>
      <label className="mb-5 flex items-center gap-3 text-sm"><input type="checkbox" {...register("content.chatbotEnabled")} />Hiển thị thú cưng và chatbot</label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-xs">Tên trợ lý<Input required maxLength={30} {...register("content.chatbotName")} /></label>
        <label className="space-y-2 text-xs">Lời chào<Textarea maxLength={200} rows={2} {...register("content.chatbotGreeting")} /></label>
      </div>
    </fieldset>
    <details className="rounded-xl border border-border bg-surface p-5">
      <summary className="font-semibold">Tên website & tìm kiếm</summary>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-xs">Tên website<Input required maxLength={100} {...register("siteName")} /></label>
        <label className="space-y-2 text-xs">Dòng mô tả<Input maxLength={200} {...register("tagline")} /></label>
        <label className="space-y-2 text-xs">Tiêu đề tìm kiếm<Input maxLength={100} {...register("seo.metaTitle")} /></label>
        <label className="space-y-2 text-xs">Mô tả tìm kiếm<Textarea rows={2} maxLength={240} {...register("seo.metaDescription")} /></label>
      </div>
    </details>
    <div className="sticky bottom-0 flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <Button type="submit" loading={isSubmitting}>Lưu nội dung</Button><span className="text-xs text-muted" role="status">{isDirty ? "Có thay đổi chưa lưu" : "Nội dung đã lưu"}</span>
    </div>
  </form>;
}
