import Link from "next/link"
import { Button } from "@/components/ui"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center shadow-sm bg-white">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl text-blue-600">FinanzasSaaS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 mt-2" href="/login">
            Iniciar Sesión
          </Link>
          <Link href="/register">
            <Button size="sm">Comenzar gratis</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Gestión financiera hecha <span className="text-blue-600">simple</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Para emprendedores en Instagram. Entiende tus ganancias reales, controla tu inventario y analiza tus gastos sin complicaciones.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">Crear cuenta gratis</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500">© 2024 FinanzasSaaS. Proyecto Académico.</p>
      </footer>
    </div>
  )
}
