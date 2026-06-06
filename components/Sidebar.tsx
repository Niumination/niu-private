"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Search,
  LogOut,
  Shield,
  FolderOpen,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Upload",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
  {
    label: "Search",
    href: "/dashboard/search",
    icon: Search,
  },
];

const categoryFilters = [
  { label: "PDF", icon: FileText, color: "text-red-400" },
  { label: "Images", icon: FileImage, color: "text-blue-400" },
  { label: "Documents", icon: FileText, color: "text-sky-400" },
  { label: "Spreadsheets", icon: FileSpreadsheet, color: "text-green-400" },
  { label: "Archives", icon: FileArchive, color: "text-yellow-400" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-dark-card border-r border-dark-border flex flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-dark-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-niu-600/20 border border-niu-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-niu-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Niu Private</h2>
              <p className="text-[10px] text-gray-500">Secure Vault</p>
            </div>
          </Link>
        </div>

        {/* Close button (mobile) */}
        <button
          onClick={onToggle}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold px-3 py-2">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "bg-niu-600/15 text-niu-400 border border-niu-500/20"
                    : "text-gray-400 hover:text-white hover:bg-dark-hover border border-transparent"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <div className="niu-divider" />

          <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold px-3 py-2">
            Categories
          </p>
          {categoryFilters.map((cat) => (
            <Link
              key={cat.label}
              href={`/dashboard/documents?category=${cat.label.toLowerCase()}`}
              onClick={() => {
                if (window.innerWidth < 1024) onToggle();
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-dark-hover transition-all duration-200 border border-transparent"
            >
              <cat.icon className={cn("w-4 h-4", cat.color)} />
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-dark-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
