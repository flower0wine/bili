"use client";

import { useMemo } from "react";
import { CodeEditor } from "./code-editor";

interface JsonViewerProps {
  data: unknown;
  editable?: boolean;
  onChange?: (value: string) => void;
  height?: string;
  className?: string;
  showCopyButton?: boolean;
}

export function JsonViewer({
  data,
  editable = false,
  onChange,
  height = "400px",
  className = "",
  showCopyButton = true,
}: JsonViewerProps) {
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    }
    catch {
      return JSON.stringify({ error: "Failed to serialize data" }, null, 2);
    }
  }, [data]);

  return (
    <CodeEditor
      value={jsonString}
      language="json"
      editable={editable}
      onChange={onChange}
      height={height}
      className={className}
      showCopyButton={showCopyButton}
      title="JSON 数据"
    />
  );
}
