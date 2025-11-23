"use client";

import { CodeEditor } from "./code-editor";

interface TsViewerProps {
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  height?: string;
  className?: string;
  showCopyButton?: boolean;
  title?: string;
}

export function TsViewer({
  value,
  editable = false,
  onChange,
  height = "400px",
  className = "",
  showCopyButton = true,
  title = "TypeScript 代码",
}: TsViewerProps) {
  return (
    <CodeEditor
      value={value}
      language="typescript"
      editable={editable}
      onChange={onChange}
      height={height}
      className={className}
      showCopyButton={showCopyButton}
      title={title}
    />
  );
}
