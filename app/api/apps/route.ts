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
      
      try {
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        const response = await fetch(`${baseUrl}/api/github`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filePath,
            content,
            message: `Update app: ${app.title}`,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.details || error.error || "GitHub commit failed")
        }
        
        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error("[v0] GitHub commit failed:", error)
        console.log("[v0] App data to commit:", content)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to commit to GitHub. Check console for data.",
          details: error?.message 
        }, { status: 500 })
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
