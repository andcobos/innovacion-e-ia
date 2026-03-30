"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split("@")[0],
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")

  // Detenemos la redireccion para mostrar feedback interactivamente
  return { success: true }
}
