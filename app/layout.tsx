import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Emojot App Universe | Internal & External Productivity Tools",
  description: "A minimal showcase of internal and external productivity tools for the Emojot team",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          fontFamily:
            '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", "Menlo", "Consolas", monospace',
        }}
      >
        {children}
      </body>
    </html>
  )
}
