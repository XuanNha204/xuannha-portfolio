"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, PenLine } from "lucide-react";
import type { BlogPostDTO, CategoryDTO } from "@/types";
import { apiGet, apiPost, apiPut } from "@/lib/fetcher";
import { PageHeader } from "@/features/admin/page-header";
import { ImageUpload } from "@/features/admin/image-upload";
import { Markdown } from "@/components/shared/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  status: "draft" | "published" | "scheduled";
  scheduledAt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
}

export function PostForm({ post }: { post?: BlogPostDTO }) {
  const router = useRouter();
  const isEdit = !!post;

  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [tab, setTab] = useState<"write" | "preview">("write");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<CategoryDTO[]>("/api/categories"),
  });

  const initialCategory =
    typeof post?.category === "object" && post?.category ? post.category._id : (post?.category ?? "");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? "",
      category: initialCategory as string,
      tags: post?.tags.join(", ") ?? "",
      status: post?.status ?? "draft",
      scheduledAt: post?.scheduledAt ? post.scheduledAt.slice(0, 16) : "",
      seoTitle: post?.seo?.metaTitle ?? "",
      seoDescription: post?.seo?.metaDescription ?? "",
      seoKeywords: post?.seo?.keywords?.join(", ") ?? "",
      canonicalUrl: post?.seo?.canonicalUrl ?? "",
    },
  });

  const content = watch("content");
  const status = watch("status");

  const splitList = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  async function onSubmit(values: FormValues) {
    const payload = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: values.content,
      coverImage,
      category: values.category || "",
      tags: splitList(values.tags),
      status: values.status,
      scheduledAt: values.status === "scheduled" ? values.scheduledAt : "",
      featured,
      seo: {
        metaTitle: values.seoTitle,
        metaDescription: values.seoDescription,
        keywords: splitList(values.seoKeywords),
        ogImage: coverImage,
        canonicalUrl: values.canonicalUrl,
      },
    };

    try {
      if (isEdit) {
        await apiPut(`/api/posts/${post._id}`, payload);
        toast.success("Đã cập nhật bài viết");
      } else {
        await apiPost("/api/posts", payload);
        toast.success("Đã tạo bài viết");
      }
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title={isEdit ? `Sửa: ${post.title}` : "Viết bài mới"}
        description="Soạn nội dung bằng Markdown, xem trước trực tiếp."
      >
        <Link href="/admin/posts">
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
        </Link>
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {!isSubmitting && <Save className="h-4 w-4" />}
          {isEdit ? "Cập nhật" : "Lưu bài viết"}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input id="title" {...register("title", { required: "Bắt buộc" })} />
                {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (bỏ trống để tự tạo)</Label>
                <Input id="slug" placeholder="tieu-de-bai-viet" {...register("slug")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Mô tả ngắn</Label>
                <Textarea id="excerpt" rows={2} {...register("excerpt")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Nội dung (Markdown)</CardTitle>
              <div className="flex rounded-lg border border-border p-0.5">
                <button
                  type="button"
                  onClick={() => setTab("write")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    tab === "write" ? "bg-primary text-white" : "text-muted hover:text-primary"
                  )}
                >
                  <PenLine className="h-3.5 w-3.5" /> Viết
                </button>
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    tab === "preview" ? "bg-primary text-white" : "text-muted hover:text-primary"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" /> Xem trước
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {tab === "write" ? (
                <Textarea
                  rows={22}
                  className="font-mono text-xs leading-relaxed"
                  placeholder={"# Tiêu đề\n\nNội dung bài viết…"}
                  {...register("content")}
                />
              ) : (
                <div className="min-h-[300px] rounded-lg border border-border bg-background p-6">
                  {content ? (
                    <Markdown content={content} />
                  ) : (
                    <p className="text-sm text-muted">Chưa có nội dung để xem trước.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Meta title</Label>
                <Input id="seoTitle" {...register("seoTitle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta description</Label>
                <Textarea id="seoDescription" rows={2} {...register("seoDescription")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords (phân cách bởi dấu phẩy)</Label>
                <Input id="seoKeywords" {...register("seoKeywords")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input id="canonicalUrl" placeholder="https://…" {...register("canonicalUrl")} />
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <option value="scheduled">Hẹn giờ đăng</option>
                </Select>
              </div>
              {status === "scheduled" && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Thời gian đăng</Label>
                  <Input id="scheduledAt" type="datetime-local" {...register("scheduledAt")} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Bài viết nổi bật</Label>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select {...register("category")}>
                  <option value="">— Không có —</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (phân cách bởi dấu phẩy)</Label>
                <Input id="tags" placeholder="nextjs, mongodb" {...register("tags")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ảnh cover</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload value={coverImage} onChange={setCoverImage} folder="xuannha-dev/blog" />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
