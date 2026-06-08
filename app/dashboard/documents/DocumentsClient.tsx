"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  Search as SearchIcon,
  SlidersHorizontal,
  Grid3X3,
  List,
  Download,
  Trash2,
  Eye,
  FileImage,
  FileSpreadsheet,
  Archive,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn, formatFileSize, getCategoryColor, getCategoryLabel, truncate } from "@/lib/utils";
import Link from "next/link";

const categories = ["all", "pdf", "image", "word", "excel", "archive", "other"];

export default function DocumentsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory]);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      const res = await fetch(`/api/documents?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, path: string, sha: string) {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, sha }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
    setDeleteConfirm(null);
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {documents.length} file{documents.length !== 1 ? "s" : ""} stored
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-dark-card border border-dark-border rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-niu-600/20 text-niu-400"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-niu-600/20 text-niu-400"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link href="/dashboard/upload" className="niu-btn-primary">
            Upload
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border",
              selectedCategory === cat
                ? "bg-niu-600/15 text-niu-400 border-niu-500/30"
                : "bg-dark-card text-gray-400 border-dark-border hover:text-white hover:border-gray-600"
            )}
          >
            {cat === "all" ? "All" : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-niu-400 animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No documents yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Upload your first document to get started
          </p>
          <Link href="/dashboard/upload" className="niu-btn-primary inline-flex">
            Upload Document
          </Link>
        </div>
      )}

      {/* Grid View */}
      {!loading && documents.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "niu-card p-4 bg-gradient-to-br group cursor-pointer relative",
                getCategoryColor(doc.category)
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-dark-bg/50 border border-dark-border flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/dashboard/documents/${doc.id}`}
                    className="p-1.5 rounded-md bg-dark-bg/50 hover:bg-dark-bg text-gray-400 hover:text-niu-400 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(doc.id)}
                    className="p-1.5 rounded-md bg-dark-bg/50 hover:bg-dark-bg text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-medium text-sm text-white truncate">
                {doc.name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className={cn(
                  "niu-badge border",
                  getCategoryColor(doc.category).split(" ")[2]
                )}>
                  {getCategoryLabel(doc.category)}
                </span>
                <span>{formatFileSize(doc.size)}</span>
              </div>
              {doc.description && (
                <p className="text-xs text-gray-600 mt-2 truncate">
                  {doc.description}
                </p>
              )}

              {/* Delete confirmation */}
              {deleteConfirm === doc.id && (
                <div className="absolute inset-0 bg-dark-bg/90 backdrop-blur-sm rounded-xl flex items-center justify-center p-4 z-10">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-200 mb-3">Delete this file?</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="niu-btn-secondary text-xs px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id, doc.path, doc.sha)}
                        className="niu-btn-danger text-xs px-3 py-1.5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && documents.length > 0 && viewMode === "list" && (
        <div className="niu-card overflow-hidden">
          <div className="divide-y divide-dark-border">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-dark-hover transition-colors group"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br border",
                  getCategoryColor(doc.category)
                )}>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/documents/${doc.id}`}
                    className="text-sm font-medium text-white hover:text-niu-400 transition-colors truncate block"
                  >
                    {doc.name}
                  </Link>
                </div>
                <span className={cn(
                  "niu-badge border text-xs hidden sm:inline-flex",
                  getCategoryColor(doc.category).split(" ")[2]
                )}>
                  {getCategoryLabel(doc.category)}
                </span>
                <span className="text-xs text-gray-500 hidden md:block">
                  {formatFileSize(doc.size)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/dashboard/documents/${doc.id}`}
                    className="p-1.5 rounded-md text-gray-400 hover:text-niu-400"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(doc.id)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
