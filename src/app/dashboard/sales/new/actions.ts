"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function createSale(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile?.id).single()

  if (!business) {
    return redirect("/dashboard?error=BusinessNotFound")
  }

  const productId = formData.get("productId") as string
  const quantity = parseInt(formData.get("quantity") as string)
  const unitPrice = parseFloat(formData.get("unitPrice") as string)
  const discount = parseFloat(formData.get("discount") as string)
  const saleDate = formData.get("saleDate") as string
  const notes = formData.get("notes") as string

  // Calculate total
  const totalSaleAmount = (quantity * unitPrice) - discount

  // Validate stock
  const { data: product } = await supabase.from("products").select("stock").eq("id", productId).single()
  if (!product || product.stock < quantity) {
    return redirect(`/dashboard/sales/new?error=${encodeURIComponent("Stock insuficiente para esta venta.")}`)
  }

  // Use a transaction/rpc if possible, but for MVP we do two queries:
  // 1. Insert sale
  const { error: saleError } = await supabase.from("sales").insert({
    business_id: business.id,
    product_id: productId,
    quantity,
    unit_sale_price: unitPrice,
    discount_amount: discount,
    total_sale_amount: totalSaleAmount,
    sale_date: saleDate,
    notes: notes || null
  })

  if (saleError) {
    return redirect(`/dashboard/sales/new?error=${encodeURIComponent(saleError.message)}`)
  }

  // 2. Adjust stock
  await supabase.from("products").update({
    stock: product.stock - quantity
  }).eq("id", productId)

  revalidatePath("/dashboard/sales")
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard")
  redirect("/dashboard/sales")
}
