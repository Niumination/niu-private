import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "word";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "excel";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar"))
    return "archive";
  return "file";
}

export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType.includes("msword") ||
    mimeType.includes(
      "vnd.openxmlformats-officedocument.wordprocessingml"
    )
  )
    return "word";
  if (
    mimeType.includes("vnd.ms-excel") ||
    mimeType.includes(
      "vnd.openxmlformats-officedocument.spreadsheetml"
    )
  )
    return "excel";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar") ||
    mimeType.includes("7z")
  )
    return "archive";
  return "other";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    pdf: "from-red-500/20 to-red-600/10 border-red-500/30",
    image: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    word: "from-sky-500/20 to-sky-600/10 border-sky-500/30",
    excel: "from-green-500/20 to-green-600/10 border-green-500/30",
    archive: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
    other: "from-gray-500/20 to-gray-600/10 border-gray-500/30",
  };
  return colors[category] || colors.other;
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    pdf: "PDF",
    image: "Image",
    word: "Document",
    excel: "Spreadsheet",
    archive: "Archive",
    other: "Other",
  };
  return labels[category] || labels.other;
}

export function truncate(str: string, len: number = 50): string {
  if (str.length <= len) return str;
  return str.substring(0, len) + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
