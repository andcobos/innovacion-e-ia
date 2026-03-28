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
    <div className="flex min-h-screen w-full bg-gray-50 flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white px-4 py-6">
        <div className="flex h-14 items-center mb-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-xl text-blue-600 font-bold">FinanzasSaaS</span>
          </Link>
        </div>
        <nav className="grid gap-2 text-sm font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/products"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
          >
            <Package className="h-4 w-4" />
            Productos
          </Link>
          <Link
            href="/dashboard/sales"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
          >
            <ShoppingCart className="h-4 w-4" />
            Ventas
          </Link>
          <Link
            href="/dashboard/expenses"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
          >
            <ReceiptText className="h-4 w-4" />
            Gastos
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
          >
            <User className="h-4 w-4" />
            Perfil & Negocio
          </Link>
        </nav>
        <div className="mt-auto pt-6 border-t flex flex-col gap-2">
          <p className="text-sm font-medium px-3 truncate">{business.business_name}</p>
          <p className="text-xs text-gray-500 px-3 truncate">{profile.full_name}</p>
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full">
        {/* Mobile Header (simplified for prototype) */}
        <header className="flex md:hidden h-14 items-center justify-between border-b bg-white px-4">
          <Link href="/dashboard" className="font-semibold text-blue-600">
            FinanzasSaaS
          </Link>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">Salir</Button>
          </form>
        </header>

        {/* Mobile Nav Links (simplified bottom bar or just top links for MVP) */}
        <div className="md:hidden flex overflow-x-auto border-b bg-white px-4 py-2 gap-4 text-sm font-medium">
            <Link href="/dashboard" className="whitespace-nowrap">Dashboard</Link>
            <Link href="/dashboard/products" className="whitespace-nowrap">Productos</Link>
            <Link href="/dashboard/sales" className="whitespace-nowrap">Ventas</Link>
            <Link href="/dashboard/expenses" className="whitespace-nowrap">Gastos</Link>
            <Link href="/dashboard/profile" className="whitespace-nowrap">Perfil</Link>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
