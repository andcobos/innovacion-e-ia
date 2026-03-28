import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { PlusCircle } from "lucide-react"

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile?.id).single()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", business?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight text-brand-text font-serif">Productos</h1>
        <Link href="/dashboard/products/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b border-brand-border">
          <CardTitle className="text-xl">Inventario</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0 sm:px-6">
          {products?.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 mt-6 text-center text-brand-muted bg-brand-secondary/30 rounded-[12px] border border-dashed border-brand-border">
               <div className="p-3 bg-white rounded-full mb-3 shadow-[0_4px_12px_rgba(255,127,127,0.05)]">
                 <PackageIcon className="h-8 w-8 text-brand-primary" />
               </div>
               <p className="text-lg font-bold text-brand-text mb-1 font-serif">No tienes productos aún</p>
               <p className="text-sm">Agrega tu primer producto para empezar a gestionar tu inventario.</p>
             </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left text-brand-muted">
                <thead className="text-xs text-brand-text uppercase bg-brand-secondary/50 border-b border-brand-border rounded-t-lg">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold rounded-tl-lg">Nombre</th>
                    <th scope="col" className="px-6 py-4 font-semibold hidden sm:table-cell">Categoría</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Precio Venta</th>
                    <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Costo Unit.</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">Stock</th>
                    <th scope="col" className="px-6 py-4 font-semibold rounded-tr-lg">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product.id} className="bg-white border-b border-brand-border hover:bg-brand-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-brand-text">{product.name}</td>
                      <td className="px-6 py-4 hidden sm:table-cell">{product.category || "-"}</td>
                      <td className="px-6 py-4 font-mono font-bold text-brand-text">${product.sale_price}</td>
                      <td className="px-6 py-4 hidden md:table-cell font-mono">${product.cost_price}</td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold uppercase tracking-wider ${product.stock <= 5 ? "bg-red-50 text-brand-danger border border-red-100" : "bg-emerald-50 text-brand-success border border-emerald-100"}`}>
                           {product.stock} unids.
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold uppercase tracking-wider ${product.is_active ? "bg-emerald-50 text-brand-success border border-emerald-100" : "bg-brand-secondary/50 text-brand-muted border border-brand-border"}`}>
                          {product.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}
