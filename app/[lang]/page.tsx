import { db } from "@/lib/db"
import DashboardClient from "@/components/DashboardClient"
import { type Property } from "@/components/PropertyMap"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const rs = await db.execute("SELECT * FROM property")
  // Sanitize rows to plain objects for React Server Components serialization
  const properties = rs.rows.map((row) => {
    const p = { ...row } as unknown as Property & {
      images: string | string[]
      tags: string | string[]
    }
    // Parse JSON columns
    if (typeof p.images === "string") {
      try {
        p.images = JSON.parse(p.images)
      } catch {
        p.images = []
      }
    } else if (!p.images) {
      p.images = []
    }
    if (typeof p.tags === "string") {
      try {
        p.tags = JSON.parse(p.tags)
      } catch {
        p.tags = []
      }
    } else if (!p.tags) {
      p.tags = []
    }
    return p
  }) as unknown as Property[]

  return <DashboardClient initialProperties={properties} dict={dict} />
}
