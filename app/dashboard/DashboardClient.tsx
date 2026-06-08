"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  HardDrive,
  Archive,
  FileImage,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import { cn, formatFileSize, getCategoryColor, getCategoryLabel } from "@/lib/utils";
import Link from "next/link";

const statDefaults = [
  {
    id: "total",
    label: "Total Documents",
    icon: FileText,
    color: "text-niu-400",
    bg: "bg-niu-500/10",
    border: "border-niu-500/20",
  },
  {
    id: "storage",
    label: "Storage Used",
    icon: HardDrive,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Archive,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    id: "recent",
    label: "Recent Uploads",
    icon: Clock,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
];

const quickActions = [
  {
    label: "Upload Document",
    href: "/dashboard/upload",
    icon: Upload,
    desc: "Upload PDF, images, docs & more",
    gradient: "from-niu-500/20 to-niu-600/10",
    border: "border-niu-500/30",
  },
  {
    label: "Browse Documents",
    href: "/dashboard/documents",
    icon: FileText,
    desc: "View and manage your files",
    gradient: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
  },
  {
    label: "Search",
    href: "/dashboard/search",
    icon: FileText,
    desc: "Find documents instantly",
    gradient: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
  },
];

export default function DashboardClient() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  }

  const totalSize = documents.reduce((sum, d) => sum + (d.size || 0), 0);
  const categories = [...new Set(documents.map((d) => d.category).filter(Boolean))];
  const recentCount = documents.filter((d) => {
    const days = 7;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return new Date(d.created_at).getTime() > cutoff;
  }).length;

  const statValues: Record<string, string> = {
    total: loading ? "..." : String(documents.length),
    storage: loading ? "..." : totalSize > 0 ? formatFileSize(totalSize) : "0 B",
    categories: loading ? "..." : String(categories.length),
    recent: loading ? "..." : String(recentCount),
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Welcome back to your secure document vault
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statDefaults.map((stat) => (
          <div
            key={stat.id}
            className={cn(
              "niu-card p-5",
              stat.bg,
              stat.border
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  stat.bg,
                  stat.border,
                  "border"
                )}
              >
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                statValues[stat.id]
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "niu-card p-5 bg-gradient-to-br group cursor-pointer",
                action.gradient,
                action.border
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border",
                    action.border
                  )}
                >
                  <action.icon className="w-5 h-5 text-niu-400" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-niu-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-white text-sm">
                {action.label}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Document Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {["pdf", "image", "word", "excel", "archive", "other"].map((cat) => (
            <Link
              key={cat}
              href={`/dashboard/documents?category=${cat}`}
              className={cn(
                "niu-card p-4 bg-gradient-to-br border cursor-pointer group",
                getCategoryColor(cat)
              )}
            >
              <p className="text-sm font-medium text-white group-hover:text-niu-400 transition-colors">
                {getCategoryLabel(cat)}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">View all</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-600 py-4 border-t border-dark-border">
        <Shield className="w-3 h-3" />
        <span>End-to-end encrypted &bull; GitHub private storage</span>
      </div>
    </div>
  );
}
