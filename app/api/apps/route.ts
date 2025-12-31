import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const APPS_DIR = path.join(process.cwd(), "data", "apps")

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

export async function GET() {
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

    // Remove duplicates by keeping the first occurrence of each ID
    const uniqueApps = apps.filter((app, index, self) =>
      index === self.findIndex((a) => a.id === app.id)
    )

    // Read order from orders.json
    const ordersFile = path.join(process.cwd(), "data", "orders.json")
    let orderMap: string[] = []
    try {
      const ordersContent = await fs.readFile(ordersFile, "utf-8")
      orderMap = JSON.parse(ordersContent)
    } catch {
      // If orders.json doesn't exist, use default order (by existing order field or ID)
      orderMap = uniqueApps.sort((a, b) => (a.order || 0) - (b.order || 0)).map((app) => app.id)
    }

    // Sort apps according to order in orders.json
    const appMap = new Map(uniqueApps.map((app) => [app.id, app]))
    const orderedApps: App[] = []
    const unorderedApps: App[] = []

    // Add apps in the order specified in orders.json
    for (const id of orderMap) {
      const app = appMap.get(id)
      if (app) {
        orderedApps.push(app)
        appMap.delete(id)
      }
    }

    // Add any apps not in orders.json at the end
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
    // Ensure data directory exists first
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    // Then ensure apps directory exists
    await ensureDir(APPS_DIR)
    
    let app: App
    try {
      app = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }
    
    if (!app.title || !app.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    
    if (!app.id) {
      return NextResponse.json({ error: "App ID is required" }, { status: 400 })
    }
    
    const filename = `${sanitizeFilename(app.title)}.json`
    
    if (!filename || filename === ".json") {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 })
    }
    
    const filePath = path.join(APPS_DIR, filename)

    // If editing existing app, check if title changed and delete old file
    if (app.id) {
      try {
        const files = await fs.readdir(APPS_DIR)
        const jsonFiles = files.filter((f) => f.endsWith(".json"))
        
        for (const file of jsonFiles) {
          const oldPath = path.join(APPS_DIR, file)
          try {
            const content = await fs.readFile(oldPath, "utf-8")
            const oldApp = JSON.parse(content) as App
            
            // If same ID but different title, delete old file
            if (oldApp.id === app.id && oldApp.title !== app.title && file !== filename) {
              await fs.unlink(oldPath)
              break
            }
          } catch (err) {
            // Continue if file can't be read
            console.error(`[v0] Error reading file ${file}:`, err)
          }
        }
      } catch (err) {
        console.error("[v0] Error reading apps directory:", err)
        // Continue anyway - might be first app
      }
    }

    await fs.writeFile(filePath, JSON.stringify(app, null, 2), "utf-8")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving app:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to save app", details: errorMessage },
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
