"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/schemas";
import { useSitePreferences } from "@/components/site/site-preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const { t } = useSitePreferences();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success(t("contact.success"));
        reset();
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.error || t("contact.fail"));
      }
    } catch {
      toast.error(t("contact.network"));
    }
  }

  return (
    // noValidate: tắt validation gốc của trình duyệt để zod luôn chạy và
    // hiển thị thông báo lỗi đồng bộ dưới từng field.
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("contact.formName")} *</Label>
          <Input id="name" placeholder={t("contact.formNamePlaceholder")} {...register("name")} />
          {errors.name && <p className="text-xs text-danger">{t("contact.errName")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("contact.formEmail")} *</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("contact.formEmailPlaceholder")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-danger">{t("contact.errEmail")}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">{t("contact.formSubject")}</Label>
        <Input
          id="subject"
          placeholder={t("contact.formSubjectPlaceholder")}
          {...register("subject")}
        />
        {errors.subject && <p className="text-xs text-danger">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">{t("contact.formContent")} *</Label>
        <Textarea
          id="content"
          rows={6}
          placeholder={t("contact.formContentPlaceholder")}
          {...register("content")}
        />
        {errors.content && <p className="text-xs text-danger">{t("contact.errContent")}</p>}
      </div>

      <Button type="submit" variant="accent" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
        {!isSubmitting && <Send className="h-4 w-4" />}
        {t("contact.formSubmit")}
      </Button>
    </form>
  );
}
