import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "emojot2024"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { username, password, action } = await request.json()

    if (action === "login") {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const cookieStore = await cookies()
        cookieStore.set("adminAuth", "authenticated", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    } else if (action === "logout") {
      const cookieStore = await cookies()
      cookieStore.delete("adminAuth")
      return NextResponse.json({ success: true })
    } else if (action === "check") {
      const cookieStore = await cookies()
      const authCookie = cookieStore.get("adminAuth")
      return NextResponse.json({ authenticated: authCookie?.value === "authenticated" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("adminAuth")
    return NextResponse.json({ authenticated: authCookie?.value === "authenticated" })
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}

