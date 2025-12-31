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
      try {
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        await fetch(`${baseUrl}/api/github`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filePath: "data/orders.json",
            content,
            message: "Update app order",
          }),
        })
        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error("[v0] GitHub commit failed:", error)
        console.log("[v0] Orders data to commit:", content)
        return NextResponse.json({ 
          success: false, 
          error: "Failed to commit to GitHub. Check console for data.",
          details: error?.message 
        }, { status: 500 })
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

