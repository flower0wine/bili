"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

interface AnimatedStatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  description?: string;
  trend?: "up" | "down" | "stable";
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedNumber({
  value,
  duration = 1.5,
  delay = 0,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const startValue = 0;
      const endValue = value;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);

        // 使用 easeOutExpo 缓动函数
        const easeOutExpo = (t: number) => {
          return t === 1 ? 1 : 1 - 2 ** (-10 * t);
        };

        const currentValue = startValue + (endValue - startValue) * easeOutExpo(progress);
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString();

  return (
    <motion.span
      className={cn("font-mono", className)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  );
}

export function AnimatedStatCard({
  title,
  value,
  previousValue,
  description,
  trend,
  icon,
  className,
  delay = 0,
}: AnimatedStatCardProps) {
  const trendPercentage = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      default:
        return "→";
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card p-6 text-card-foreground shadow-sm",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)"
      }}
    >
      <div className="flex items-center justify-between pb-2">
        <motion.p
          className="text-sm font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
        >
          {title}
        </motion.p>

        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.3 }}
        >
          {icon}
          {trend && (
            <span className={`text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
            </span>
          )}
        </motion.div>
      </div>

      <div className="flex flex-col gap-1">
        <AnimatedNumber
          value={value}
          className="text-2xl font-bold"
          delay={delay + 0.1}
        />

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.4 }}
        >
          <p className="text-xs text-muted-foreground">
            {description}
          </p>

          {previousValue && trend && trend !== "stable" && (
            <span className={`text-xs font-medium ${getTrendColor()}`}>
              (
              {trendPercentage > 0 ? "+" : ""}
              {trendPercentage.toFixed(1)}
              %)
            </span>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// 进度条动画组件
interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  delay?: number;
  duration?: number;
  color?: string;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  className,
  delay = 0,
  duration = 1,
  color = "bg-primary",
}: AnimatedProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full bg-secondary rounded-full h-2", className)}>
      <motion.div
        className={`h-2 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration,
          delay,
          ease: "easeOut"
        }}
      />
    </div>
  );
}