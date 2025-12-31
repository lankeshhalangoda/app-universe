import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "apps")
const MAX_IMAGE_SIZE = 100 * 1024 // 100KB in bytes

async function ensureDir(dir: string) {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
}

function getNextLetter(existingFiles: string[]): string {
  if (existingFiles.length === 0) return "a"
  
  const letters = existingFiles
    .map((file) => file.match(/-([a-z])\.png$/)?.[1])
    .filter(Boolean)
    .map((l) => l!.charCodeAt(0) - 97)
  
  const maxNum = letters.length > 0 ? Math.max(...letters) : -1
  return String.fromCharCode(97 + maxNum + 1)
}

export async function POST(request: Request) {
  try {
    await ensureDir(IMAGES_DIR)
    const { title, image, isReplacement, oldTitle } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Validate PNG format
    if (!image.startsWith("data:image/png;base64,")) {
      return NextResponse.json({ error: "Only PNG images are allowed" }, { status: 400 })
    }

    // Extract and validate size
    const base64Data = image.replace(/^data:image\/png;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    
    if (buffer.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Image size exceeds 100KB limit (${Math.round(buffer.length / 1024)}KB)` },
        { status: 400 }
      )
    }

    const sanitizedTitle = sanitizeFilename(title)

    // Determine filename
    let letter: string
    if (isReplacement) {
      letter = "a"
    } else {
      try {
        const files = await fs.readdir(IMAGES_DIR)
        const appImages = files.filter((f) => f.startsWith(`${sanitizedTitle}-`) && f.endsWith(".png"))
        letter = getNextLetter(appImages)
      } catch {
        letter = "a"
      }
    }

    // Delete existing images if title changed
    if (oldTitle && oldTitle !== title) {
      const oldSanitized = sanitizeFilename(oldTitle)
      try {
        const files = await fs.readdir(IMAGES_DIR)
        const oldImages = files.filter((f) => f.startsWith(`${oldSanitized}-`) && f.endsWith(".png"))
        await Promise.all(oldImages.map((f) => fs.unlink(path.join(IMAGES_DIR, f))))
      } catch {
        // Ignore errors
      }
    }

    // Delete existing "a.png" if replacing
    if (isReplacement) {
      const existingPath = path.join(IMAGES_DIR, `${sanitizedTitle}-a.png`)
      try {
        await fs.unlink(existingPath)
      } catch {
        // Ignore if file doesn't exist
      }
    }

    // Save image
    const filename = `${sanitizedTitle}-${letter}.png`
    const filePath = path.join(IMAGES_DIR, filename)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ path: `/images/apps/${filename}` })
  } catch (error) {
    console.error("[v0] Error saving image:", error)
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 })
  }
}
