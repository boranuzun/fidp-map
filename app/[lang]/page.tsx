import { db } from "@/lib/db"
import DashboardClient from "@/components/DashboardClient"
import { type Property } from "@/components/PropertyMap"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export const dynamic = "force-dynamic"

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const rs = await db.execute("SELECT * FROM property")

  // Explicitly map rows to Property objects
  const properties = rs.rows.map((row) => {
    const p: Property = {
      id: row.id as number,
      name: row.name as string | null,
      fondation: row.fondation as string | null,
      localite: row.localite as string | null,
      zip: row.zip as string | null,
      address1: row.address1 as string,
      address2: row.address2 as string | null,
      units: row.units as number | null,
      group: row.group as string | null,
      url: row.url as string,
      lat: row.lat as number | null,
      lng: row.lng as number | null,
      geometry: row.geometry as string | null,
      construction_year: row.construction_year as number | null,
      scraped_at: row.scraped_at as string,
      images: [],
      tags: [],
    }

    // Parse JSON columns
    if (typeof row.images === "string") {
      try {
        p.images = JSON.parse(row.images)
      } catch {
        p.images = []
      }
    } else {
      p.images = (row.images as unknown as string[]) || []
    }

    if (typeof row.tags === "string") {
      try {
        p.tags = JSON.parse(row.tags)
      } catch {
        p.tags = []
      }
    } else {
      p.tags = (row.tags as unknown as string[]) || []
    }

    return p
  })

  return <DashboardClient initialProperties={properties} dict={dict} />
}
