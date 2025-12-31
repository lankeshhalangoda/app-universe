import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "apps")

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params
    const filename = pathArray.join("/")
    
    // Security: prevent directory traversal and only allow PNG files
    if (filename.includes("..") || !filename.endsWith(".png")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const filePath = path.join(IMAGES_DIR, filename)

    try {
      const imageBuffer = await fs.readFile(filePath)
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    } catch {
      // If file doesn't exist, try public/images/apps as fallback
      const publicPath = path.join(process.cwd(), "public", "images", "apps", filename)
      try {
        const imageBuffer = await fs.readFile(publicPath)
        return new NextResponse(imageBuffer, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        })
      } catch {
        return NextResponse.json({ error: "Image not found" }, { status: 404 })
      }
    }
  } catch (error) {
    console.error("[v0] Error serving image:", error)
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 })
  }
}
