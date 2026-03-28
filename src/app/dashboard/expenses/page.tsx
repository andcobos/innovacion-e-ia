import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { PlusCircle } from "lucide-react"

export default async function ExpensesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("id").eq("profile_id", profile?.id).single()

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("business_id", business?.id)
    .order("expense_date", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight text-brand-text font-serif">Gastos</h1>
        <Link href="/dashboard/expenses/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Registrar Gasto</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b border-brand-border">
          <CardTitle className="text-xl">Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0 sm:px-6">
          {expenses?.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 mt-6 text-center text-brand-muted bg-brand-secondary/30 rounded-[12px] border border-dashed border-brand-border">
               <div className="p-3 bg-white rounded-full mb-3 shadow-[0_4px_12px_rgba(255,127,127,0.05)]">
                 <ReceiptIcon className="h-8 w-8 text-brand-primary" />
               </div>
               <p className="text-lg font-bold text-brand-text mb-1 font-serif">No tienes gastos registrados</p>
               <p className="text-sm">Todo gasto impacta tu utilidad. Empieza a registrarlos.</p>
             </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left text-brand-muted">
                <thead className="text-xs text-brand-text uppercase bg-brand-secondary/50 border-b border-brand-border rounded-t-lg">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold rounded-tl-lg">Fecha</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Descripción</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Categoría IA</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center hidden sm:table-cell">Tipo</th>
                    <th scope="col" className="px-6 py-4 font-bold text-brand-text rounded-tr-lg">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses?.map((expense) => (
                    <tr key={expense.id} className="bg-white border-b border-brand-border hover:bg-brand-secondary/30 transition-colors">
                      <td className="px-6 py-4">{new Date(expense.expense_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-brand-text">{expense.description}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-[8px] text-[11px] font-bold uppercase tracking-wider bg-violet-50 text-brand-accent border border-violet-100">
                          {expense.expense_category || expense.ai_suggested_category || "General"}
                        </span>
                        {expense.ai_suggested_category && expense.ai_suggested_category === expense.expense_category && (
                           <span className="ml-1.5 text-[12px] text-violet-500" title="Sugerido por IA">✨</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center hidden sm:table-cell">{expense.expense_type || "-"}</td>
                      <td className="px-6 py-4 font-bold font-mono text-brand-danger">${expense.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
       <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
       <path d="M12 17V7" />
    </svg>
  )
}
