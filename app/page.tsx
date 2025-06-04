"use client"

import { useState, useMemo } from "react"
import { Search, Filter, SortAsc, ExternalLink, ChevronUp, ChevronDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

interface App {
  id: string
  title: string
  url: string
  description: string
  fullDescription: string
  tags: string[]
  category: "internal" | "external"
  previewImage: string
}

const apps: App[] = [
  {
    id: "bulk-qr",
    title: "Bulk QR Generator",
    url: "https://emojot-qr-generator.vercel.app/",
    description:
      "Create large batches of QR codes with logos and custom location labels from Excel files. Perfect for physical campaigns, event check-ins, or on-site surveys.",
    fullDescription:
      "Create large batches of QR codes with logos and custom location labels from Excel files. Perfect for physical campaigns, event check-ins, or on-site surveys. Allows exporting in PNG format with built-in caching. Supports bulk processing of thousands of QR codes simultaneously with advanced customization options including logo placement, error correction levels, and output formats. Features batch validation, progress tracking, and automated file organization.",
    tags: ["emojot", "QR", "Generator", "Branding", "Location", "Bulk"],
    category: "internal",
    previewImage: "/images/bulk-qr.png",
  },
  {
    id: "email-builder",
    title: "Drag & Drop Template Creator",
    url: "https://emojot-email-builder.vercel.app/",
    description:
      "Build sleek, responsive HTML emails using a no-code, drag-and-drop builder. Export reusable, campaign-ready templates with clean formatting.",
    fullDescription:
      "Build sleek, responsive HTML emails using a no-code, drag-and-drop builder. Export reusable, campaign-ready templates with clean formatting. Ideal for internal and client communications. Features include pre-built components, mobile optimization, A/B testing capabilities, and integration with major email service providers. Advanced template library with customizable blocks, real-time preview, and automated testing across email clients.",
    tags: ["emojot", "Email", "Template", "Builder", "Drag and Drop", "Marketing"],
    category: "internal",
    previewImage: "/images/email-template.png",
  },
  {
    id: "csm-suite",
    title: "Enterprise Hierarchy, Engagement Rules, and Workflow Generator",
    url: "https://csm-suite.vercel.app/",
    description:
      "Automate the creation of Enterprise Hierarchy, Engagement Rules, and Workflow configuration files for CXM, CCM, and ORM products.",
    fullDescription:
      "Automate the creation of Enterprise Hierarchy, Engagement Rules, and Workflow configuration files for CXM, CCM, and ORM products. Combines user input and AI prompting to generate optimized file structures with minimal manual edits. Includes validation, testing tools, and deployment automation for enterprise-scale implementations. Features intelligent configuration suggestions, dependency mapping, and comprehensive documentation generation.",
    tags: ["emojot", "Workflow", "Enterprise Hierarchy", "Engagement Rules", "Automation", "CSM", "AI"],
    category: "internal",
    previewImage: "/images/csm-suite.png",
  },
  {
    id: "orm-config-generator",
    title: "ORM Config Generator",
    url: "https://orm-config-generator.vercel.app/",
    description:
      "Easily generate ORM configuration JSON files to automate review collection, categorization, and ticket creation for Google and Facebook reviews.",
    fullDescription:
      "Easily generate ORM configuration JSON files to automate review collection, categorization, and ticket creation for platforms like Google and Facebook. Define channel IDs, workflow mappings, sentiment rules, and star rating thresholds. Supports business location linking via EH, AI-powered sentiment triggers, and conditional workflow integration. Designed for Emojot Solution Engineers to streamline ORM setup and ensure fast deployment across multi-location brands.",
    tags: ["emojot", "ORM", "Reviews", "Automation", "Configuration", "Google", "Facebook"],
    category: "internal",
    previewImage: "/images/orm-config-generator.png"
  },
  {
    id: "wf-builder",
    title: "Solo Workflow Generator",
    url: "https://wfbuilder.onrender.com/",
    description:
      "Create standalone Workflow JSON files tailored to a specific use case, complete with fields, status flows, alert triggers, and escalation logic.",
    fullDescription:
      "Create standalone Workflow JSON files tailored to a specific use case, complete with fields, status flows, alert triggers, and escalation logic. Suitable for building and testing new workflows independently. Features visual workflow designer, real-time validation, and comprehensive testing suite for workflow logic verification. Includes simulation tools, performance analytics, and automated documentation generation.",
    tags: ["emojot", "Workflow", "Builder", "Escalation", "Logic", "JSON"],
    category: "internal",
    previewImage: "/images/solo-workflow.png",
  },
  {
    id: "emosignature",
    title: "Emosignature Link Generator",
    url: "https://v0-survey-link-generator.vercel.app/",
    description:
      "Generate EmoSignature survey links with embedded department, location, or staff metadata. Ideal for role-based feedback collection.",
    fullDescription:
      "Generate EmoSignature survey links with embedded department, location, or staff metadata. Ideal for role-based feedback collection and Enterprise Hierarchy-mapped survey flows. Supports dynamic link generation, custom parameters, tracking analytics, and integration with existing survey platforms for seamless data collection. Features automated distribution, response tracking, and comprehensive reporting dashboard.",
    tags: ["emojot", "Survey", "Link Generator", "EmoSignature", "Personalized Links"],
    category: "internal",
    previewImage: "/images/emosignature.png",
  },
  {
    id: "short-io",
    title: "Short Link Generator",
    url: "https://app.short.io/",
    description:
      "Branded URL shortener for simplifying long survey links and enabling tracking. Supports custom domains and link performance analytics.",
    fullDescription:
      "Branded URL shortener for simplifying long survey links and enabling tracking. Supports custom domains and link performance analytics for digital campaigns and feedback flows. Advanced features include click tracking, geographic analytics, device detection, and comprehensive reporting dashboard for campaign optimization. Features bulk link creation, API integration, and automated link expiration management.",
    tags: ["Short URL", "Link Management", "Branding", "Analytics"],
    category: "external",
    previewImage: "/images/short-io.png",
  },
  {
    id: "coolors",
    title: "Emoticons Color Palette",
    url: "https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e63946",
    description:
      "Pre-configured color palettes optimized for emotes, charts, and branded experiences. Ideal for visual design and campaign planning.",
    fullDescription:
      "Pre-configured color palettes optimized for emotes, charts, and branded experiences. Ideal for visual design, campaign planning, or email styling. Features include color harmony analysis, accessibility checking, export to various formats, and integration with design tools for streamlined workflow. Advanced palette generation, trend analysis, and brand consistency checking tools included.",
    tags: ["Color", "Palette", "Design", "Branding", "Visuals", "Emotes"],
    category: "external",
    previewImage: "/images/color-palette.png",
  },
  {
    id: "base64",
    title: "Base64 Encoder",
    url: "https://www.base64decode.org/",
    description:
      "Convert files and images to Base64 format for embedding in email templates, HTML surveys, or image-based field entries.",
    fullDescription:
      "Convert files and images to Base64 format for embedding in email templates, HTML surveys, or image-based field entries. Streamlines asset embedding in no-code environments. Supports batch processing, multiple file formats, and provides optimization suggestions for better performance and compatibility. Features drag-and-drop interface, format validation, and automated compression options.",
    tags: ["Encoding", "Base64", "Embed", "Email", "HTML", "Utility"],
    category: "external",
    previewImage: "/images/base64.png",
  },
]

export default function EmojotAppUniverse() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTag, setSelectedTag] = useState("")
  const [sortBy, setSortBy] = useState("alphabetical")
  const [showAllTags, setShowAllTags] = useState(false)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    apps.forEach((app) => app.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [])

  const filteredAndSortedApps = useMemo(() => {
    const filtered = apps.filter((app) => {
      const matchesSearch =
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "internal" && app.category === "internal") ||
        (selectedCategory === "external" && app.category === "external")
      const matchesTag = !selectedTag || app.tags.includes(selectedTag)

      return matchesSearch && matchesCategory && matchesTag
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.title.localeCompare(b.title)
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedCategory, selectedTag, sortBy])

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? "" : tag)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-space font-mono text-white relative overflow-hidden">
        {/* Animated stars background */}
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>

        {/* Header */}
        <header className="border-b border-purple-500/30 bg-black/60 backdrop-blur-md sticky top-0 z-40">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between relative">
              {/* Logo on left */}
              <div className="flex items-center">
                <Image
                  src="/images/emojot-logo-white.png"
                  alt="Emojot Logo"
                  width={160}
                  height={50}
                  className="h-12 w-auto logo-float"
                />
              </div>

              {/* App Universe centered */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-4xl font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 logo-float header-text">
                  APP UNIVERSE
                </h1>
              </div>

              {/* Galactic Year on right */}
              <div className="text-right logo-float">
                <div className="text-sm text-purple-300 font-mono">Galactic Year</div>
                <div className="text-lg text-pink-400 font-mono font-bold">2025.05</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12 relative z-10">
          {/* Search and Filters */}
          <div className="mb-12 space-y-6 bg-black/40 backdrop-blur-md border border-purple-500/30 p-8 rounded-xl glow-effect">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/60 border-pink-400/50 text-white placeholder:text-gray-400 focus:border-pink-400 h-12"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 bg-black/60 border-purple-400/50 text-white h-12">
                  <Filter className="h-4 w-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-black border-purple-400/50">
                  <SelectItem value="all" className="text-white hover:bg-purple-500/20">
                    All Apps
                  </SelectItem>
                  <SelectItem value="internal" className="text-white hover:bg-purple-500/20">
                    Our Apps
                  </SelectItem>
                  <SelectItem value="external" className="text-white hover:bg-purple-500/20">
                    External Apps
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48 bg-black/60 border-pink-400/50 text-white h-12">
                  <SortAsc className="h-4 w-4 mr-2 text-pink-400" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-black border-pink-400/50">
                  <SelectItem value="alphabetical" className="text-white hover:bg-pink-500/20">
                    Alphabetical
                  </SelectItem>
                  <SelectItem value="category" className="text-white hover:bg-pink-500/20">
                    Category
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filter */}
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllTags(!showAllTags)}
                className="text-sm font-medium text-gray-300 hover:text-pink-400 hover:bg-pink-400/10"
              >
                Filter by tags ({allTags.length})
                {showAllTags ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
              {showAllTags && (
                <div className="flex flex-wrap gap-2 p-4 bg-black/30 rounded-lg border border-pink-400/20">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "secondary"}
                      className={`cursor-pointer text-xs transition-all ${selectedTag === tag
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                          : "bg-black/60 text-gray-300 border-gray-600 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 hover:border-pink-400"
                        }`}
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedApps.map((app) => (
              <Card
                key={app.id}
                className="group hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-2 bg-black/40 backdrop-blur-md border border-purple-500/30 hover:border-pink-400/50 card-glow"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={app.previewImage || "/placeholder.svg"}
                      alt={`${app.title} preview`}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={
                          app.category === "internal"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                        }
                      >
                        {app.category === "internal" ? "INTERNAL" : "EXTERNAL"}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-black/60 backdrop-blur-sm border border-gray-600 hover:bg-black/80 hover:border-pink-400"
                          >
                            <Info className="h-4 w-4 text-gray-300" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-sm bg-black/95 backdrop-blur-md border border-purple-500/30 text-white p-4 z-[200]"
                        >
                          <p className="text-sm leading-relaxed">{app.fullDescription}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-lg mb-3 line-clamp-2 text-white font-mono">{app.title}</CardTitle>
                  <Button
                    asChild
                    className="w-full mb-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 font-mono h-10"
                    size="sm"
                  >
                    <a href={app.url} target="_blank" rel="noopener noreferrer">
                      Launch <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <CardDescription className="text-sm mb-4 line-clamp-3 text-gray-300 font-mono leading-relaxed">
                    {app.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1">
                    {app.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-purple-500/20 border-gray-600 text-gray-400 hover:text-purple-300 hover:border-purple-400 font-mono"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAndSortedApps.length === 0 && (
            <div className="text-center py-16 bg-black/40 backdrop-blur-md rounded-xl border border-red-500/30">
              <p className="text-red-400 text-lg font-mono mb-4">No applications found matching your criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedTag("")
                }}
                className="border-red-400 text-red-400 hover:bg-red-400/20 font-mono"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-purple-500/30 bg-black/50 backdrop-blur-md mt-20">
          <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 font-mono">Powered by Emojot</p>
            <p className="text-sm text-gray-400 font-mono">Made with ❤️ by Lankesh</p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}
