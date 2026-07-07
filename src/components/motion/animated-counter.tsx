"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  className?: string;
}

/** Counts up from 0 to `value` when scrolled into view. */
export function AnimatedCounter({ value, suffix = "", className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1600, bounce: 0 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(latest).toLocaleString("vi-VN")}${suffix}`;
      }
    });
    return unsubscribe;
  }, [spring, suffix]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
