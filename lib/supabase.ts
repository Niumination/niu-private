import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured = Boolean(supabaseUrl && supabaseUrl.startsWith("http") && supabaseKey);

let supabaseClient: SupabaseClient | null = null;

if (isConfigured) {
  supabaseClient = createClient(supabaseUrl, supabaseKey);
}

function getClient(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error("Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }
  return supabaseClient;
}

export interface DocumentMeta {
  id?: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  mime_type: string;
  category: string;
  tags: string[];
  description: string;
  created_at?: string;
}

export interface DocumentRow {
  id: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  mime_type: string;
  category: string;
  tags: string[];
  description: string;
  created_at: string;
}

function db() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getClient().from("documents") as any;
}

export async function saveDocumentMeta(meta: DocumentMeta): Promise<DocumentRow> {
  const { data, error } = await db()
    .insert([{
      name: meta.name,
      path: meta.path,
      sha: meta.sha,
      size: meta.size,
      mime_type: meta.mime_type,
      category: meta.category,
      tags: meta.tags,
      description: meta.description,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as DocumentRow;
}

export async function getDocuments(options?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ documents: DocumentRow[]; total: number }> {
  let query = db()
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  if (options?.search) {
    query = query.textSearch("name", options.search, {
      type: "websearch",
      config: "english",
    });
  }

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { documents: (data as DocumentRow[]) || [], total: count || 0 };
}

export async function getDocumentById(id: string): Promise<DocumentRow | null> {
  const { data, error } = await db()
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as DocumentRow | null;
}

export async function deleteDocumentMeta(id: string): Promise<boolean> {
  const { error } = await db()
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

export async function searchDocuments(query: string): Promise<DocumentRow[]> {
  const { data, error } = await db()
    .select("*")
    .textSearch("name", query, { type: "websearch", config: "english" })
    .limit(20);

  if (error) throw error;
  return (data as DocumentRow[]) || [];
}
