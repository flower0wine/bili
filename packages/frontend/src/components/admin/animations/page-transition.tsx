"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  type?: "slide" | "fade" | "scale" | "flip";
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
}

const pageVariants = {
  slide: {
    left: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 }
    },
    right: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 }
    },
    up: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 }
    },
    down: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 }
    }
  },
  fade: {
    left: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    right: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    up: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    down: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  },
  scale: {
    left: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 }
    },
    right: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 }
    },
    up: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 }
    },
    down: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 }
    }
  },
  flip: {
    left: {
      initial: { rotateY: 90, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 },
      exit: { rotateY: -90, opacity: 0 }
    },
    right: {
      initial: { rotateY: -90, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 },
      exit: { rotateY: 90, opacity: 0 }
    },
    up: {
      initial: { rotateX: 90, opacity: 0 },
      animate: { rotateX: 0, opacity: 1 },
      exit: { rotateX: -90, opacity: 0 }
    },
    down: {
      initial: { rotateX: -90, opacity: 0 },
      animate: { rotateX: 0, opacity: 1 },
      exit: { rotateX: 90, opacity: 0 }
    }
  }
};

export function PageTransition({
  children,
  className,
  type = "slide",
  direction = "right",
  duration = 0.3,
}: PageTransitionProps) {
  const variants = pageVariants[type][direction];

  return (
    <motion.div
      className={cn("w-full h-full", className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration,
        ease: "easeInOut",
        type: "tween"
      }}
    >
      {children}
    </motion.div>
  );
}

// 带有 AnimatePresence 的页面容器
interface AnimatedPageContainerProps {
  children: ReactNode;
  className?: string;
  mode?: "wait" | "sync" | "popLayout";
  type?: "slide" | "fade" | "scale" | "flip";
  direction?: "left" | "right" | "up" | "down";
}

export function AnimatedPageContainer({
  children,
  className,
  mode = "wait",
  type = "slide",
  direction = "right",
}: AnimatedPageContainerProps) {
  const variants = pageVariants[type][direction];

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={typeof window !== "undefined" ? window.location.pathname : "default"}
        className={cn("w-full h-full", className)}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          type: "tween"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// 列表项交错动画容器
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  animationType?: "fadeInUp" | "fadeIn" | "slideIn" | "scaleIn";
}

const staggerVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  },
  slideIn: {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  }
};

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0,
  animationType = "fadeInUp",
}: StaggerContainerProps) {
  const variants = staggerVariants[animationType];

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay
          }
        }
      }}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

// 单个交错动画项
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerItem({
  children,
  className,
  delay = 0,
}: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      transition={{
        duration: 0.3,
        delay
      }}
    >
      {children}
    </motion.div>
  );
}