"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { KeyRound, Save } from "lucide-react";
import { apiPut } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await apiPut("/api/profile/password", values);
      reset();
      toast.success("Đã đổi mật khẩu admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đổi mật khẩu thất bại");
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4 text-accent" />
          Đổi mật khẩu admin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword", { required: "Nhập mật khẩu hiện tại" })}
            />
            {errors.currentPassword && (
              <p className="text-xs text-danger">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới *</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register("newPassword", {
                  required: "Nhập mật khẩu mới",
                  minLength: { value: 8, message: "Mật khẩu mới tối thiểu 8 ký tự" },
                  validate: (value) =>
                    value !== watch("currentPassword") || "Mật khẩu mới phải khác mật khẩu hiện tại",
                })}
              />
              {errors.newPassword && (
                <p className="text-xs text-danger">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword", {
                  required: "Xác nhận mật khẩu mới",
                  validate: (value) => value === watch("newPassword") || "Mật khẩu xác nhận không khớp",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" variant="accent" loading={isSubmitting}>
            {!isSubmitting && <Save className="h-4 w-4" />}
            Lưu mật khẩu mới
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
