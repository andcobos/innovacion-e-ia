import { login } from "./actions"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui"
import Link from "next/link"

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu correo para acceder a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="grid gap-4">
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
              <Input id="password" name="password" type="password" required />
            </div>
            {searchParams?.message && (
              <p className="text-sm text-red-500 font-medium">
                {searchParams.message}
              </p>
            )}
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="underline text-blue-600 hover:text-blue-800">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
