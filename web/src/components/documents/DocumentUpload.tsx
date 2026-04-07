"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { documents } from "@/lib/api";
import type { DocumentSection } from "@/lib/types";

interface DocumentUploadProps {
  caseId?: string;
  optInRequestId?: string;
  section: DocumentSection;
  onUploaded: () => void;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

type UploadState = "idle" | "uploading" | "success" | "error";

export default function DocumentUpload({
  caseId,
  optInRequestId,
  section,
  onUploaded,
}: DocumentUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE) {
        setState("error");
        setErrorMsg("File exceeds 50 MB limit.");
        return;
      }

      setState("uploading");
      setErrorMsg("");

      try {
        const data: Record<string, string> = { section };
        if (caseId) data.caseId = caseId;
        if (optInRequestId) data.optInRequestId = optInRequestId;

        await documents.upload(file, data);
        setState("success");
        onUploaded();

        // Auto-reset after 2 seconds
        setTimeout(() => setState("idle"), 2000);
      } catch (err) {
        setState("error");
        setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [caseId, optInRequestId, section, onUploaded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset the input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => state !== "uploading" && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (state !== "uploading") inputRef.current?.click();
        }
      }}
      className={`
        relative flex flex-col items-center justify-center gap-2 p-6
        border-2 border-dashed rounded-lg cursor-pointer
        transition-colors duration-200
        ${dragOver ? "border-primary bg-green-50" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"}
        ${state === "uploading" ? "pointer-events-none opacity-70" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
        aria-label="Upload file"
      />

      {state === "idle" && (
        <>
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-sm text-gray-500">
            Drop a file here or click to browse
          </span>
          <span className="text-xs text-gray-400">Max 50 MB</span>
        </>
      )}

      {state === "uploading" && (
        <>
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-sm text-gray-600">Uploading...</span>
        </>
      )}

      {state === "success" && (
        <>
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span className="text-sm text-green-600">Upload complete</span>
        </>
      )}

      {state === "error" && (
        <>
          <Upload className="w-6 h-6 text-red-400" />
          <span className="text-sm text-red-600">{errorMsg}</span>
          <span className="text-xs text-gray-400">Click to try again</span>
        </>
      )}
    </div>
  );
}
