import { Trash2, FileText } from "lucide-react";
import { documents } from "@/lib/api";
import type { CaseDocument } from "@/lib/types";

interface DocumentListProps {
  documents: CaseDocument[];
  onDelete: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DocumentList({ documents: docs, onDelete }: DocumentListProps) {
  if (docs.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        No documents in this section.
      </p>
    );
  }

  const handleDelete = (id: string, fileName: string) => {
    if (window.confirm(`Delete "${fileName}"? This cannot be undone.`)) {
      onDelete(id);
    }
  };

  return (
    <ul className="divide-y divide-gray-100">
      {docs.map((doc) => (
        <li key={doc.id} className="flex items-center gap-4 py-3 group">
          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <a
              href={documents.downloadUrl(doc.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-900 hover:text-primary cursor-pointer transition-colors duration-200 truncate block"
            >
              {doc.fileName}
            </a>
            <p className="text-xs text-gray-500">
              {formatSize(doc.fileSize)} &middot; {doc.uploadedBy?.name ?? "Unknown"} &middot; {formatDate(doc.uploadedAt)}
            </p>
          </div>

          {doc.version > 1 && (
            <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
              v{doc.version}
            </span>
          )}

          <button
            type="button"
            onClick={() => handleDelete(doc.id, doc.fileName)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 cursor-pointer transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label={`Delete ${doc.fileName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
