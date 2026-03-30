"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, Input, Label, Button } from "@/components/ui"
import { Loader2, Sparkles, Check, Edit2, AlertCircle } from "lucide-react"
import { categorizeExpenseAction } from "@/app/actions/gemini"
import { saveFastExpenseAction } from "@/app/actions/expenses"

export function ExpenseAIFastForm() {
  const router = useRouter()
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ categoria: string, explicacion: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [manualCategory, setManualCategory] = useState("")

  const handleCategorize = async () => {
    if (!description || !amount) {
      setErrorMsg("Completa descripción y monto antes de usar la IA.")
      setTimeout(() => setErrorMsg(""), 3000)
      return
    }

    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")
    setResult(null)
    setIsEditingCategory(false)

    try {
      const res = await categorizeExpenseAction(description)
      if ("error" in res) {
        setErrorMsg(res.error)
      } else {
        setResult(res.data)
        setManualCategory(res.data.categoria)
      }
    } catch (error) {
      setErrorMsg("No pude categorizar esto. ¿Lo intentamos de nuevo? 🙏")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!result || !amount || !description) return

    setLoading(true)
    setErrorMsg("")

    const finalCategory = isEditingCategory ? manualCategory : result.categoria

    // Determine the broader expense type
    let expenseType = "Extraordinario"
    if (finalCategory.includes("Fijo")) {
      expenseType = "Fijo"
    } else if (finalCategory.includes("Variable") || finalCategory.includes("Envío") || finalCategory.includes("Operativo")) {
      expenseType = "Variable"
    }

    try {
      const res = await saveFastExpenseAction({
        description,
        amount: parseFloat(amount),
        category: finalCategory,
        expenseType,
        expenseDate: date
      })

      if (res.error) {
        setErrorMsg(`Error: ${res.error}`)
      } else {
        setSuccessMsg("✅ ¡Gasto registrado!")
        setDescription("")
        setAmount("")
        setResult(null)
        setTimeout(() => setSuccessMsg(""), 3000)
        router.refresh()
      }
    } catch (e) {
      setErrorMsg("Error al guardar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-8 border-brand-border bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#FFF0F3] to-[#F5F3FF] p-4 border-b border-brand-border/50">
        <h2 className="font-serif font-bold text-lg text-brand-text flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#A78BFA]" />
          Registro Rápido con IA
        </h2>
        <p className="text-sm text-brand-muted font-sans mt-1">Describe tu gasto y la IA hará el resto.</p>
      </div>

      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-12 items-end">
          <div className="grid gap-2 md:col-span-6">
            <Label htmlFor="ai-desc">Descripción del gasto</Label>
            <Input
              id="ai-desc"
              placeholder="Ej: 50 bolsitas de empaque con logo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading || !!result}
            />
          </div>
          <div className="grid gap-2 md:col-span-3">
            <Label htmlFor="ai-amount">Monto en dólares ($)</Label>
            <Input
              id="ai-amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading || !!result}
            />
          </div>
          <div className="grid gap-2 md:col-span-3">
            <div className="h-0 flex items-end">
              {/* Visual alignment trick if needed, or just let items-end do the work */}
            </div>
            {!result ? (
              <Button
                onClick={handleCategorize}
                className="w-full text-white font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                style={{
                  background: 'linear-gradient(135deg, #FF7F7F, #A78BFA)',
                  borderRadius: '12px',
                  height: '48px'
                }}
                disabled={loading || !description || !amount}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Categorizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Categorizar con IA
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => { setResult(null); setIsEditingCategory(false); }}
                variant="outline"
                className="w-full h-[48px] rounded-[12px]"
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Form specific date field not requested directly in layout but it's part of the requirements "Campo: Fecha (default hoy)" */}
        {!result && (
          <div className="grid gap-2 mt-4 md:w-1/4">
            <Label htmlFor="ai-date">Fecha</Label>
            <Input
              id="ai-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* AI Result Card */}
        {result && (
          <div
            className="mt-6 p-5 bg-white shadow-[0_4px_20px_rgba(52,211,153,0.1)] transition-all animate-in fade-in slide-in-from-bottom-2"
            style={{ borderRadius: '16px', border: '1.5px solid #34D399' }}
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                {isEditingCategory ? (
                  <div className="mb-2">
                    <Label className="text-xs text-brand-muted mb-1 block">Editar Categoría</Label>
                    <Input
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="h-8 max-w-[250px]"
                    />
                  </div>
                ) : (
                  <h3 className="font-bold text-lg text-brand-text mb-1">✅ {result.categoria}</h3>
                )}
                <p className="text-sm text-brand-muted italic flex items-start gap-1.5">
                  <span className="text-lg leading-none mt-0.5">💬</span> {result.explicacion}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-brand-border hover:bg-brand-secondary"
                  onClick={() => setIsEditingCategory(!isEditingCategory)}
                  disabled={loading}
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  {isEditingCategory ? 'Listo' : 'Cambiar'}
                </Button>
                <Button
                  size="sm"
                  className="h-9 bg-[#34D399] hover:bg-[#10B981] text-white shadow-sm"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {(errorMsg || successMsg) && (
          <div className={`mt-4 p-3 rounded-[12px] flex items-center gap-2 text-sm font-medium animate-in fade-in ${errorMsg ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {errorMsg ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {errorMsg || successMsg}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
