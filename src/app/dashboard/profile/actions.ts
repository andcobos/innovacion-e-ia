"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function seedData(formData: FormData) {
  const supabase = await createClient()

  const businessId = formData.get("businessId") as string
  if (!businessId) {
     return redirect("/dashboard/profile?error=MissingBusinessId")
  }

  // Generate 3 sample products
  const products = [
    { business_id: businessId, name: "Camisa Denim Vintage", category: "Ropa", sale_price: 35.00, cost_price: 15.00, stock: 2, is_active: true },
    { business_id: businessId, name: "Gorra Trucker", category: "Accesorios", sale_price: 18.00, cost_price: 5.00, stock: 15, is_active: true },
    { business_id: businessId, name: "Taza de Cerámica Artesanal", category: "Hogar", sale_price: 12.00, cost_price: 6.00, stock: 8, is_active: true }
  ];

  const { data: insertedProducts, error: pError } = await supabase.from("products").insert(products).select()
  
  if (pError || !insertedProducts) {
     return redirect("/dashboard/profile?error=ErrorSeedingProducts")
  }

  // Generate some sales
  const sales = [
     { business_id: businessId, product_id: insertedProducts[0].id, quantity: 2, unit_sale_price: 35.00, discount_amount: 5.00, total_sale_amount: 65.00, sale_date: new Date().toISOString() },
     { business_id: businessId, product_id: insertedProducts[1].id, quantity: 1, unit_sale_price: 18.00, discount_amount: 0, total_sale_amount: 18.00, sale_date: new Date(Date.now() - 86400000).toISOString() },
     { business_id: businessId, product_id: insertedProducts[2].id, quantity: 3, unit_sale_price: 12.00, discount_amount: 0, total_sale_amount: 36.00, sale_date: new Date(Date.now() - 86400000 * 2).toISOString() }
  ]

  await supabase.from("sales").insert(sales)

  // Generate some expenses
  const expenses = [
     { business_id: businessId, description: "Compra de 100 bolsas kraft", amount: 15.50, expense_category: "Empaque", ai_suggested_category: "Empaque", expense_type: "Variable", expense_date: new Date().toISOString() },
     { business_id: businessId, description: "Publicidad en Reels Instagram", amount: 20.00, expense_category: "Publicidad", ai_suggested_category: "Publicidad", expense_type: "Variable", expense_date: new Date(Date.now() - 86400000 * 3).toISOString() },
     { business_id: businessId, description: "Pago de suscripción Canva Pro", amount: 12.99, expense_category: "Servicios Básicos", ai_suggested_category: null, expense_type: "Fijo", expense_date: new Date(Date.now() - 86400000 * 5).toISOString() }
  ]

  await supabase.from("expenses").insert(expenses)

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
