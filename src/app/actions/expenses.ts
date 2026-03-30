"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"

export async function saveFastExpenseAction({
  description,
  amount,
  category,
  expenseType,
  expenseDate
}: {
  description: string;
  amount: number;
  category: string;
  expenseType: string;
  expenseDate: string;
}) {
  const supabase = await createClient()

  // Get current user business
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "User not found" }

  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single()
  const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile?.id).single()

  if (!business) {
    return { error: "Business not found" }
  }

  const { error } = await supabase.from("expenses").insert({
    business_id: business.id,
    description,
    amount,
    expense_category: category,
    ai_suggested_category: category, // marking it as AI suggested
    expense_type: expenseType,
    expense_date: expenseDate,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard")
  
  return { success: true }
}
