"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function createBusiness(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single()
  if (!profile) {
    // Should not happen if trigger/signup flow handled it, but fallback just in case
    return redirect("/onboarding?message=No se encontró tu perfil")
  }

  const businessName = formData.get("businessName") as string
  const businessCategory = formData.get("businessCategory") as string
  const instagramHandle = formData.get("instagramHandle") as string
  const description = formData.get("description") as string

  const { error } = await supabase.from("businesses").insert({
    profile_id: profile.id,
    business_name: businessName,
    business_category: businessCategory,
    instagram_handle: instagramHandle || null,
    description: description || null,
  })

  if (error) {
    return redirect("/onboarding?message=Error al crear el negocio: " + error.message)
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
