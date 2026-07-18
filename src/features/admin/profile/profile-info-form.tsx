"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { ProfileDTO } from "@/types";
import { apiGet, apiPut } from "@/lib/fetcher";
import { FileUpload } from "@/features/admin/file-upload";
import { AvatarUpload } from "./avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FormValues {
  name: string;
  headline: string;
  about: string;
  location: string;
  phone: string;
  avatar: string;
  resumeUrl: string;
  careerGoal: string;
}

export function ProfileInfoForm() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<ProfileDTO>("/api/profile"),
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
      name: "",
      headline: "",
      about: "",
      location: "",
      phone: "",
      avatar: "",
      resumeUrl: "",
      careerGoal: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        headline: profile.headline ?? "",
        about: profile.about ?? "",
        location: profile.location ?? "",
        phone: profile.phone ?? "",
        avatar: profile.avatar ?? "",
        resumeUrl: profile.resumeUrl ?? "",
        careerGoal: profile.careerGoal ?? "",
      });
    }
  }, [profile, reset]);

  const avatar = watch("avatar");
  const resumeUrl = watch("resumeUrl");

  async function onSubmit(values: FormValues) {
    try {
      await apiPut("/api/profile", values);
      toast.success("Đã lưu hồ sơ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lưu thất bại");
    }
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Họ tên *</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="Fullstack Developer…"
                {...register("headline")}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Địa điểm</Label>
              <Input id="location" placeholder="TP. Hồ Chí Minh" {...register("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">Giới thiệu bản thân</Label>
            <Textarea id="about" rows={6} {...register("about")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careerGoal">Mục tiêu nghề nghiệp</Label>
            <Textarea id="careerGoal" rows={4} {...register("careerGoal")} />
          </div>
          <Button type="submit" variant="accent" loading={isSubmitting}>
            {!isSubmitting && <Save className="h-4 w-4" />}
            Lưu hồ sơ
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AvatarUpload
              value={avatar}
              onChange={(dataUrl) => setValue("avatar", dataUrl, { shouldDirty: true })}
              className="mx-auto max-w-64"
            />
            <p className="text-center text-xs text-muted">
              Ảnh vuông, tối đa 2MB. Thay đổi có hiệu lực sau khi bấm “Lưu hồ sơ”.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">CV / Resume (PDF)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FileUpload
              value={resumeUrl}
              onChange={(url) => setValue("resumeUrl", url, { shouldDirty: true })}
              folder="xuannha-dev/resume"
              accept="application/pdf"
              fileLabel="CV / Resume PDF"
              label={resumeUrl ? "Thay CV mới" : "Tải CV lên"}
            />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
