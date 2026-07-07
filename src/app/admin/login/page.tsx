"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Terminal, Lock } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Email hoặc mật khẩu không đúng");
    } else {
      toast.success("Đăng nhập thành công");
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-lg">
            <Terminal className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-bold text-white">
            XuanNha<span className="text-accent">.CMS</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">Đăng nhập để quản trị website</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="owner@xuannha.dev"
              className="border-white/10 bg-white/10 text-white placeholder:text-white/30"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              Mật khẩu
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-white/10 bg-white/10 text-white placeholder:text-white/30"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
          </div>

          <Button type="submit" variant="accent" className="w-full" loading={loading}>
            {!loading && <Lock className="h-4 w-4" />}
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}
