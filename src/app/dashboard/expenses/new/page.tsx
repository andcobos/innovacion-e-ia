"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Button } from "@/components/ui"
import { createExpense } from "./actions"
import Link from "next/link"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { suggestExpenseCategory } from "@/lib/ai-service"
import { useFormState } from "react-dom"

export default function NewExpensePage() {
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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses">
          <Button variant="ghost" size="icon" className="rounded-full">
             <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registar Gasto</h1>
          <p className="text-sm text-gray-500">Añade un nuevo gasto operativo de tu negocio</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={createExpense} className="grid gap-5">
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
              <div className="flex justify-between items-center h-6">
                <Label htmlFor="category">Categoría</Label>
                {isSuggesting ? (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Analizando...
                  </span>
                ) : aiSuggestion ? (
                  <span className="text-xs text-purple-600 flex items-center gap-1 font-medium bg-purple-50 px-2 py-1 rounded-full border border-purple-100 transition-all">
                    <Sparkles className="w-3 h-3" /> Sugerencia IA: {aiSuggestion}
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
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
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

            <div className="flex justify-end gap-3 mt-4">
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
