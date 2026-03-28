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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ventas</h1>
        <Link href="/dashboard/sales/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Venta</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales?.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
               <ReceiptIcon className="h-10 w-10 text-gray-400 mb-2" />
               <p className="text-lg font-medium">Aún no tienes ventas registradas</p>
               <p className="text-sm">Registra tu primera venta para verla aquí.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th scope="col" className="px-4 py-3">Fecha</th>
                    <th scope="col" className="px-4 py-3">Producto</th>
                    <th scope="col" className="px-4 py-3 text-center">Cantidad</th>
                    <th scope="col" className="px-4 py-3 hidden sm:table-cell">Precio Unit.</th>
                    <th scope="col" className="px-4 py-3 hidden md:table-cell">Descuento</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.map((sale) => (
                    <tr key={sale.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{new Date(sale.sale_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                         {/* @ts-ignore - Supabase nested type issue workaround for prototype */}
                         {sale.products?.name || "Producto Eliminado"}
                      </td>
                      <td className="px-4 py-3 text-center">{sale.quantity}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">${sale.unit_sale_price}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-red-500">${sale.discount_amount}</td>
                      <td className="px-4 py-3 font-bold text-green-600">${sale.total_sale_amount}</td>
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
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17V7" />
    </svg>
  )
}
