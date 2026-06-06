import { NextRequest, NextResponse } from "next/server";
import { searchDocuments } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ documents: [] });
    }

    const documents = await searchDocuments(query);
    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}
