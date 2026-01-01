import { notFound } from "next/navigation"

const IS_PRODUCTION = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Block admin panel in production
  if (IS_PRODUCTION) {
    notFound()
  }

  return <>{children}</>
}

