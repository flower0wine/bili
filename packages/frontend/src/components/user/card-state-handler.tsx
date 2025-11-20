"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorWithRetry } from "@/components/user/error-with-retry";
import { NoData } from "@/components/user/no-data";

interface CardStateHandlerProps {
  error?: string;
  hasData: boolean;
  noDataTitle: string;
  noDataMessage: string;
  errorTitle: string;
  children: ReactNode;
}

export function CardStateHandler({
  error,
  hasData,
  noDataTitle,
  noDataMessage,
  errorTitle,
  children
}: CardStateHandlerProps) {
  const router = useRouter();
  const [currentError, setCurrentError] = useState(error);

  const handleRetry = () => {
    setCurrentError(undefined);
    router.refresh();
  };

  if (currentError) {
    return (
      <ErrorWithRetry
        title={errorTitle}
        message={currentError}
        onRetry={handleRetry}
      />
    );
  }

  if (!hasData) {
    return (
      <NoData
        title={noDataTitle}
        message={noDataMessage}
      />
    );
  }

  return <>{children}</>;
}
