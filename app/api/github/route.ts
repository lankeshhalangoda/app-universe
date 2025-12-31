import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Helper to commit file to GitHub
async function commitToGitHub(filePath: string, content: string, message: string) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const GITHUB_REPO = process.env.GITHUB_REPO // Format: owner/repo
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main"

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    throw new Error("GitHub credentials not configured")
  }

  // Get current file SHA if it exists
  let sha: string | undefined
  try {
    const getFileRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    )
    if (getFileRes.ok) {
      const fileData = await getFileRes.json()
      sha = fileData.sha
    }
  } catch {}

  // Commit file
  const contentBase64 = Buffer.from(content).toString("base64")
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch: GITHUB_BRANCH,
        ...(sha && { sha }),
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to commit to GitHub")
  }

  return await response.json()
}

export async function POST(request: Request) {
  try {
    const { filePath, content, message } = await request.json()

    if (!filePath || !content) {
      return NextResponse.json({ error: "filePath and content are required" }, { status: 400 })
    }

    const result = await commitToGitHub(filePath, content, message || `Update ${filePath}`)
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("[v0] GitHub commit error:", error)
    return NextResponse.json(
      { error: "Failed to commit to GitHub", details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

