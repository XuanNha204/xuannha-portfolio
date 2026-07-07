"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Sends a lightweight page-view beacon on every client navigation. */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const body = JSON.stringify({ path: pathname });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/analytics/track", { method: "POST", body, keepalive: true });
      }
    } catch {
      // never let analytics break navigation
    }
  }, [pathname]);

  return null;
}
