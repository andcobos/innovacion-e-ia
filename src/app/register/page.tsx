"use client";

import { useState, useTransition, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Button } from "@/components/ui"
import { signup } from "./actions"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error") || searchParams.get("message");

  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState(errorParam || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setSuccessMsg("¡Cuenta creada! Verifica tu correo electrónico y haz clic en el enlace para confirmar tu cuenta y poder iniciar sesión.");
        formElement.reset();
      }
    });
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-gradient-to-br from-brand-secondary to-brand-bg">
      <div className="w-full max-w-[420px] mb-8">
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="font-bold text-3xl font-serif text-brand-primary tracking-tight">FinanzasSaaS</span>
        </Link>
        <Card className="border-0 shadow-[0_8px_32px_rgba(255,127,127,0.12)]">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
            <CardDescription className="text-base text-brand-muted">
              Únete gratis y toma el control de tu negocio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" required placeholder="tu@correo.com" disabled={isPending} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" name="password" type="password" required placeholder="••••••••" minLength={6} disabled={isPending} />
              </div>

              {errorMsg && (
                <div className="p-3 mt-1 bg-red-50 border border-red-100 rounded-[12px]">
                  <p className="text-[13px] text-brand-danger font-semibold">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="p-4 mt-1 bg-[#D1FAE5] border border-[#A7F3D0] rounded-[12px] animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-[#065F46] font-semibold leading-relaxed">{successMsg}</p>
                </div>
              )}

              <Button type="submit" className="w-full mt-2 text-base" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</>
                ) : (
                  "Crear Cuenta Gratis"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-brand-muted">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-brand-primary hover:underline font-bold">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center"><Loader2 className="animate-spin text-brand-primary" /></div>}>
      <RegisterFormContent />
    </Suspense>
  )
}
