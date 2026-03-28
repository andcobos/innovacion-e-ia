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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gastos</h1>
        <Link href="/dashboard/expenses/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Registrar Gasto</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses?.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
               <ReceiptIcon className="h-10 w-10 text-gray-400 mb-2" />
               <p className="text-lg font-medium">No tienes gastos registrados</p>
               <p className="text-sm">Todo gasto impacta tu utilidad. Empieza a registrarlos.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th scope="col" className="px-4 py-3">Fecha</th>
                    <th scope="col" className="px-4 py-3">Descripción</th>
                    <th scope="col" className="px-4 py-3">Categoría IA</th>
                    <th scope="col" className="px-4 py-3 text-center">Tipo</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-gray-900">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses?.map((expense) => (
                    <tr key={expense.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{new Date(expense.expense_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{expense.description}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {expense.expense_category || expense.ai_suggested_category || "General"}
                        </span>
                        {expense.ai_suggested_category && expense.ai_suggested_category === expense.expense_category && (
                           <span className="ml-1 text-[10px] text-purple-500 font-bold" title="Sugerido por IA">✨</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{expense.expense_type || "-"}</td>
                      <td className="px-4 py-3 font-bold text-red-600">${expense.amount}</td>
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
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
       <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
       <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
       <path d="M12 17V7" />
    </svg>
  )
}
