import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "@/components/ui"
import { seedData } from "./actions"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("*").eq("profile_id", profile?.id).single()

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-[28px] font-bold tracking-tight text-brand-text font-serif">Perfil y Configuración</h1>

      <Card>
        <CardHeader className="border-b border-brand-border pb-4">
          <CardTitle className="text-xl">Datos del Emprendedor</CardTitle>
          <CardDescription>Información personal asociada a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
             <div className="bg-brand-secondary/30 p-4 rounded-[12px] border border-brand-border border-dashed">
                <p className="text-sm font-semibold text-brand-muted mb-1 uppercase tracking-wider text-[11px]">Nombre Completo</p>
                <p className="text-base font-medium text-brand-text">{profile?.full_name}</p>
             </div>
             <div className="bg-brand-secondary/30 p-4 rounded-[12px] border border-brand-border border-dashed">
                <p className="text-sm font-semibold text-brand-muted mb-1 uppercase tracking-wider text-[11px]">Correo Electrónico</p>
                <p className="text-base font-medium text-brand-text">{user?.email}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-brand-border pb-4">
          <CardTitle className="text-xl">Datos del Negocio</CardTitle>
          <CardDescription>Información del emprendimiento configurada durante el onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
             <div className="bg-brand-secondary/30 p-4 rounded-[12px] border border-brand-border border-dashed">
                <p className="text-sm font-semibold text-brand-muted mb-1 uppercase tracking-wider text-[11px]">Nombre del Negocio</p>
                <p className="text-base font-medium text-brand-text font-serif">{business?.business_name}</p>
             </div>
             <div className="bg-brand-secondary/30 p-4 rounded-[12px] border border-brand-border border-dashed">
                <p className="text-sm font-semibold text-brand-muted mb-1 uppercase tracking-wider text-[11px]">Categoría</p>
                <p className="text-base font-medium text-brand-text">{business?.business_category}</p>
             </div>
             <div className="bg-brand-secondary/30 p-4 rounded-[12px] border border-brand-border border-dashed md:col-span-2">
                <p className="text-sm font-semibold text-brand-muted mb-1 uppercase tracking-wider text-[11px]">Instagram</p>
                <p className="text-base font-medium text-brand-text">{business?.instagram_handle || "No definido"}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-orange-900 text-xl">Generar Datos de Prueba</CardTitle>
          <CardDescription className="text-orange-800/80">
            ¿Tu dashboard está vacío? Usa este botón para auto-generar productos, ventas y gastos de ejemplo, 
            ideal para demostraciones de la clase de Innovación e IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={seedData}>
             <input type="hidden" name="businessId" value={business?.id} />
             <Button type="submit" variant="destructive" className="bg-orange-500 hover:bg-orange-600 hover:shadow-[0_8px_20px_rgba(249,115,22,0.35)]">
               Generar Datos Demo
             </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
