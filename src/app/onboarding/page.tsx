import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Button } from "@/components/ui"
import { createBusiness } from "./actions"

export default async function OnboardingPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Check if they already completed onboarding
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single()
  if (profile) {
    const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile.id).single()
    if (business) {
        redirect("/dashboard")
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-gradient-to-br from-[#F5F3FF] via-brand-bg to-[#FFF0F3]">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
           <span className="font-bold text-3xl font-serif text-brand-primary tracking-tight">FinanzasSaaS</span>
        </div>
        
        <Card className="border-0 shadow-[0_8px_40px_rgba(167,139,250,0.15)]">
          <CardHeader className="space-y-2 text-center pb-8 border-b border-brand-border">
            <CardTitle className="text-2xl">Casi listo para empezar</CardTitle>
            <CardDescription className="text-base text-brand-muted">
              Necesitamos conocer un poco más sobre ti y tu negocio para configurar tu espacio.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form action={createBusiness} className="grid gap-6">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-serif text-brand-primary uppercase tracking-wider">1. Sobre ti</h3>
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Tu Nombre Completo</Label>
                  <Input id="fullName" name="fullName" required placeholder="Ej. María Pérez" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-brand-border">
                <h3 className="text-sm font-bold font-serif text-brand-primary uppercase tracking-wider">2. Sobre tu negocio</h3>
                <div className="grid gap-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input id="businessName" name="businessName" required placeholder="Ej. Trendy Boutique" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="businessCategory">¿Qué vendes principalmente?</Label>
                  <select 
                    id="businessCategory" 
                    name="businessCategory" 
                    required 
                    className="flex h-[48px] w-full rounded-[12px] border border-brand-border bg-white px-4 py-2 text-sm text-brand-text focus-visible:outline-none focus-visible:border-2 focus-visible:border-brand-primary focus-visible:ring-0 transition-all font-sans"
                    defaultValue=""
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    <option value="Ropa y Accesorios">Ropa y Accesorios</option>
                    <option value="Comida y Postres">Comida y Postres</option>
                    <option value="Belleza y Cuidado Personal">Belleza y Cuidado Personal</option>
                    <option value="Hogar y Decoración">Hogar y Decoración</option>
                    <option value="Servicios Profesionales">Servicios Profesionales</option>
                    <option value="Electrónica y Gadgets">Electrónica y Gadgets</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="instagramHandle">Usuario de Instagram (Opcional)</Label>
                  <Input id="instagramHandle" name="instagramHandle" placeholder="@tunegocio" />
                </div>
              </div>

              {searchParams?.error && (
                 <div className="p-3 bg-red-50 border border-red-100 rounded-[12px]">
                   <p className="text-sm text-brand-danger font-semibold">{searchParams.error}</p>
                 </div>
              )}

              <Button type="submit" className="w-full mt-4 text-base">Ir a mi Dashboard</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
