import Link from "next/link"
import { Button } from "@/components/ui"
import { Sparkles, PieChart, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-6 lg:px-14 h-20 flex items-center justify-between border-b border-brand-border bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <span className="font-bold text-2xl font-serif text-brand-primary tracking-tight">FinanzasSaaS</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Iniciar Sesión</Button>
          </Link>
          <Link href="/register">
            <Button>Regístrate Gratis</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full py-20 md:py-32 lg:py-48 flex justify-center bg-gradient-to-b from-brand-secondary via-brand-bg to-white relative overflow-hidden">
          
          {/* Decorative shapes */}
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl" />

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-border shadow-[0_4px_12px_rgba(255,127,127,0.06)] text-sm font-medium text-brand-primary">
                <Sparkles className="w-4 h-4" /> 
                Ideal para emprendedores en Instagram
              </div>
              
              <h1 className="text-4xl font-bold font-serif tracking-tight sm:text-5xl md:text-6xl text-brand-text leading-[1.15]">
                Tu negocio, <span className="text-brand-primary italic">claro y simple.</span>
              </h1>
              
              <p className="mx-auto max-w-[700px] text-brand-muted md:text-xl font-sans leading-relaxed">
                Controla tus ventas, analiza tus gastos y descubre tu rentabilidad real con nuestra plataforma intuitiva, diseñada para no-financieros.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-base font-bold shadow-[0_8px_20px_rgba(255,127,127,0.25)] hover:-translate-y-1">
                    Crear cuenta gratis
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full text-base font-bold bg-white">
                    Ver demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32 flex justify-center bg-white border-t border-brand-border">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-16 font-serif text-brand-text">
               Por qué FinanzasSaaS
            </h2>
            <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-brand-secondary rounded-[16px] shadow-[0_4px_24px_rgba(255,127,127,0.08)]">
                  <PieChart className="h-8 w-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold font-serif text-brand-text">Métricas Claras</h3>
                <p className="text-brand-muted text-sm leading-relaxed">
                  Calculamos automáticamente tus márgenes, costo de ventas y utilidad neta para que siempre sepas cuánto ganas realmente.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-[#F5F3FF] rounded-[16px] shadow-[0_4px_24px_rgba(167,139,250,0.08)]">
                  <Sparkles className="h-8 w-8 text-brand-accent" />
                </div>
                <h3 className="text-xl font-bold font-serif text-brand-text">Inteligencia Artificial</h3>
                <p className="text-brand-muted text-sm leading-relaxed">
                  Sistema predictivo que te ayuda a categorizar gastos e identifica fugas de dinero (como excesos en empaques o envío).
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-emerald-50 rounded-[16px] shadow-[0_4px_24px_rgba(52,211,153,0.08)]">
                  <ShieldCheck className="h-8 w-8 text-brand-success" />
                </div>
                <h3 className="text-xl font-bold font-serif text-brand-text">Fácil y Seguro</h3>
                <p className="text-brand-muted text-sm leading-relaxed">
                  Tus datos están protegidos en la nube. Olvídate de los cuadernos y hojas de Excel complicadas que siempre se pierden.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full py-8 text-center bg-brand-bg border-t border-brand-border text-sm text-brand-muted">
         Prototipo Académico - ESEN Innovación e IA © 2026. Diseñado con ❤️ para emprendedores.
      </footer>
    </div>
  )
}
