import Link from "next/link"
import { getDictionary } from "@/lib/get-dictionary"
import { Locale } from "@/i18n-config"

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  const description1Parts = dict.about.description1.split("{link}")

  return (
    <div
      data-testid="about-page-wrapper"
      className="font-inter flex h-screen w-screen flex-col overflow-hidden bg-background p-6 text-foreground selection:bg-blue-100 md:p-12 dark:selection:bg-blue-900"
    >
      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-between">
        {/* Navigation */}
        <div className="pt-2">
          <Link
            href={`/${lang}`}
            className="group inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-blue-600"
          >
            <span className="text-base">←</span> {dict.about.backToMap}
          </Link>
        </div>

        {/* Hero Section */}
        <section className="space-y-6 md:space-y-8">
          <h1 className="text-4xl leading-[0.85] font-black tracking-tighter uppercase md:text-6xl">
            {dict.about.title}
          </h1>

          <div className="max-w-2xl space-y-4 text-lg leading-tight font-medium tracking-tight text-balance md:space-y-6 md:text-xl">
            <p>
              {description1Parts[0]}
              <a
                href="https://fidp.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline decoration-2 underline-offset-4 transition-colors hover:text-blue-800"
              >
                {dict.about.linkText}
              </a>
              {description1Parts[1]}
            </p>
            <p>{dict.about.description2}</p>
          </div>
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-8 border-t border-border py-8 md:grid-cols-2 md:gap-12">
          <section className="space-y-3">
            <h2 className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">
              {dict.about.howItWorks}
            </h2>
            <p className="text-sm leading-snug font-medium text-muted-foreground">
              {dict.about.howItWorksDesc}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">
              {dict.about.opensource}
            </h2>
            <p className="text-sm leading-snug font-medium text-muted-foreground">
              {dict.about.opensourceDesc}
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="pb-4 text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase">
          © {new Date().getFullYear()} {dict.common.title}
        </footer>
      </main>
    </div>
  )
}
