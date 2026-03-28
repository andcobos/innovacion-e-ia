"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  // Get current user business
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile?.id).single()

  if (!business) {
    return redirect("/dashboard?error=BusinessNotFound")
  }

  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const salePrice = parseFloat(formData.get("salePrice") as string)
  const costPrice = parseFloat(formData.get("costPrice") as string)
  const stock = parseInt(formData.get("stock") as string)

  const { error } = await supabase.from("products").insert({
    business_id: business.id,
    name,
    category: category || null,
    description: description || null,
    sale_price: salePrice,
    cost_price: costPrice,
    stock,
    is_active: true
  })

  if (error) {
    return redirect(`/dashboard/products/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/dashboard/products")
  redirect("/dashboard/products")
}
