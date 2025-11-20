"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      返回
    </button>
  );
}
