import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/i18n-config';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const description1Parts = dict.about.description1.split('{link}');

  return (
    <div 
      data-testid="about-page-wrapper"
      className="h-screen w-screen bg-background text-foreground font-inter p-6 md:p-12 overflow-hidden flex flex-col selection:bg-blue-100 dark:selection:bg-blue-900"
    >
      <main className="max-w-3xl mx-auto flex-1 flex flex-col justify-between">
        {/* Navigation */}
        <div className="pt-2">
          <Link 
            href={`/${lang}`} 
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 transition-colors"
          >
            <span className="text-base">←</span> {dict.about.backToMap}
          </Link>
        </div>

        {/* Hero Section */}
        <section className="space-y-6 md:space-y-8">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85]">
            {dict.about.title}
          </h1>
          
          <div className="space-y-4 md:space-y-6 text-lg md:text-xl font-medium leading-tight tracking-tight max-w-2xl text-balance">
            <p>
              {description1Parts[0]}
              <a
                href="https://fidp.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-4 decoration-2 hover:text-blue-800 transition-colors"
              >
                {dict.about.linkText}
              </a>
              {description1Parts[1]}
            </p>
            <p>
              {dict.about.description2}
            </p>
          </div>
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 py-8 border-t border-border">
          <section className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {dict.about.howItWorks}
            </h2>
            <p className="text-sm font-medium leading-snug text-muted-foreground">
              {dict.about.howItWorksDesc}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {dict.about.opensource}
            </h2>
            <p className="text-sm font-medium leading-snug text-muted-foreground">
              {dict.about.opensourceDesc}
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="pb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
          © {new Date().getFullYear()} {dict.common.title}
        </footer>
      </main>
    </div>
  );
}
