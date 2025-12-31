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

export async function getApps(): Promise<App[]> {
  try {
    const response = await fetch("/api/apps", { cache: "no-store" })
    if (!response.ok) throw new Error("Failed to fetch apps")
    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching apps:", error)
    return []
  }
}

export async function saveApp(app: App): Promise<boolean> {
  try {
    const response = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(app),
    })
    return response.ok
  } catch (error) {
    console.error("[v0] Error saving app:", error)
    return false
  }
}

export async function deleteApp(id: string): Promise<boolean> {
  try {
    const response = await fetch("/api/apps", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    return response.ok
  } catch (error) {
    console.error("[v0] Error deleting app:", error)
    return false
  }
}

export async function saveImage(id: string, base64Image: string): Promise<string | null> {
  try {
    // Detect image extension from base64 data
    const match = base64Image.match(/^data:image\/(\w+);base64,/)
    const extension = match ? match[1] : "png"

    const response = await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, image: base64Image, extension }),
    })

    if (!response.ok) throw new Error("Failed to save image")

    const { path } = await response.json()
    return path
  } catch (error) {
    console.error("[v0] Error saving image:", error)
    return null
  }
}
