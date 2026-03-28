import { createBusiness } from "./actions"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function OnboardingPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if they already have a business
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()
  if (profile) {
    const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile.id).single()
    if (business) {
      redirect("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Crea tu Negocio</CardTitle>
          <CardDescription>
            Completa la información de tu emprendimiento para comenzar usar FinanzasSaaS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createBusiness} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="businessName">Nombre del negocio</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Mi Tiendita"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessCategory">Categoría</Label>
              <Input
                id="businessCategory"
                name="businessCategory"
                type="text"
                placeholder="Ropa, Comida, Accesorios..."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagramHandle">Usuario de Instagram (Opcional)</Label>
              <Input
                id="instagramHandle"
                name="instagramHandle"
                type="text"
                placeholder="@mitiendita_sv"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Input
                id="description"
                name="description"
                type="text"
                placeholder="Venta de ropa de segunda mano..."
              />
            </div>

            {searchParams?.message && (
              <p className="text-sm text-red-500 font-medium text-center">
                {searchParams.message}
              </p>
            )}

            <Button type="submit" className="w-full mt-2">
              Guardar y Continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
