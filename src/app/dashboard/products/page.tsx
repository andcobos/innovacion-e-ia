import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { PlusCircle, Search } from "lucide-react"

export default async function ProductsPage() {
  const supabase = await createClient()

  // Get current user business_id
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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Productos</h1>
        <Link href="/dashboard/products/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          {products?.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
               <PackageIcon className="h-10 w-10 text-gray-400 mb-2" />
               <p className="text-lg font-medium">No tienes productos aún</p>
               <p className="text-sm">Agrega tu primer producto para empezar a gestionar tu inventario.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th scope="col" className="px-4 py-3">Nombre</th>
                    <th scope="col" className="px-4 py-3 hidden sm:table-cell">Categoría</th>
                    <th scope="col" className="px-4 py-3">Precio Venta</th>
                    <th scope="col" className="px-4 py-3 hidden md:table-cell">Costo Unitario</th>
                    <th scope="col" className="px-4 py-3">Stock</th>
                    <th scope="col" className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{product.category || "-"}</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">${product.sale_price}</td>
                      <td className="px-4 py-3 hidden md:table-cell">${product.cost_price}</td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock <= 5 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                           {product.stock} unids.
                         </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
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
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}
