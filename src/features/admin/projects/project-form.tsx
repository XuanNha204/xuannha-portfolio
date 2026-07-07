"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProjectDTO, ProjectImageDTO } from "@/types";
import { apiPost, apiPut } from "@/lib/fetcher";
import { PageHeader } from "@/features/admin/page-header";
import { ImageUpload } from "@/features/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormValues {
  title: string;
  slug: string;
  summary: string;
  description: string;
  videoUrl: string;
  githubUrl: string;
  demoUrl: string;
  techStack: string;
  role: string;
  challenges: string;
  solutions: string;
  results: string;
  tags: string;
  status: "draft" | "published" | "archived";
  completedAt: string;
  order: number;
}

export function ProjectForm({ project }: { project?: ProjectDTO }) {
  const router = useRouter();
  const isEdit = !!project;

  const [coverImage, setCoverImage] = useState(project?.coverImage ?? "");
  const [gallery, setGallery] = useState<ProjectImageDTO[]>(project?.gallery ?? []);
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [galleryUploadKey, setGalleryUploadKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      summary: project?.summary ?? "",
      description: project?.description ?? "",
      videoUrl: project?.videoUrl ?? "",
      githubUrl: project?.githubUrl ?? "",
      demoUrl: project?.demoUrl ?? "",
      techStack: project?.techStack.join(", ") ?? "",
      role: project?.role ?? "",
      challenges: project?.challenges ?? "",
      solutions: project?.solutions ?? "",
      results: project?.results ?? "",
      tags: project?.tags.join(", ") ?? "",
      status: project?.status ?? "draft",
      completedAt: project?.completedAt ? project.completedAt.slice(0, 10) : "",
      order: project?.order ?? 0,
    },
  });

  const splitList = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      order: Number(values.order) || 0,
      techStack: splitList(values.techStack),
      tags: splitList(values.tags),
      coverImage,
      gallery,
      featured,
    };

    try {
      if (isEdit) {
        await apiPut(`/api/projects/${project._id}`, payload);
        toast.success("Đã cập nhật dự án");
      } else {
        await apiPost("/api/projects", payload);
        toast.success("Đã tạo dự án");
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title={isEdit ? `Sửa: ${project.title}` : "Thêm dự án mới"}
        description="Điền thông tin chi tiết về dự án."
      >
        <Link href="/admin/projects">
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
        </Link>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {!isSubmitting && <Save className="h-4 w-4" />}
          {isEdit ? "Cập nhật" : "Tạo dự án"}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên dự án *</Label>
                <Input id="title" {...register("title", { required: "Bắt buộc" })} />
                {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (bỏ trống để tự tạo)</Label>
                <Input id="slug" placeholder="ten-du-an" {...register("slug")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Tóm tắt ngắn</Label>
                <Textarea id="summary" rows={2} {...register("summary")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết (Markdown)</Label>
                <Textarea
                  id="description"
                  rows={10}
                  className="font-mono text-xs"
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Câu chuyện dự án</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò của bạn</Label>
                <Input id="role" placeholder="Fullstack Developer" {...register("role")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="challenges">Khó khăn</Label>
                <Textarea id="challenges" rows={3} {...register("challenges")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solutions">Giải pháp</Label>
                <Textarea id="solutions" rows={3} {...register("solutions")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="results">Kết quả</Label>
                <Textarea id="results" rows={3} {...register("results")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thư viện ảnh (Gallery)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {gallery.map((img, i) => (
                  <div
                    key={`${img.url}-${i}`}
                    className="group relative aspect-video overflow-hidden rounded-lg border border-border"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || ""}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="200px"
                    />
                    <button
                      type="button"
                      onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))}
                      className="absolute right-1.5 top-1.5 rounded-full bg-primary/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Xóa ảnh"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <ImageUpload
                  key={galleryUploadKey}
                  folder="xuannha-dev/projects"
                  label="Thêm ảnh"
                  onChange={(url) => {
                    if (url) {
                      setGallery((g) => [...g, { url, order: g.length }]);
                      setGalleryUploadKey((k) => k + 1);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Xuất bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select {...register("status")}>
                  <option value="draft">Nháp</option>
                  <option value="published">Công khai</option>
                  <option value="archived">Lưu trữ</option>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Dự án nổi bật</Label>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completedAt">Ngày hoàn thành</Label>
                <Input id="completedAt" type="date" {...register("completedAt")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Thứ tự hiển thị</Label>
                <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ảnh cover</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                folder="xuannha-dev/projects"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liên kết & công nghệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">Github URL</Label>
                <Input id="githubUrl" placeholder="https://github.com/…" {...register("githubUrl")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo URL</Label>
                <Input id="demoUrl" placeholder="https://…" {...register("demoUrl")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input id="videoUrl" placeholder="https://youtube.com/…" {...register("videoUrl")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="techStack">Tech stack (phân cách bởi dấu phẩy)</Label>
                <Input id="techStack" placeholder="Next.js, MongoDB, Tailwind" {...register("techStack")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (phân cách bởi dấu phẩy)</Label>
                <Input id="tags" placeholder="web, fullstack" {...register("tags")} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
