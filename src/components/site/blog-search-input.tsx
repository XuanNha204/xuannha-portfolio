"use client";

import { Search } from "lucide-react";
import { useSitePreferences } from "@/components/site/site-preferences";

/** Ô tìm kiếm blog — tách thành client component để dịch được placeholder. */
export function BlogSearchInput({ defaultValue }: { defaultValue?: string }) {
  const { t } = useSitePreferences();

  return (
    <>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={t("blog.searchPlaceholder")}
        className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm shadow-sm transition-colors placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
      />
    </>
  );
}
