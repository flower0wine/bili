"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorWithRetry } from "@/components/user/error-with-retry";
import { NoData } from "@/components/user/no-data";

interface ChartStateHandlerProps {
  error?: string;
  hasData: boolean;
  noDataTitle: string;
  noDataMessage: string;
  errorTitle: string;
  children: ReactNode;
}

export function ChartStateHandler({
  error,
  hasData,
  noDataTitle,
  noDataMessage,
  errorTitle,
  children
}: ChartStateHandlerProps) {
  const router = useRouter();
  const [currentError, setCurrentError] = useState(error);

  const handleRetry = () => {
    setCurrentError(undefined);
    router.refresh();
  };

  if (currentError) {
    return (
      <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
        <ErrorWithRetry
          title={errorTitle}
          message={currentError}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
        <NoData
          title={noDataTitle}
          message={noDataMessage}
        />
      </div>
    );
  }

  return <>{children}</>;
}
