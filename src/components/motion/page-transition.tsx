"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Fade/slide transition between routes without a full reload. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
