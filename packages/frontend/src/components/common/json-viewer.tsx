"use client";

import Editor, { loader } from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// import { EditorWorker } from "monaco-editor/esm/vs/editor/common/services/editorWebWorker?worker";
// import { JSONWorker } from "monaco-editor/esm/vs/language/json/jsonWorker?worker";

if (typeof window !== "undefined") {
  import("monaco-editor").then((monaco) => {
    loader.config({ monaco });
    (window as any).MonacoEnvironment = {
      getWorker(_workerId: string, label: string) {
        if (label === "json") {
          return new URL("monaco-editor/esm/vs/language/json/jsonWorker", import.meta.url).toString();
        }
        return new URL("monaco-editor/esm/vs/editor/common/services/editorWebWorker", import.meta.url).toString();
      },
    };
  });
}

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
  const { theme } = useTheme();
  const [copySuccess, setCopySuccess] = useState(false);

  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    }
    catch {
      return JSON.stringify({ error: "Failed to serialize data" }, null, 2);
    }
  }, [data]);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch((err) => {
      console.error("Failed to copy JSON:", err);
    });
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {showCopyButton && (
        <div className="flex items-center justify-between px-4 py-3 bg-muted border-b">
          <span className="text-sm font-medium text-muted-foreground">JSON 数据</span>
          <button
            type="button"
            onClick={handleCopyJSON}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
              copySuccess
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                : "bg-background hover:bg-primary text-primary-foreground"
            )}
          >
            <Copy className="w-4 h-4" />
            {copySuccess ? "已复制" : "复制"}
          </button>
        </div>
      )}
      <Editor
        height={showCopyButton ? `calc(${height} - 53px)` : height}
        defaultLanguage="json"
        value={jsonString}
        onChange={(value) => {
          if (editable && onChange && value) {
            onChange(value);
          }
        }}
        theme={theme === "dark" ? "vs-dark" : "vs"}
        options={{
          readOnly: !editable,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}
