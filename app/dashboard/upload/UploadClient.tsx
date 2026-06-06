"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  FileImage,
  FileSpreadsheet,
  Archive,
  Tag,
} from "lucide-react";
import { cn, formatFileSize, getCategoryLabel } from "@/lib/utils";
import { useDropzone } from "react-dropzone";

const categoryOptions = [
  { value: "pdf", label: "PDF", icon: FileText, color: "text-red-400" },
  { value: "image", label: "Image", icon: FileImage, color: "text-blue-400" },
  { value: "word", label: "Document", icon: FileText, color: "text-sky-400" },
  { value: "excel", label: "Spreadsheet", icon: FileSpreadsheet, color: "text-green-400" },
  { value: "archive", label: "Archive", icon: Archive, color: "text-yellow-400" },
  { value: "other", label: "Other", icon: File, color: "text-gray-400" },
];

interface FileItem {
  file: File;
  preview?: string;
}

export default function UploadClient() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [category, setCategory] = useState("pdf");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ name: string; success: boolean; error?: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "application/x-7z-compressed": [".7z"],
      "application/gzip": [".tar.gz", ".gz"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  function removeFile(index: number) {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!);
      updated.splice(index, 1);
      return updated;
    });
  }

  function detectCategory(file: File): string {
    const type = file.type;
    if (type.startsWith("image/")) return "image";
    if (type === "application/pdf") return "pdf";
    if (type.includes("word") || type.includes("document")) return "word";
    if (type.includes("excel") || type.includes("spreadsheet")) return "excel";
    if (type.includes("zip") || type.includes("rar") || type.includes("7z") || type.includes("gzip"))
      return "archive";
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (["doc", "docx"].includes(ext || "")) return "word";
    if (["xls", "xlsx", "csv"].includes(ext || "")) return "excel";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) return "archive";
    return "other";
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    setResults([]);

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    for (let i = 0; i < files.length; i++) {
      const { file } = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("tags", JSON.stringify(tagsArray));
      formData.append("description", description);

      try {
        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          setResults((prev) => [...prev, { name: file.name, success: true }]);
        } else {
          const err = await res.json();
          setResults((prev) => [
            ...prev,
            { name: file.name, success: false, error: err.error || "Upload failed" },
          ]);
        }
      } catch {
        setResults((prev) => [
          ...prev,
          { name: file.name, success: false, error: "Network error" },
        ]);
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    setUploading(false);
  }

  function resetForm() {
    setFiles([]);
    setResults([]);
    setProgress(0);
    setCategory("pdf");
    setTags("");
    setDescription("");
  }

  const allSuccess = results.length > 0 && results.every((r) => r.success);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Documents</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Upload PDFs, images, documents, spreadsheets, and archives
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "niu-card p-10 text-center cursor-pointer transition-all duration-200 border-2 border-dashed",
          isDragActive || dragOver
            ? "border-niu-500/50 bg-niu-500/5"
            : "border-dark-border hover:border-niu-500/30 hover:bg-dark-hover"
        )}
        onDragOver={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            "w-10 h-10 mx-auto mb-4 transition-colors",
            isDragActive ? "text-niu-400" : "text-gray-500"
          )}
        />
        {isDragActive ? (
          <p className="text-niu-400 font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-300 font-medium">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-600 mt-2">
              PDF, Images, Word, Excel, Archives &mdash; Max 100MB per file
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          {files.map((item, index) => (
            <div
              key={index}
              className="niu-card p-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center">
                <File className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 rounded-md text-gray-500 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Form */}
      {files.length > 0 && !uploading && (
        <div className="niu-card p-5 space-y-4">
          <h3 className="text-sm font-medium text-gray-300">Document Details</h3>

          {/* Category */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all",
                    category === cat.value
                      ? "bg-niu-600/15 border-niu-500/30 text-niu-400"
                      : "bg-dark-bg border-dark-border text-gray-400 hover:text-gray-200"
                  )}
                >
                  <cat.icon className={cn("w-3.5 h-3.5", cat.color)} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">
              Tags <span className="text-gray-700">(comma separated)</span>
            </label>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. important, work, personal"
                className="niu-input"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this document..."
              rows={3}
              className="niu-input resize-none"
            />
          </div>
        </div>
      )}

      {/* Progress */}
      {uploading && (
        <div className="niu-card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Uploading...</span>
            <span className="text-niu-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-niu-500 to-niu-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Results */}
          <div className="space-y-2 mt-4">
            {results.map((result, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 text-sm p-2 rounded-lg",
                  result.success ? "text-green-400" : "text-red-400"
                )}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="truncate">{result.name}</span>
                {result.error && (
                  <span className="text-xs text-gray-500">— {result.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex items-center gap-3">
          {!uploading ? (
            <>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="niu-btn-primary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload {files.length > 1 ? `All (${files.length})` : "File"}
              </button>
              <button
                onClick={resetForm}
                className="niu-btn-secondary"
              >
                Clear
              </button>
            </>
          ) : allSuccess ? (
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                All files uploaded successfully
              </div>
              <button
                onClick={resetForm}
                className="niu-btn-primary"
              >
                Upload More
              </button>
              <button
                onClick={() => router.push("/dashboard/documents")}
                className="niu-btn-secondary"
              >
                View Documents
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
