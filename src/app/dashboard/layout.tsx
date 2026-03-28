import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingCart, ReceiptText, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui"
import { logout } from "./actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Protect all dashboard routes
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Ensure they have a business
  const { data: profile } = await supabase.from("profiles").select("id, full_name").eq("user_id", user.id).single()
  if (!profile) {
    redirect("/onboarding")
  }

  const { data: business } = await supabase.from("businesses").select("*").eq("profile_id", profile.id).single()
  
  if (!business) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen w-full bg-brand-bg flex-col md:flex-row font-sans">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-[#FFF0F3] to-[#F5F3FF] border-r border-brand-border px-6 py-8">
        <div className="flex flex-col mb-10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-3xl text-brand-primary font-bold font-serif tracking-tight">FinanzasSaaS</span>
          </Link>
          <span className="text-[13px] text-brand-muted mt-1 font-medium">Tu negocio, claro y simple</span>
        </div>
        <nav className="flex flex-col gap-2 text-sm font-semibold">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-[12px] px-4 py-3 text-brand-muted transition-all hover:text-brand-primary hover:bg-white hover:shadow-[0_4px_12px_rgba(255,127,127,0.05)]"
          >
            <div className="p-1.5 rounded-lg bg-transparent group-hover:bg-brand-secondary transition-colors text-inherit">
               <LayoutDashboard className="h-5 w-5" />
            </div>
            Dashboard
          </Link>
          <Link
            href="/dashboard/products"
            className="flex items-center gap-3 rounded-[12px] px-4 py-3 text-brand-muted transition-all hover:text-brand-primary hover:bg-white hover:shadow-[0_4px_12px_rgba(255,127,127,0.05)]"
          >
            <div className="p-1.5 rounded-lg bg-transparent transition-colors text-inherit">
              <Package className="h-5 w-5" />
            </div>
            Productos
          </Link>
          <Link
            href="/dashboard/sales"
            className="flex items-center gap-3 rounded-[12px] px-4 py-3 text-brand-muted transition-all hover:text-brand-primary hover:bg-white hover:shadow-[0_4px_12px_rgba(255,127,127,0.05)]"
          >
            <div className="p-1.5 rounded-lg bg-transparent transition-colors text-inherit">
              <ShoppingCart className="h-5 w-5" />
            </div>
            Ventas
          </Link>
          <Link
            href="/dashboard/expenses"
            className="flex items-center gap-3 rounded-[12px] px-4 py-3 text-brand-muted transition-all hover:text-brand-primary hover:bg-white hover:shadow-[0_4px_12px_rgba(255,127,127,0.05)]"
          >
            <div className="p-1.5 rounded-lg bg-transparent transition-colors text-inherit">
              <ReceiptText className="h-5 w-5" />
            </div>
            Gastos
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-[12px] px-4 py-3 text-brand-muted transition-all hover:text-brand-primary hover:bg-white hover:shadow-[0_4px_12px_rgba(255,127,127,0.05)]"
          >
            <div className="p-1.5 rounded-lg bg-transparent transition-colors text-inherit">
              <User className="h-5 w-5" />
            </div>
            Perfil
          </Link>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/50 flex flex-col gap-3">
          <div className="px-2">
            <p className="font-bold text-brand-text truncate font-serif">{business.business_name}</p>
            <p className="text-xs text-brand-muted truncate mt-0.5">{profile.full_name}</p>
          </div>
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start text-brand-danger hover:text-white hover:bg-brand-primary rounded-[12px]" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full pb-20 md:pb-0">
        
        {/* Mobile Header */}
        <header className="flex md:hidden h-16 items-center justify-between border-b border-brand-border bg-white px-6">
          <Link href="/dashboard" className="font-bold font-serif text-xl text-brand-primary">
            FinanzasSaaS
          </Link>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" className="text-brand-danger">Salir</Button>
          </form>
        </header>

        <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-brand-border flex items-center justify-around px-2 shadow-[0_-4px_24px_rgba(255,127,127,0.05)] z-50">
            <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 text-brand-muted hover:text-brand-primary transition-colors">
               <LayoutDashboard className="h-5 w-5" />
               <span className="text-[10px] font-semibold">Inicio</span>
            </Link>
            <Link href="/dashboard/products" className="flex flex-col items-center gap-1 p-2 text-brand-muted hover:text-brand-primary transition-colors">
               <Package className="h-5 w-5" />
               <span className="text-[10px] font-semibold">Prods</span>
            </Link>
            <Link href="/dashboard/sales" className="flex flex-col items-center gap-1 p-2 text-brand-muted hover:text-brand-primary transition-colors">
               <ShoppingCart className="h-5 w-5" />
               <span className="text-[10px] font-semibold">Ventas</span>
            </Link>
            <Link href="/dashboard/expenses" className="flex flex-col items-center gap-1 p-2 text-brand-muted hover:text-brand-primary transition-colors">
               <ReceiptText className="h-5 w-5" />
               <span className="text-[10px] font-semibold">Gastos</span>
            </Link>
            <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 p-2 text-brand-muted hover:text-brand-primary transition-colors">
               <User className="h-5 w-5" />
               <span className="text-[10px] font-semibold">Perfil</span>
            </Link>
        </div>
      </div>
    </div>
  )
}
