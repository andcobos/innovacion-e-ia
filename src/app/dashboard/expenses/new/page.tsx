"use client"

import { Card, CardContent, Input, Label, Button } from "@/components/ui"
import { createExpense } from "./actions"
import Link from "next/link"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { suggestExpenseCategory } from "@/lib/ai-service"
import { useSearchParams } from "next/navigation"

function ExpenseForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const [description, setDescription] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [category, setCategory] = useState("")
  const [isSuggesting, setIsSuggesting] = useState(false)

  // Mock AI Logic to suggest category using modular service
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (description.length > 3) {
        setIsSuggesting(true)
        try {
           const suggested = await suggestExpenseCategory(description)
           setAiSuggestion(suggested)
           if (suggested && !category) {
             setCategory(suggested)
           }
        } finally {
           setIsSuggesting(false)
        }
      } else {
        setAiSuggestion(null)
      }
    }

    const timer = setTimeout(() => {
       fetchSuggestion()
    }, 500) // debounce typing

    return () => clearTimeout(timer)
  }, [description])

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses">
          <Button variant="ghost" size="icon" className="rounded-full bg-white border border-brand-border shadow-sm hover:translate-y-0">
             <ArrowLeft className="h-5 w-5 text-brand-text" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-brand-text font-serif">Registar Gasto</h1>
          <p className="text-sm text-brand-muted font-sans mt-0.5">Añade un nuevo gasto operativo de tu negocio</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-8">
          <form action={createExpense} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción del gasto</Label>
              <Input 
                 id="description" 
                 name="description" 
                 required 
                 placeholder="Ej. Compra de bolsas para entregas..." 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between items-end h-[24px]">
                <Label htmlFor="category">Categoría</Label>
                {isSuggesting ? (
                  <span className="text-xs text-brand-muted flex items-center gap-1.5 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analizando...
                  </span>
                ) : aiSuggestion ? (
                  <span className="text-[11px] text-brand-accent flex items-center gap-1.5 font-bold uppercase tracking-wider bg-violet-50 px-2.5 py-1 rounded-[8px] border border-violet-100 transition-all">
                    <Sparkles className="w-3.5 h-3.5" /> Sugerencia IA: {aiSuggestion}
                  </span>
                ) : null}
              </div>
              <Input 
                id="category" 
                name="category" 
                placeholder="Empaque, Publicidad, etc." 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <input type="hidden" name="aiSuggestedCategory" value={aiSuggestion || ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Monto ($)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" required placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expenseType">Tipo de Gasto</Label>
                <select 
                  id="expenseType" 
                  name="expenseType" 
                  className="flex h-[48px] w-full rounded-[12px] border border-brand-border bg-white px-4 py-2 text-sm text-brand-text focus-visible:outline-none focus-visible:border-2 focus-visible:border-brand-primary focus-visible:ring-0 transition-all font-sans"
                >
                  <option value="Fijo">Gasto Fijo</option>
                  <option value="Variable">Gasto Variable</option>
                  <option value="Extraordinario">Extraordinario</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expenseDate">Fecha del Gasto</Label>
              <Input id="expenseDate" name="expenseDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>

            {error && (
               <div className="p-3 bg-red-50 border border-red-100 rounded-[12px]">
                 <p className="text-sm text-brand-danger font-semibold">Error: {error}</p>
               </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-brand-border">
              <Link href="/dashboard/expenses">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit">Guardar Gasto</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
       <ExpenseForm />
    </Suspense>
  )
}
