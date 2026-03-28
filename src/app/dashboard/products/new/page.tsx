import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Button } from "@/components/ui"
import { createProduct } from "./actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewProductPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon" className="rounded-full">
             <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Producto</h1>
          <p className="text-sm text-gray-500">Agrega un nuevo producto a tu inventario</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={createProduct} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del producto</Label>
              <Input id="name" name="name" required placeholder="Camisa de lino" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría (Opcional)</Label>
              <Input id="category" name="category" placeholder="Ropa" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Input id="description" name="description" placeholder="Camisa manga corta de verano..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salePrice">Precio de Venta ($)</Label>
                <Input id="salePrice" name="salePrice" type="number" step="0.01" min="0" required placeholder="25.00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costPrice">Costo Unitario ($)</Label>
                <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" required placeholder="12.50" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">Unidades en stock (Inventario inicial)</Label>
              <Input id="stock" name="stock" type="number" required min="0" defaultValue="0" />
            </div>

            {searchParams?.error && (
               <p className="text-sm text-red-500 font-medium">Error: {searchParams.error}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <Link href="/dashboard/products">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit">Guardar Producto</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
