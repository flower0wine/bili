"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useProxyImage } from "@/hooks/use-proxy-image";
import { toError } from "@/lib/error.util";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackIcon?: React.ReactNode;
  showBorder?: boolean;
  borderGradient?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const sizePixelMap = {
  sm: "32px",
  md: "48px",
  lg: "64px",
  xl: "96px",
};

export function Avatar({
  src,
  alt = "avatar",
  size = "md",
  className,
  fallbackIcon,
  showBorder = false,
  borderGradient = false,
}: AvatarProps) {
  const proxyAvatarUrl = useProxyImage(src);
  const [imageError, setImageError] = useState(false);

  const sizeClass = sizeMap[size];
  const sizePixel = sizePixelMap[size];

  const containerClasses = cn(
    sizeClass,
    "flex items-center justify-center overflow-hidden rounded-full flex-shrink-0 relative",
    showBorder && "border border-border",
    borderGradient && "bg-linear-to-r from-primary to-secondary",
    !borderGradient && "bg-muted",
    className
  );

  const defaultFallback = fallbackIcon || (
    <User className={cn(
      "text-muted-foreground",
      size === "sm" && "w-4 h-4",
      size === "md" && "w-6 h-6",
      size === "lg" && "w-8 h-8",
      size === "xl" && "w-12 h-12"
    )}
    />
  );

  return (
    <div className={containerClasses}>
      {proxyAvatarUrl && !imageError
        ? (
            <Image
              src={proxyAvatarUrl}
              alt={alt}
              fill
              className="object-cover"
              sizes={sizePixel}
              priority
              onError={(e) => {
                const error = toError(e);
                console.error("Avatar image load error:", error.message);
                setImageError(true);
              }}
            />
          )
        : defaultFallback}
    </div>
  );
}
