import { Octokit } from "@octokit/rest";

const owner = "niumination";
const repo = "niu-storage";

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not configured");
  return new Octokit({ auth: token });
}

export interface UploadResult {
  success: boolean;
  path: string;
  sha: string;
  download_url?: string;
}

/**
 * Upload file to GitHub private repo as base64
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  category: string,
  subfolder?: string
): Promise<UploadResult> {
  const octokit = getOctokit();
  const base64Content = fileBuffer.toString("base64");

  // Organize: /category/year-month/fileName
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const folder = subfolder || `${category}/${dateStr}`;
  const filePath = `${folder}/${fileName}`;

  try {
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Upload: ${fileName} [${category}]`,
      content: base64Content,
    });

    const data = response.data;
    return {
      success: true,
      path: filePath,
      sha: data.content?.sha || "",
      download_url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`,
    };
  } catch (error: any) {
    console.error("GitHub upload error:", error.message || error);
    return { success: false, path: filePath, sha: "" };
  }
}

/**
 * Delete file from GitHub repo
 */
export async function deleteFile(filePath: string, sha: string): Promise<boolean> {
  const octokit = getOctokit();
  try {
    await octokit.repos.deleteFile({
      owner,
      repo,
      path: filePath,
      message: `Delete: ${filePath}`,
      sha,
    });
    return true;
  } catch (error: any) {
    console.error("GitHub delete error:", error.message || error);
    return false;
  }
}

/**
 * Get raw file download URL
 */
export async function getFileDownloadUrl(filePath: string): Promise<string | null> {
  const octokit = getOctokit();
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    });

    const data = response.data as any;
    return data.download_url || null;
  } catch (error: any) {
    console.error("GitHub get error:", error.message || error);
    return null;
  }
}
