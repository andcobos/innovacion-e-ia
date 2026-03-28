import { signup } from "./actions"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui"
import Link from "next/link"

export default async function RegisterPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para comenzar a gestionar tu negocio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@ejemplo.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            {searchParams?.message && (
              <p className="text-sm text-red-500 font-medium text-center">
                {searchParams.message}
              </p>
            )}
            <Button type="submit" className="w-full">
              Crear Cuenta
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="underline text-blue-600 hover:text-blue-800">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
