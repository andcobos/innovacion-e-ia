import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Button } from "@/components/ui"
import { login } from "./actions"
import Link from "next/link"

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-gradient-to-br from-brand-secondary to-brand-bg">
      <div className="w-full max-w-[420px] mb-8">
        <Link href="/" className="flex items-center justify-center mb-8">
           <span className="font-bold text-3xl font-serif text-brand-primary tracking-tight">FinanzasSaaS</span>
        </Link>
        <Card className="border-0 shadow-[0_8px_32px_rgba(255,127,127,0.12)]">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
            <CardDescription className="text-base text-brand-muted">
              Ingresa a tu cuenta para gestionar tu negocio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" required placeholder="tu@correo.com" />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="#" className="text-sm text-brand-primary font-medium hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" required placeholder="••••••••" />
              </div>
              
              {searchParams?.error && (
                <div className="p-3 mt-1 bg-red-50 border border-red-100 rounded-[12px]">
                  <p className="text-[13px] text-brand-danger font-semibold">{searchParams.error}</p>
                </div>
              )}

              <Button type="submit" className="w-full mt-2 text-base">Iniciar Sesión</Button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-brand-muted">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/register" className="text-brand-primary hover:underline font-bold">
                Regístrate gratis
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
