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
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Perfil y Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Emprendedor</CardTitle>
          <CardDescription>Información personal asociada a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
             <div>
                <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                <p className="text-base font-medium">{profile?.full_name}</p>
             </div>
             <div>
                <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                <p className="text-base font-medium">{user?.email}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Negocio</CardTitle>
          <CardDescription>Información del emprendimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
             <div>
                <p className="text-sm font-medium text-gray-500">Nombre del Negocio</p>
                <p className="text-base font-medium">{business?.business_name}</p>
             </div>
             <div>
                <p className="text-sm font-medium text-gray-500">Categoría</p>
                <p className="text-base font-medium">{business?.business_category}</p>
             </div>
             <div>
                <p className="text-sm font-medium text-gray-500">Instagram</p>
                <p className="text-base font-medium">{business?.instagram_handle || "No definido"}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">Modo Académico: Generar Datos de Prueba</CardTitle>
          <CardDescription className="text-orange-800">
            ¿Tu dashboard está vacío? Usa este botón para auto-generar productos, ventas y gastos de ejemplo, 
            ideal para demostraciones de la clase de Innovación e IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={seedData}>
             <input type="hidden" name="businessId" value={business?.id} />
             <Button type="submit" variant="destructive" className="bg-orange-600 hover:bg-orange-700">
               Generar Datos Demo
             </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
