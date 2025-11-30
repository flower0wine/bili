"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface ErrorWithRetryProps {
  title: string;
  message: string;
  onRetry: () => Promise<void>;
}

export function ErrorWithRetry({ title, message, onRetry }: ErrorWithRetryProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    try {
      onRetry();
    }
    finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          {title}
        </h3>

        <p className="text-muted-foreground mb-6">
          {message}
        </p>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "重试中..." : "重试"}
        </button>
      </div>
    </div>
  );
}
