import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Button } from "@/components/ui"
import { createSale } from "./actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function NewSalePage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // Get products for the dropdown
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile?.id).single()

  const { data: products } = await supabase
    .from("products")
    .select("id, name, sale_price, stock")
    .eq("business_id", business?.id)
    .eq("is_active", true)
    .order("name")

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sales">
          <Button variant="ghost" size="icon" className="rounded-full">
             <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registar Venta</h1>
          <p className="text-sm text-gray-500">Ingresa la información de la nueva venta</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {products && products.length > 0 ? (
            <form action={createSale} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="productId">Producto Vendido</Label>
                <select 
                  id="productId" 
                  name="productId" 
                  required 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <option value="" disabled selected>Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock} - ${product.sale_price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">Precio de Venta Unitario ($)</Label>
                  <Input id="unitPrice" name="unitPrice" type="number" step="0.01" min="0" required placeholder="Precio acordado" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discount">Descuento Total Aplicado ($)</Label>
                <Input id="discount" name="discount" type="number" step="0.01" min="0" defaultValue="0" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="saleDate">Fecha de Venta</Label>
                <Input id="saleDate" name="saleDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Input id="notes" name="notes" placeholder="Ej. Cliente solicitó empaque de regalo" />
              </div>

              {searchParams?.error && (
                <p className="text-sm text-red-500 font-medium">Error: {searchParams.error}</p>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <Link href="/dashboard/sales">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit">Registrar Venta</Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="mb-4">No tienes productos activos para vender.</p>
              <Link href="/dashboard/products/new">
                <Button>Crear producto primero</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
