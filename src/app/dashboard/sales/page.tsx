import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { PlusCircle } from "lucide-react"

export default async function SalesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile?.id).single()

  const { data: sales } = await supabase
    .from("sales")
    .select(`
      *,
      products ( name )
    `)
    .eq("business_id", business?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight text-brand-text font-serif">Ventas</h1>
        <Link href="/dashboard/sales/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Nueva Venta</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b border-brand-border">
          <CardTitle className="text-xl">Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0 sm:px-6">
          {sales?.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 mt-6 text-center text-brand-muted bg-brand-secondary/30 rounded-[12px] border border-dashed border-brand-border">
               <div className="p-3 bg-white rounded-full mb-3 shadow-[0_4px_12px_rgba(255,127,127,0.05)]">
                 <ReceiptIcon className="h-8 w-8 text-brand-primary" />
               </div>
               <p className="text-lg font-bold text-brand-text mb-1 font-serif">Aún no tienes ventas registradas</p>
               <p className="text-sm">Registra tu primera venta para verla aquí.</p>
             </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left text-brand-muted">
                <thead className="text-xs text-brand-text uppercase bg-brand-secondary/50 border-b border-brand-border rounded-t-lg">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold rounded-tl-lg">Fecha</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Producto</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">Cantidad</th>
                    <th scope="col" className="px-6 py-4 font-semibold hidden sm:table-cell">Precio Unit.</th>
                    <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Descuento</th>
                    <th scope="col" className="px-6 py-4 font-bold text-brand-text rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.map((sale) => (
                    <tr key={sale.id} className="bg-white border-b border-brand-border hover:bg-brand-secondary/30 transition-colors">
                      <td className="px-6 py-4">{new Date(sale.sale_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-brand-text">
                         {sale.products?.name || "Producto Eliminado"}
                      </td>
                      <td className="px-6 py-4 text-center font-mono">{sale.quantity}</td>
                      <td className="px-6 py-4 hidden sm:table-cell font-mono">${sale.unit_sale_price}</td>
                      <td className="px-6 py-4 hidden md:table-cell font-mono text-brand-danger">${sale.discount_amount}</td>
                      <td className="px-6 py-4 font-bold font-mono text-brand-success">${sale.total_sale_amount}</td>
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

function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17V7" />
    </svg>
  )
}
