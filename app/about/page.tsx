import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black font-inter">
      <header className="h-16 border-b-swiss border-black flex items-center px-6 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="font-black text-2xl tracking-tighter uppercase">GENEVA MAP</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-20 px-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black font-black uppercase text-[10px] tracking-[0.2em] mb-12 hover:bg-black hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour à la carte
        </Link>

        <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-12">
          À Propos
        </h1>

        <div className="space-y-8 border-l-4 border-black pl-8 py-2">
          <p className="text-xl font-bold leading-relaxed">
            Les données affichées ici proviennent directement du site <a href="https://fidp.ch" target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-4">fidp.ch</a>. Elles restent leur propriété exclusive.
          </p>
          <p className="text-xl font-bold leading-relaxed">
            J&apos;ai simplement récupéré ces informations pour concevoir cette carte, afin d&apos;offrir une meilleure vue d&apos;ensemble des propriétés de la fondation dans tout le canton de Genève.
          </p>
        </div>
      </main>
    </div>
  );
}
