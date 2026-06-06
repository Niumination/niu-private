import { NextRequest, NextResponse } from "next/server";
import { getDocumentById, deleteDocumentMeta } from "@/lib/supabase";
import type { DocumentRow } from "@/lib/supabase";
import { deleteFile, getFileDownloadUrl } from "@/lib/github";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc: DocumentRow | null = await getDocumentById(id);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Get download URL from GitHub
    const downloadUrl = await getFileDownloadUrl(doc.path);
    const data = { ...doc, download_url: downloadUrl };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Document get error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { path, sha } = await req.json();

    if (!path || !sha) {
      return NextResponse.json(
        { error: "Missing path or sha" },
        { status: 400 }
      );
    }

    // Delete from GitHub
    const githubDeleted = await deleteFile(path, sha);
    if (!githubDeleted) {
      return NextResponse.json(
        { error: "Failed to delete file from storage" },
        { status: 500 }
      );
    }

    // Delete metadata from Supabase
    await deleteDocumentMeta(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Document delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
