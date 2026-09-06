"use client";
import { Toaster } from "sonner";
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}<Toaster position="top-right" richColors closeButton duration={4000} offset={{ top: 76, right: 16 }} mobileOffset={{ top: 72 }} /></>;
}
