"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  index?: number;
  variant?: "default" | "hover-lift" | "scale" | "slide";
  whileHover?: boolean;
}

const cardVariants = {
  "default": {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileHover: { scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)" }
  },
  "hover-lift": {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    whileHover: { scale: 1.05, y: -5, boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.3)" }
  },
  "scale": {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    whileHover: { scale: 1.03, boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.3)" }
  },
  "slide": {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    whileHover: { scale: 1.02, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)" }
  }
};

export function AnimatedCard({
  children,
  className,
  delay = 0,
  duration = 0.5,
  index,
  variant = "default",
  whileHover = true,
  ...props
}: AnimatedCardProps) {
  const currentVariant = cardVariants[variant];
  const calculatedDelay = delay + (index ? index * 0.1 : 0);

  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      initial={currentVariant.initial}
      animate={currentVariant.animate}
      whileHover={whileHover ? currentVariant.whileHover : undefined}
      transition={{
        duration,
        delay: calculatedDelay,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      layout
      {...props}
    >
      {children}
    </motion.div>
  );
}