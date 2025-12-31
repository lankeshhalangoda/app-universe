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

export const initialApps: App[] = [
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
    images: ["/images/bulk-qr.png"],
    isNew: true,
    order: 1,
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
    images: ["/images/email-template.png"],
    isNew: true,
    order: 2,
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
    images: ["/images/csm-suite.png"],
    isNew: true,
    order: 3,
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
    images: ["/images/solo-workflow.png"],
    isNew: true,
    order: 4,
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
    images: ["/images/emosignature.png"],
    isNew: true,
    order: 5,
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
    images: ["/images/short-io.png"],
    isNew: false,
    order: 6,
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
    images: ["/images/color-palette.png"],
    isNew: false,
    order: 7,
  },
  {
    id: "base64",
    title: "Base64 Encoder",
    url: "https://www.base64decode.org/",
    description:
      "Convert files and images to Base64 format for embedding in email templates, HTML surveys, or image-based field entries.",
    fullDescription:
      "Convert files and images to Base64 format for embedding in email templates, HTML surveys, or image-based field entries. Streamlines asset embedding in no-code environments. Supports batch processing, multiple file formats, and provides optimization suggestions for better performance and compatibility. Features drag-and-drop interface, format validation, and automated compression options.",
    tags: ["Base64", "Encoding", "Conversion", "Images", "Files"],
    category: "external",
    previewImage: "/images/base64.png",
    images: ["/images/base64.png"],
    isNew: false,
    order: 8,
  },
]

export function getApps(): App[] {
  if (typeof window === "undefined") return initialApps

  const stored = localStorage.getItem("apps-data")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initialApps
    }
  }
  return initialApps
}

export function saveApps(apps: App[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("apps-data", JSON.stringify(apps))
    localStorage.setItem("apps-last-updated", new Date().toISOString())
    window.dispatchEvent(new Event("apps-updated"))
  }
}

export function getLastUpdated(): string {
  if (typeof window === "undefined") return new Date().toLocaleDateString()

  const lastUpdated = localStorage.getItem("apps-last-updated")
  if (lastUpdated) {
    const date = new Date(lastUpdated)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
