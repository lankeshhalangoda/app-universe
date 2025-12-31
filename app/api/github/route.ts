import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { filePath, content, message } = await request.json()

    if (!filePath || !content) {
      return NextResponse.json({ error: "filePath and content are required" }, { status: 400 })
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const GITHUB_REPO = process.env.GITHUB_REPO
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main"

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return NextResponse.json(
        { error: "GitHub credentials not configured. Please set GITHUB_TOKEN and GITHUB_REPO environment variables." },
        { status: 500 }
      )
    }

    // Get current file SHA if it exists
    let sha: string | undefined
    try {
      const getFileRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "App-Universe",
          },
        }
      )
      if (getFileRes.ok) {
        const fileData = await getFileRes.json()
        sha = fileData.sha
      }
    } catch (err) {
      // File doesn't exist yet, that's fine
    }

    // Commit file
    const contentBase64 = Buffer.from(content).toString("base64")
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "App-Universe",
        },
        body: JSON.stringify({
          message: message || `Update ${filePath}`,
          content: contentBase64,
          branch: GITHUB_BRANCH,
          ...(sha && { sha }),
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText.substring(0, 200) }
      }
      console.error("[v0] GitHub API error:", errorData)
      return NextResponse.json(
        { error: "Failed to commit to GitHub", details: errorData.message || "Unknown error" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("[v0] GitHub commit error:", error)
    return NextResponse.json(
      { error: "Failed to commit to GitHub", details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

