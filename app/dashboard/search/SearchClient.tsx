"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search as SearchIcon,
  FileText,
  Loader2,
  X,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn, formatFileSize, getCategoryColor, getCategoryLabel } from "@/lib/utils";

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.documents || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Find documents instantly across your vault
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by filename, tags, or description..."
          className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-12 py-4 text-base text-white placeholder-gray-500 focus:outline-none focus:border-niu-500/50 focus:ring-2 focus:ring-niu-500/10 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-niu-400 animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <>
          {results.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-500 text-sm">
                Try different keywords or browse all documents
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Found {results.length} result{results.length > 1 ? "s" : ""}
              </p>

              <div className="space-y-2">
                {results.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/dashboard/documents/${doc.id}`}
                    className={cn(
                      "niu-card p-4 flex items-center gap-4 group hover:border-niu-500/30 transition-all"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br border",
                      getCategoryColor(doc.category)
                    )}>
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-niu-400 transition-colors">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn(
                          "niu-badge border text-xs",
                          getCategoryColor(doc.category).split(" ")[2]
                        )}>
                          {getCategoryLabel(doc.category)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(doc.size)}
                        </span>
                        {doc.tags?.length > 0 && (
                          <span className="text-xs text-gray-600 truncate hidden sm:inline">
                            {doc.tags.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-niu-400 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="text-center py-16">
          <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Search across all documents
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Type a filename or keyword above to search your entire document vault
          </p>
        </div>
      )}
    </div>
  );
}
