import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Button } from "@/components/ui"
import { createSale } from "./actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export default async function NewSalePage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
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
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sales">
          <Button variant="ghost" size="icon" className="rounded-full bg-white border border-brand-border shadow-sm hover:translate-y-0">
             <ArrowLeft className="h-5 w-5 text-brand-text" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-brand-text font-serif">Registar Venta</h1>
          <p className="text-sm text-brand-muted font-sans mt-0.5">Ingresa la información de la nueva venta</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-8">
          {products && products.length > 0 ? (
            <form action={createSale} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="productId">Producto Vendido</Label>
                <select 
                  id="productId" 
                  name="productId" 
                  required 
                  className="flex h-[48px] w-full rounded-[12px] border border-brand-border bg-white px-4 py-2 text-sm text-brand-text focus-visible:outline-none focus-visible:border-2 focus-visible:border-brand-primary focus-visible:ring-0 transition-all font-sans"
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
                  <Label htmlFor="unitPrice">Precio de Venta ($)</Label>
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
                <div className="p-3 bg-red-50 border border-red-100 rounded-[12px]">
                  <p className="text-sm text-brand-danger font-semibold">Error: {searchParams.error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-brand-border">
                <Link href="/dashboard/sales">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit">Registrar Venta</Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 px-6">
              <div className="mx-auto w-16 h-16 bg-brand-secondary/50 flex items-center justify-center rounded-full mb-4">
                 <PackageIcon className="h-8 w-8 text-brand-primary" />
              </div>
              <p className="mb-6 text-brand-text font-medium font-sans">No tienes productos activos para vender.</p>
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
