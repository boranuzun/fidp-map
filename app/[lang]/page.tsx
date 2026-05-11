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
    const p: any = {
      id: row.id,
      name: row.name,
      fondation: row.fondation,
      localite: row.localite,
      zip: row.zip,
      address1: row.address1,
      address2: row.address2,
      units: row.units,
      group: row.group,
      url: row.url,
      lat: row.lat,
      lng: row.lng,
      geometry: row.geometry,
      construction_year: row.construction_year,
      scraped_at: row.scraped_at,
    }

    // Parse JSON columns
    if (typeof row.images === "string") {
      try {
        p.images = JSON.parse(row.images)
      } catch {
        p.images = []
      }
    } else {
      p.images = (row.images as string[]) || []
    }

    if (typeof row.tags === "string") {
      try {
        p.tags = JSON.parse(row.tags)
      } catch {
        p.tags = []
      }
    } else {
      p.tags = (row.tags as string[]) || []
    }

    return p as Property
  })

  return <DashboardClient initialProperties={properties} dict={dict} />
}
