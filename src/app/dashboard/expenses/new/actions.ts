"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function createExpense(formData: FormData) {
  const supabase = await createClient()

  // Get current user business
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile?.id).single()

  if (!business) {
    return redirect("/dashboard?error=BusinessNotFound")
  }

  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const aiSuggestedCategory = formData.get("aiSuggestedCategory") as string
  const amount = parseFloat(formData.get("amount") as string)
  const expenseType = formData.get("expenseType") as string
  const expenseDate = formData.get("expenseDate") as string

  const { error } = await supabase.from("expenses").insert({
    business_id: business.id,
    description,
    amount,
    expense_category: category || null,
    ai_suggested_category: aiSuggestedCategory || null,
    expense_type: expenseType || null,
    expense_date: expenseDate,
  })

  if (error) {
    return redirect(`/dashboard/expenses/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard")
  redirect("/dashboard/expenses")
}
