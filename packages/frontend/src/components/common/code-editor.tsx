"use client";

import type { editor } from "monaco-editor";
import Editor, { loader } from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// 配置 Monaco Editor Workers
if (typeof window !== "undefined") {
  import("monaco-editor").then((monaco) => {
    loader.config({ monaco });
    (window as any).MonacoEnvironment = {
      getWorker(_workerId: string, label: string) {
        if (label === "json") {
          return new URL("monaco-editor/esm/vs/language/json/jsonWorker", import.meta.url).toString();
        }
        else if (label === "typescript") {
          return new URL("monaco-editor/esm/vs/language/typescript/tsWorker", import.meta.url).toString();
        }
        return new URL("monaco-editor/esm/vs/editor/common/services/editorWebWorker", import.meta.url).toString();
      },
    };
  });
}

export type CodeLanguage = "json" | "typescript" | "javascript" | "python" | "sql" | "html" | "css";

interface CodeEditorProps {
  value: string;
  language?: CodeLanguage;
  editable?: boolean;
  onChange?: (value: string) => void;
  height?: string;
  className?: string;
  showCopyButton?: boolean;
  title?: string;
}

export function CodeEditor({
  value,
  language = "json",
  editable = false,
  onChange,
  height = "400px",
  className = "",
  showCopyButton = true,
  title,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const [copySuccess, setCopySuccess] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch((err) => {
      console.error("Failed to copy code:", err);
    });
  };

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (newValue: string | undefined) => {
    if (editable && onChange && newValue) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {showCopyButton && (
        <div className="flex items-center justify-between px-4 py-3 bg-muted border-b">
          <span className="text-sm font-medium text-muted-foreground">
            {title || `${language.toUpperCase()} 代码`}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
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
        defaultLanguage={language}
        value={value}
        onMount={handleEditorMount}
        onChange={handleEditorChange}
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
