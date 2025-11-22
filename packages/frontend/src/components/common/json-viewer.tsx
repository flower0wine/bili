"use client";

import Editor, { loader } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useMemo } from "react";

// import { EditorWorker } from "monaco-editor/esm/vs/editor/common/services/editorWebWorker?worker";
// import { JSONWorker } from "monaco-editor/esm/vs/language/json/jsonWorker?worker";

if (typeof window !== "undefined") {
  import("monaco-editor").then((monaco) => {
    loader.config({ monaco });
    (window as any).MonacoEnvironment = {
      getWorker(_workerId: string, label: string) {
        console.log(_workerId, label);

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
}

export function JsonViewer({
  data,
  editable = false,
  onChange,
  height = "400px",
  className = "",
}: JsonViewerProps) {
  const { theme } = useTheme();

  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    }
    catch {
      return JSON.stringify({ error: "Failed to serialize data" }, null, 2);
    }
  }, [data]);

  return (
    <div className={className}>
      <Editor
        height={height}
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
