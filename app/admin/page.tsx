"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"
import { getApps, saveApps, type App } from "@/lib/apps-data"
import { useTheme } from "next-themes"

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "emojot2024"

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [apps, setApps] = useState<App[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentApp, setCurrentApp] = useState<App | null>(null)
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
    setApps(getApps())
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setLoginError("")
    } else {
      setLoginError("Invalid username or password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUsername("")
    setPassword("")
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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this app?")) {
      const updatedApps = apps.filter((app) => app.id !== id)
      setApps(updatedApps)
      saveApps(updatedApps)
      window.dispatchEvent(new Event("apps-updated"))
    }
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newApps = [...apps]
    ;[newApps[index - 1], newApps[index]] = [newApps[index], newApps[index - 1]]
    const appsWithOrder = newApps.map((app, idx) => ({ ...app, order: idx }))
    setApps(appsWithOrder)
    saveApps(appsWithOrder)
    window.dispatchEvent(new Event("apps-updated"))
  }

  const moveDown = (index: number) => {
    if (index === apps.length - 1) return
    const newApps = [...apps]
    ;[newApps[index], newApps[index + 1]] = [newApps[index + 1], newApps[index]]
    const appsWithOrder = newApps.map((app, idx) => ({ ...app, order: idx }))
    setApps(appsWithOrder)
    saveApps(appsWithOrder)
    window.dispatchEvent(new Event("apps-updated"))
  }

  const handleSave = () => {
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    const fullDescription = editorRef.current?.innerHTML || formData.fullDescription || ""

    let updatedApps: App[]

    if (currentApp) {
      updatedApps = apps.map((app) =>
        app.id === currentApp.id
          ? { ...app, ...formData, tags: tagsArray, fullDescription, images: app.images || [] }
          : app,
      )
    } else {
      const newApp: App = {
        id: `app-${Date.now()}`,
        ...formData,
        tags: tagsArray,
        fullDescription,
        images: [],
        order: apps.length,
      }
      updatedApps = [...apps, newApp]
    }

    setApps(updatedApps)
    saveApps(updatedApps)
    window.dispatchEvent(new Event("apps-updated"))
    setIsEditing(false)
  }

  useEffect(() => {
    if (isEditing && editorRef.current && formData.fullDescription) {
      editorRef.current.innerHTML = formData.fullDescription
    } else if (isEditing && editorRef.current && !formData.fullDescription) {
      editorRef.current.innerHTML = ""
    }
  }, [isEditing])

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
        <div className="flex flex-col gap-4">
          {apps.map((app, index) => (
            <Card key={app.id} className="overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="relative flex-shrink-0">
                  <Image
                    src={app.previewImage || "/placeholder.svg"}
                    alt={app.title}
                    width={64}
                    height={64}
                    className="object-cover w-16 h-16 rounded-lg"
                  />
                  {app.isNew && (
                    <div className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold px-2 py-0.5 rounded">
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
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="rounded-lg px-3"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveDown(index)}
                      disabled={index === apps.length - 1}
                      className="rounded-lg px-3"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(app)} className="rounded-lg px-3">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(app.id)}
                      className="rounded-lg px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
              <Label htmlFor="previewImage">App Icon URL</Label>
              <Input
                id="previewImage"
                value={formData.previewImage}
                onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })}
                placeholder="/images/app-icon.png"
                className="rounded-lg"
              />
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
