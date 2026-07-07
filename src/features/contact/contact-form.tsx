"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Đã gửi tin nhắn! Tôi sẽ phản hồi sớm nhất có thể.");
      reset();
    } else {
      const body = await res.json().catch(() => null);
      toast.error(body?.error || "Gửi tin nhắn thất bại, vui lòng thử lại.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Họ tên *</Label>
          <Input id="name" placeholder="Nguyễn Văn A" {...register("name")} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="ban@email.com" {...register("email")} />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Tiêu đề</Label>
        <Input id="subject" placeholder="Về dự án…" {...register("subject")} />
        {errors.subject && <p className="text-xs text-danger">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Nội dung *</Label>
        <Textarea
          id="content"
          rows={6}
          placeholder="Chào bạn, mình muốn trao đổi về…"
          {...register("content")}
        />
        {errors.content && <p className="text-xs text-danger">{errors.content.message}</p>}
      </div>

      <Button type="submit" variant="accent" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
        {!isSubmitting && <Send className="h-4 w-4" />}
        Gửi tin nhắn
      </Button>
    </form>
  );
}
