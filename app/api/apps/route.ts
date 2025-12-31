import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const APPS_DIR = path.join(process.cwd(), "data", "apps")
const IS_PRODUCTION = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"

export interface App {
  id: string
  title: string
  url: string
  description: string
  fullDescription: string
  tags: string[]
  category: "internal" | "external"
  previewImage: string
  images: string[]
  isNew?: boolean
  order?: number
}

async function ensureDir(dir: string) {
  try {
    await fs.access(dir)
  } catch {
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch (error) {
      console.error(`[v0] Failed to create directory ${dir}:`, error)
      throw new Error(`Cannot create directory: ${dir}`)
    }
  }
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length
}

async function getAppsFromFiles(): Promise<App[]> {
  try {
    await ensureDir(APPS_DIR)
    const files = await fs.readdir(APPS_DIR)
    const jsonFiles = files.filter((f) => f.endsWith(".json"))

    const apps = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(APPS_DIR, file)
        const content = await fs.readFile(filePath, "utf-8")
        return JSON.parse(content) as App
      })
    )

    return apps.filter((app, index, self) =>
      index === self.findIndex((a) => a.id === app.id)
    )
  } catch {
    return []
  }
}

async function getOrdersFromFile(): Promise<string[]> {
  try {
    const ordersFile = path.join(process.cwd(), "data", "orders.json")
    const ordersContent = await fs.readFile(ordersFile, "utf-8")
    return JSON.parse(ordersContent)
  } catch {
    return []
  }
}

export async function GET() {
  try {
    // In production, read from committed files only (read-only)
    const apps = await getAppsFromFiles()
    const orderMap = await getOrdersFromFile()

    // Sort apps according to order
    const appMap = new Map(apps.map((app) => [app.id, app]))
    const orderedApps: App[] = []
    const unorderedApps: App[] = []

    for (const id of orderMap) {
      const app = appMap.get(id)
      if (app) {
        orderedApps.push(app)
        appMap.delete(id)
      }
    }

    for (const app of appMap.values()) {
      unorderedApps.push(app)
    }

    return NextResponse.json([...orderedApps, ...unorderedApps])
  } catch (error) {
    console.error("[v0] Error reading apps:", error)
    return NextResponse.json({ error: "Failed to read apps" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const app: App = await request.json()
    
    if (!app.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    
    if (!app.id) {
      return NextResponse.json({ error: "App ID is required" }, { status: 400 })
    }
    
    // In production (Vercel), use GitHub API to commit files
    if (IS_PRODUCTION) {
      const filename = `${sanitizeFilename(app.title)}.json`
      const filePath = `data/apps/${filename}`
      const content = JSON.stringify(app, null, 2)
      
      // Call GitHub API directly (server-side)
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN
      const GITHUB_REPO = process.env.GITHUB_REPO
      const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main"

      if (!GITHUB_TOKEN || !GITHUB_REPO) {
        console.error("[v0] GitHub credentials not configured")
        return NextResponse.json(
          { error: "GitHub credentials not configured. Please set GITHUB_TOKEN and GITHUB_REPO in Vercel environment variables." },
          { status: 500 }
        )
      }

      try {
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
        } catch {}

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
              message: `Update app: ${app.title}`,
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
    await ensureDir(APPS_DIR)
    const filename = `${sanitizeFilename(app.title)}.json`
    if (filename === ".json") {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 })
    }
    
    const filePath = path.join(APPS_DIR, filename)

    // If editing and title changed, delete old file
    if (app.id) {
      try {
        const files = await fs.readdir(APPS_DIR).catch(() => [])
        for (const file of files.filter((f) => f.endsWith(".json"))) {
          try {
            const oldPath = path.join(APPS_DIR, file)
            const oldApp = JSON.parse(await fs.readFile(oldPath, "utf-8")) as App
            if (oldApp.id === app.id && oldApp.title !== app.title && file !== filename) {
              await fs.unlink(oldPath).catch(() => {})
              break
            }
          } catch {}
        }
      } catch {}
    }

    await fs.writeFile(filePath, JSON.stringify(app, null, 2), "utf-8")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error saving app:", error)
    return NextResponse.json(
      { error: "Failed to save app", details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    // Find the file by reading all files and matching the ID
    const files = await fs.readdir(APPS_DIR)
    const jsonFiles = files.filter((f) => f.endsWith(".json"))
    
    for (const file of jsonFiles) {
      const filePath = path.join(APPS_DIR, file)
      const content = await fs.readFile(filePath, "utf-8")
      const app = JSON.parse(content) as App
      
      if (app.id === id) {
        await fs.unlink(filePath)
        return NextResponse.json({ success: true })
      }
    }
    
    return NextResponse.json({ error: "App not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Error deleting app:", error)
    return NextResponse.json({ error: "Failed to delete app" }, { status: 500 })
  }
}
