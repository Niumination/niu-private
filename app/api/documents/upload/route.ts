import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/github";
import { saveDocumentMeta } from "@/lib/supabase";
import { getFileCategory } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "other";
    const tagsRaw = formData.get("tags") as string || "[]";
    const description = (formData.get("description") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 100MB." },
        { status: 400 }
      );
    }

    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsRaw);
    } catch {
      tags = [];
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect actual category from mime type if not explicitly set
    const detectedCategory = category === "other"
      ? getFileCategory(file.type)
      : category;

    // Upload to GitHub
    const result = await uploadFile(buffer, file.name, detectedCategory);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Save metadata to Supabase
    try {
      await saveDocumentMeta({
        name: file.name,
        path: result.path,
        sha: result.sha,
        size: file.size,
        mime_type: file.type,
        category: detectedCategory,
        tags,
        description,
      });
    } catch (dbError) {
      // If Supabase save fails, file is still on GitHub
      console.error("Failed to save metadata, but file uploaded:", dbError);
      return NextResponse.json({
        success: true,
        warning: "File uploaded but metadata saving failed",
        path: result.path,
        sha: result.sha,
      });
    }

    return NextResponse.json({
      success: true,
      path: result.path,
      sha: result.sha,
      download_url: result.download_url,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
