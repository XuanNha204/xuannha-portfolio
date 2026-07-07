"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { SiteSettingsDTO } from "@/types";
import { apiGet, apiPut } from "@/lib/fetcher";
import { PageHeader } from "@/features/admin/page-header";
import { ImageUpload } from "@/features/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FormValues {
  siteName: string;
  tagline: string;
  logo: string;
  favicon: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  googleAnalyticsId: string;
  googleSearchConsoleId: string;
  footerText: string;
}

export function SettingsForm() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<SiteSettingsDTO>("/api/settings"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      siteName: "",
      tagline: "",
      logo: "",
      favicon: "",
      metaTitle: "",
      metaDescription: "",
      keywords: "",
      ogImage: "",
      googleAnalyticsId: "",
      googleSearchConsoleId: "",
      footerText: "",
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        siteName: settings.siteName ?? "",
        tagline: settings.tagline ?? "",
        logo: settings.logo ?? "",
        favicon: settings.favicon ?? "",
        metaTitle: settings.seo?.metaTitle ?? "",
        metaDescription: settings.seo?.metaDescription ?? "",
        keywords: settings.seo?.keywords?.join(", ") ?? "",
        ogImage: settings.seo?.ogImage ?? "",
        googleAnalyticsId: settings.googleAnalyticsId ?? "",
        googleSearchConsoleId: settings.googleSearchConsoleId ?? "",
        footerText: settings.footerText ?? "",
      });
    }
  }, [settings, reset]);

  const logo = watch("logo");
  const ogImage = watch("ogImage");

  async function onSubmit(values: FormValues) {
    try {
      await apiPut("/api/settings", {
        siteName: values.siteName,
        tagline: values.tagline,
        logo: values.logo,
        favicon: values.favicon,
        seo: {
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
          keywords: values.keywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          ogImage: values.ogImage,
        },
        googleAnalyticsId: values.googleAnalyticsId,
        googleSearchConsoleId: values.googleSearchConsoleId,
        footerText: values.footerText,
      });
      toast.success("Đã lưu cài đặt");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại");
    }
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader title="Cài đặt website" description="Logo, SEO, Analytics và metadata.">
        <Button type="submit" variant="accent" loading={isSubmitting}>
          {!isSubmitting && <Save className="h-4 w-4" />}
          Lưu cài đặt
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Tên website *</Label>
                  <Input id="siteName" {...register("siteName", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" {...register("tagline")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footerText">Nội dung footer</Label>
                <Textarea id="footerText" rows={2} {...register("footerText")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta title</Label>
                <Input id="metaTitle" {...register("metaTitle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta description</Label>
                <Textarea id="metaDescription" rows={3} {...register("metaDescription")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (phân cách bởi dấu phẩy)</Label>
                <Input id="keywords" {...register("keywords")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tích hợp Google</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input id="googleAnalyticsId" placeholder="G-XXXXXXXXXX" {...register("googleAnalyticsId")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleSearchConsoleId">Search Console verification</Label>
                <Input id="googleSearchConsoleId" {...register("googleSearchConsoleId")} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={logo}
                onChange={(url) => setValue("logo", url, { shouldDirty: true })}
                folder="xuannha-dev/site"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ảnh Open Graph mặc định</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={ogImage}
                onChange={(url) => setValue("ogImage", url, { shouldDirty: true })}
                folder="xuannha-dev/site"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
