"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Bold,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
  LogOut,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"
import Link from "next/link"
import type { App } from "@/lib/apps-data"
import { useTheme } from "next-themes"

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [apps, setApps] = useState<App[]>([])
  const [isLoadingApps, setIsLoadingApps] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentApp, setCurrentApp] = useState<App | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    fullDescription: "",
    tags: "",
    category: "internal" as "internal" | "external",
    previewImage: "",
    isNew: false,
  })
  const editorRef = useRef<HTMLDivElement>(null)
  const { theme, mounted } = useTheme()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    setIsCheckingAuth(true)
    try {
      const response = await fetch("/api/auth", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(data.authenticated || false)
      }
    } catch (error) {
      console.error("[v0] Error checking auth:", error)
      setIsAuthenticated(false)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  useEffect(() => {
    loadApps()
  }, [])

  async function loadApps() {
    setIsLoadingApps(true)
    try {
      const response = await fetch("/api/apps", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        // Remove duplicates by keeping the first occurrence of each ID
        const uniqueApps = data.filter((app: App, index: number, self: App[]) =>
          index === self.findIndex((a) => a.id === app.id)
        )
        setApps(uniqueApps)
      }
    } catch (error) {
      console.error("[v0] Error loading apps:", error)
    } finally {
      setIsLoadingApps(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, action: "login" }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setLoginError("")
        setUsername("")
        setPassword("")
      } else {
        const data = await response.json()
        setLoginError(data.error || "Invalid username or password")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setLoginError("Failed to login. Please try again.")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      setIsAuthenticated(false)
      setUsername("")
      setPassword("")
    }
  }

  const handleAddNew = () => {
    setCurrentApp(null)
    setFormData({
      title: "",
      url: "",
      description: "",
      fullDescription: "",
      tags: "",
      category: "internal",
      previewImage: "",
      isNew: false,
    })
    setIsEditing(true)
  }

  const handleEdit = (app: App) => {
    setCurrentApp(app)
    setFormData({
      title: app.title,
      url: app.url,
      description: app.description,
      fullDescription: app.fullDescription,
      tags: app.tags.join(", "),
      category: app.category,
      previewImage: app.previewImage,
      isNew: app.isNew || false,
    })
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = app.fullDescription
      }
    }, 0)
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this app?")) {
      try {
        const response = await fetch("/api/apps", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })

        if (response.ok) {
          // Remove from orders.json
          const ordersResponse = await fetch("/api/orders")
          const currentOrders = ordersResponse.ok ? await ordersResponse.json() : []
          const newOrders = currentOrders.filter((appId: string) => appId !== id)
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newOrders),
          })
          await loadApps()
        }
      } catch (error) {
        console.error("[v0] Error deleting app:", error)
      }
    }
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.dropEffect = "move"
    // Improve drag performance
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/html", "")
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    // Only update state if the index actually changed
    setDragOverIndex((prev) => (prev !== index ? index : prev))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're actually leaving the card (not just moving to a child element)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverIndex(null)

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    // Optimistically update UI first
    const newApps = [...apps]
    const draggedApp = newApps[draggedIndex]
    newApps.splice(draggedIndex, 1)
    newApps.splice(dropIndex, 0, draggedApp)
    setApps(newApps)
    setDraggedIndex(null)

    // Save order to orders.json (just the array of IDs)
    const orderIds = newApps.map((app) => app.id)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderIds),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(`Failed to save order: ${error.error || "Unknown error"}`)
      }
      console.log("[v0] App order saved successfully")
    } catch (error) {
      console.error("[v0] Error saving app order:", error)
      // If save fails, reload to get correct state from server
      await loadApps()
      alert("Failed to save app order. Please try again.")
    }
  }, [apps, draggedIndex])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleSave = async () => {
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const fullDescription = editorRef.current?.innerHTML || formData.fullDescription || ""

    // Handle image - only URLs are supported now
    let previewImage = formData.previewImage.trim()
    
    // If empty, use default image
    if (!previewImage) {
      previewImage = "https://storage.emojot.com/pictures/generalImages/67761761cb917201e680c031-skin16.png"
    }
    
    // Validate it's a URL
    if (!previewImage.startsWith("http://") && !previewImage.startsWith("https://")) {
      // If not a URL, show error
      alert("Please enter a valid image URL (must start with http:// or https://)")
      return
    }

    const app: App = currentApp
      ? { ...currentApp, ...formData, tags: tagsArray, fullDescription, previewImage, images: [] }
      : {
          id: `app-${Date.now()}`,
          ...formData,
          tags: tagsArray,
          fullDescription,
          previewImage,
          images: [],
          order: apps.length,
        }

    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      })

      if (response.ok) {
        // If it's a new app, add it to the end of orders.json
        if (!currentApp) {
          const ordersResponse = await fetch("/api/orders")
          const currentOrders = ordersResponse.ok ? await ordersResponse.json() : []
          if (!currentOrders.includes(app.id)) {
            const newOrders = [...currentOrders, app.id]
            await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newOrders),
            })
          }
        }
        await loadApps()
        setIsEditing(false)
      }
    } catch (error) {
      console.error("[v0] Error saving app:", error)
    }
  }

  useEffect(() => {
    if (isEditing && editorRef.current && formData.fullDescription) {
      editorRef.current.innerHTML = formData.fullDescription
    } else if (isEditing && editorRef.current && !formData.fullDescription) {
      editorRef.current.innerHTML = ""
    }
  }, [isEditing])

  // Show loader while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/30 via-blue-50/30 to-purple-50/30 dark:from-pink-950/10 dark:via-blue-950/10 dark:to-purple-950/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-background/80 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Spinner className="size-8 text-primary mb-4" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/30 via-blue-50/30 to-purple-50/30 dark:from-pink-950/10 dark:via-blue-950/10 dark:to-purple-950/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-background/80 backdrop-blur-xl">
          <CardHeader className="space-y-6 pb-8 pt-10">
            <div className="flex flex-col items-center gap-4">
              {mounted && (
                <Image
                  src={theme === "dark" ? "/images/emojot-logo-white.png" : "/images/emojot-logo-black.png"}
                  alt="Emojot Logo"
                  width={160}
                  height={50}
                  className="h-12 w-auto"
                  priority
                />
              )}
              <div className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold tracking-tight">App Universe</CardTitle>
                <p className="text-muted-foreground text-sm">Admin Portal</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-lg h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your password"
                  required
                />
              </div>
              {loginError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="text-sm text-destructive font-medium">{loginError}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full rounded-lg h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App Universe
              </Link>
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddNew} className="rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add New App
            </Button>
            <Button onClick={handleLogout} variant="outline" className="rounded-lg bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {isLoadingApps ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner className="size-8 text-primary mb-4" />
            <p className="text-muted-foreground">Loading apps...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {apps.map((app, index) => (
            <Card
              key={`${app.id}-${index}`}
              className={`overflow-hidden ${
                draggedIndex === index ? "opacity-30 scale-95" : ""
              } ${dragOverIndex === index && draggedIndex !== index ? "ring-2 ring-primary scale-[1.02]" : ""} transition-transform duration-150`}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="flex items-center gap-4 p-4">
                <div
                  className="cursor-grab active:cursor-grabbing flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors touch-none"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="relative flex-shrink-0">
                  <Image
                    src={app.previewImage || "/placeholder.svg"}
                    alt={app.title}
                    width={64}
                    height={64}
                    className="object-cover w-16 h-16 rounded-lg"
                  />
                  {app.isNew && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      NEW
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold line-clamp-1">{app.title}</h3>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {app.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {app.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(app)}
                    className="rounded-lg px-3"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(app.id)}
                    className="rounded-lg px-3"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          </div>
        )}
      </main>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentApp ? "Edit App" : "Add New App"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">App Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter app title"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">App URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description for the app list"
                className="rounded-lg min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Description (Rich Text)</Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="flex gap-1 p-2 border-b bg-muted/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat("bold")}
                    className="h-8 w-8 p-0"
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat("italic")}
                    className="h-8 w-8 p-0"
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat("insertUnorderedList")}
                    className="h-8 w-8 p-0"
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat("insertOrderedList")}
                    className="h-8 w-8 p-0"
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = prompt("Enter URL:")
                      if (url) applyFormat("createLink", url)
                    }}
                    className="h-8 w-8 p-0"
                    title="Insert Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[150px] p-3 focus:outline-none prose prose-sm dark:prose-invert max-w-none"
                  suppressContentEditableWarning
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "internal" | "external" })}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background"
              >
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>App Icon URL</Label>
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    id="previewImage"
                    value={formData.previewImage}
                    onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })}
                    placeholder="Enter image URL (https://example.com/image.png)"
                    className="rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid image URL (must start with http:// or https://)
                  </p>
                </div>
                {formData.previewImage && (
                  <div className="flex-shrink-0">
                    <Image
                      src={formData.previewImage || "/placeholder.svg"}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="object-cover w-16 h-16 rounded-lg border"
                      onError={(e) => {
                        // If image fails to load, show placeholder
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isNew"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <Label htmlFor="isNew" className="cursor-pointer">
                Mark as New (displays "NEW" badge)
              </Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1 rounded-lg">
                Save App
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 rounded-lg">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
