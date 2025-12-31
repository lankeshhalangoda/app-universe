"use client"
import { useState, useEffect, useMemo } from "react"
import { Search, ChevronDown, Moon, Sun, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useTheme } from "next-themes"
import { getApps, type App } from "@/lib/apps-data"

export default function AppUniverse() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [apps, setApps] = useState<App[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const loadedApps = getApps().sort((a, b) => (a.order || 0) - (b.order || 0))
    setApps(loadedApps)

    const handleStorageChange = () => {
      const loadedApps = getApps().sort((a, b) => (a.order || 0) - (b.order || 0))
      setApps(loadedApps)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("apps-updated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("apps-updated", handleStorageChange)
    }
  }, [])

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || app.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [apps, searchTerm, selectedCategory])

  const categories = ["all", "internal", "external"]

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/emojot-logo-white.png"
              alt="Emojot Logo"
              width={120}
              height={40}
              className="h-8 w-auto hidden dark:block"
            />
            <Image
              src="/images/emojot-logo-black.png"
              alt="Emojot Logo"
              width={120}
              height={40}
              className="h-8 w-auto dark:hidden"
            />
            <span className="text-muted-foreground/50">|</span>
            <h1 className="text-lg font-semibold tracking-tight italic">App Universe</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-5xl flex-1">
        {/* Search */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search apps by name, description or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 text-base rounded-xl bg-muted/50 border-0 focus-visible:ring-2"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-4 shrink-0 transition-colors ${
                  selectedCategory === category
                    ? "bg-black dark:bg-black text-white hover:bg-black/90 dark:hover:bg-black/90 border-black"
                    : ""
                }`}
                size="sm"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* App List */}
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="border rounded-xl bg-card overflow-hidden transition-all hover:shadow-lg relative"
            >
              {app.isNew && (
                <div className="absolute top-0 right-0 bg-black text-white text-xs font-semibold px-3 py-1 rounded-bl-lg z-10">
                  NEW
                </div>
              )}

              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(app.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted shadow-sm">
                  <Image
                    src={app.previewImage || "/placeholder.svg"}
                    alt={`${app.title} icon`}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">{app.title}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {app.category === "internal" ? "Internal" : "External"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{app.description}</p>
                </div>

                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${
                    expandedId === app.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Accordion Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedId === app.id ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 pt-2 space-y-4 border-t">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Full Description */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">About this app</h4>
                    <div
                      className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: app.fullDescription }}
                    />
                  </div>

                  {/* Open App Button */}
                  <Button asChild className="w-full rounded-lg" size="default">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Open App
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="mb-4 text-lg text-muted-foreground">No apps found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
              }}
              className="rounded-lg"
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-xl mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Emojot. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <p>Powered by Emojot</p>
              <span className="text-muted-foreground/50">|</span>
              <p className="flex items-center gap-1">
                Made with <span className="text-red-500">♥</span> by Lankesh
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
