import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const ORDERS_FILE = path.join(process.cwd(), "data", "orders.json")

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

export async function GET() {
  try {
    await ensureDataDir()
    try {
      const content = await fs.readFile(ORDERS_FILE, "utf-8")
      const orders = JSON.parse(content)
      return NextResponse.json(orders)
    } catch {
      // If file doesn't exist, return empty array
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("[v0] Error reading orders:", error)
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const orders = await request.json()
    
    if (!Array.isArray(orders) || !orders.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "Invalid orders format" }, { status: 400 })
    }
    
    // In production, use GitHub API to commit files
    const IS_PRODUCTION = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
    if (IS_PRODUCTION) {
      const content = JSON.stringify(orders, null, 2)
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN
      const GITHUB_REPO = process.env.GITHUB_REPO
      const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main"

      if (!GITHUB_TOKEN || !GITHUB_REPO) {
        return NextResponse.json(
          { error: "GitHub credentials not configured" },
          { status: 500 }
        )
      }

      try {
        // Get current file SHA if it exists
        let sha: string | undefined
        try {
          const getFileRes = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/data/orders.json`,
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
        } catch {}

        // Commit file
        const contentBase64 = Buffer.from(content).toString("base64")
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contents/data/orders.json`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
              "User-Agent": "App-Universe",
            },
            body: JSON.stringify({
              message: "Update app order",
              content: contentBase64,
              branch: GITHUB_BRANCH,
              ...(sha && { sha }),
            }),
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          let errorData: any
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText.substring(0, 200) }
          }
          throw new Error(errorData.message || "GitHub API error")
        }

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error("[v0] GitHub commit failed:", error)
        return NextResponse.json(
          { error: "Failed to commit to GitHub", details: error?.message || String(error) },
          { status: 500 }
        )
      }
    }
    
    // Development: write to files
    await ensureDataDir()
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving orders:", error)
    return NextResponse.json({ error: "Failed to save orders" }, { status: 500 })
  }
}

