"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Trash2,
  ArrowLeft,
  Calendar,
  HardDrive,
  Tag,
  FileImage,
  FileSpreadsheet,
  Archive,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { cn, formatFileSize, getCategoryColor, getCategoryLabel } from "@/lib/utils";
import Link from "next/link";

interface Props {
  id: string;
}

export default function DocumentDetailClient({ id }: Props) {
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDoc();
  }, [id]);

  async function fetchDoc() {
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDoc(data);
      }
    } catch (err) {
      console.error("Failed to fetch document", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!doc) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: doc.path, sha: doc.sha }),
      });
      if (res.ok) {
        router.push("/dashboard/documents");
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-niu-400 animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Document not found</h3>
        <Link href="/dashboard/documents" className="niu-btn-primary inline-flex">
          Back to Documents
        </Link>
      </div>
    );
  }

  const isImage = doc.mime_type?.startsWith("image/");
  const isPDF = doc.mime_type === "application/pdf";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br border",
            getCategoryColor(doc.category)
          )}>
            <FileText className="w-7 h-7 text-gray-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{doc.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn(
                "niu-badge border text-xs",
                getCategoryColor(doc.category).split(" ")[2]
              )}>
                {getCategoryLabel(doc.category)}
              </span>
              {doc.tags?.map((tag: string) => (
                <span key={tag} className="niu-badge bg-niu-500/10 text-niu-400 border border-niu-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={doc.download_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="niu-btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
          <button
            onClick={() => setShowDelete(true)}
            className="niu-btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="niu-card p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <HardDrive className="w-3.5 h-3.5" />
            Size
          </div>
          <p className="text-sm font-medium text-white">{formatFileSize(doc.size)}</p>
        </div>
        <div className="niu-card p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Uploaded
          </div>
          <p className="text-sm font-medium text-white">
            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="niu-card p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Tag className="w-3.5 h-3.5" />
            Category
          </div>
          <p className="text-sm font-medium text-white capitalize">{doc.category}</p>
        </div>
        <div className="niu-card p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <FileText className="w-3.5 h-3.5" />
            Type
          </div>
          <p className="text-sm font-medium text-white truncate">{doc.mime_type || "—"}</p>
        </div>
      </div>

      {/* Description */}
      {doc.description && (
        <div className="niu-card p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Description</h3>
          <p className="text-sm text-gray-400">{doc.description}</p>
        </div>
      )}

      {/* Preview */}
      <div className="niu-card overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-300">Preview</h3>
          <a
            href={doc.download_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-niu-400 hover:text-niu-300 flex items-center gap-1"
          >
            Open original <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="p-5">
          {isImage ? (
            <div className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.download_url}
                alt={doc.name}
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
              />
            </div>
          ) : isPDF ? (
            <div className="text-center py-10">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-sm mb-4">
                PDF preview requires a PDF viewer. Download to view.
              </p>
              <a
                href={doc.download_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="niu-btn-primary inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          ) : (
            <div className="text-center py-10">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-sm mb-4">
                Preview not available for this file type.
              </p>
              <a
                href={doc.download_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="niu-btn-primary inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="niu-card p-6 max-w-sm w-full animate-in">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white text-center mb-2">
              Delete Document?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              This will permanently delete &quot;{doc.name}&quot; from your vault and GitHub storage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="niu-btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="niu-btn-danger flex-1 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
