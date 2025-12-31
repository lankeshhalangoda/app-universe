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
    await ensureDataDir()
    const orders = await request.json()
    
    // Validate that orders is an array of strings
    if (!Array.isArray(orders) || !orders.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "Invalid orders format" }, { status: 400 })
    }
    
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving orders:", error)
    return NextResponse.json({ error: "Failed to save orders" }, { status: 500 })
  }
}

