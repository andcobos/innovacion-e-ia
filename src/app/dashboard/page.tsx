import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui"
import { DollarSign, TrendingDown, TrendingUp, Package, AlertCircle, Lightbulb, ReceiptText } from "lucide-react"
import { TrendChart } from "./trend-chart"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user?.id).single()
  const { data: business } = await supabase.from("businesses").select("*").eq("profile_id", profile?.id).single()

  if (!business) {
    return <div>No hay negocio registrado.</div>
  }

  // Fetch data
  const { data: products } = await supabase.from("products").select("*").eq("business_id", business.id)
  const { data: sales } = await supabase.from("sales").select("*, products(cost_price)").eq("business_id", business.id).order("sale_date", { ascending: true })
  const { data: expenses } = await supabase.from("expenses").select("*").eq("business_id", business.id).order("expense_date", { ascending: true })

  // Current Month Calculations (Mock simpler approach: all historical acts as current for demo if no dates filtering is strictly enforced, but let's do overall for now)
  const totalSales = sales?.reduce((acc, sale) => acc + Number(sale.total_sale_amount), 0) || 0
  const totalSoldUnits = sales?.reduce((acc, sale) => acc + Number(sale.quantity), 0) || 0
  
  const cogs = sales?.reduce((acc, sale) => acc + (sale.quantity * Number((sale.products as any)?.cost_price || 0)), 0) || 0
  const totalExpenses = expenses?.reduce((acc, exp) => acc + Number(exp.amount), 0) || 0
  const fixedCosts = expenses?.filter(e => e.expense_type === "Fijo").reduce((acc, exp) => acc + Number(exp.amount), 0) || 0
  
  const estimatedProfit = totalSales - cogs - totalExpenses
  
  // Break-even logic
  let breakEvenUnits = 0
  if (products && products.length > 0) {
     const totalMargin = products.reduce((acc, p) => acc + (p.sale_price - p.cost_price), 0)
     const avgMarginPerUnit = totalMargin / products.length
     if (avgMarginPerUnit > 0) {
        breakEvenUnits = Math.ceil(fixedCosts / avgMarginPerUnit)
     }
  }
  const breakEvenProgress = breakEvenUnits > 0 ? Math.min((totalSoldUnits / breakEvenUnits) * 100, 100) : 0

  // Trend Chart logic (Group by Month)
  const monthlyData: Record<string, { ventas: number; gastos: number; cogs: number }> = {}
  
  sales?.forEach(s => {
    const d = new Date(s.sale_date)
    const monthYear = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' })
    if (!monthlyData[monthYear]) monthlyData[monthYear] = { ventas: 0, gastos: 0, cogs: 0 }
    monthlyData[monthYear].ventas += Number(s.total_sale_amount)
    monthlyData[monthYear].cogs += (s.quantity * Number((s.products as any)?.cost_price || 0))
  })

  expenses?.forEach(e => {
    const d = new Date(e.expense_date)
    const monthYear = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' })
    if (!monthlyData[monthYear]) monthlyData[monthYear] = { ventas: 0, gastos: 0, cogs: 0 }
    monthlyData[monthYear].gastos += Number(e.amount)
  })

  // Format array for recharts
  const chartData = Object.entries(monthlyData).map(([mes, metrics]) => {
     return {
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        ventas: Number(metrics.ventas.toFixed(2)),
        utilidad: Number((metrics.ventas - metrics.cogs - metrics.gastos).toFixed(2))
     }
  })

  // Margins & Insights
  const margins = products?.map(p => {
    const margin = p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0
    return { name: p.name, margin: margin.toFixed(1) }
  }) || []

  const lowStockThreshold = 5
  const lowStockProducts = products?.filter(p => p.stock <= lowStockThreshold && p.is_active) || []

  const insights = []
  if (estimatedProfit < 0) {
    insights.push({ type: 'danger', text: 'Estás operando con pérdida. Revisa tus gastos fijos y los márgenes de tus productos.' })
  } else if (estimatedProfit > 0 && estimatedProfit < totalSales * 0.1) {
    insights.push({ type: 'warning', text: 'Tu utilidad neta es menor al 10%. Considera optimizar gastos como empaques o evaluar precios.' })
  }

  const packagingExpenses = expenses?.filter(e => e.expense_category === 'Empaque' || e.ai_suggested_category === 'Empaque')
     .reduce((acc, e) => acc + Number(e.amount), 0) || 0
  if (packagingExpenses > totalExpenses * 0.2) {
    insights.push({ type: 'warning', text: `Tus costos de empaque son altos ($${packagingExpenses}). ¿Podrías comprar por mayor?` })
  }

  if (lowStockProducts.length > 0) {
    insights.push({ type: 'info', text: `Tienes ${lowStockProducts.length} producto(s) con inventario bajo. Evita perder ventas por falta de stock.` })
  }

  if (totalSales > 0 && insights.length === 0) {
     insights.push({ type: 'success', text: '¡Buen trabajo! Tus finanzas parecen estar saludables.' })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-[16px] border border-brand-border shadow-[0_4px_24px_rgba(255,127,127,0.08)]">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-brand-text font-serif">Hola, {profile?.full_name.split(' ')[0]} 👋</h1>
          <p className="text-[14px] text-brand-muted font-sans mt-1">Resumen financiero de {business.business_name}</p>
        </div>
        <div className="mt-4 sm:mt-0 px-4 py-2 bg-[#FFF0F3] rounded-[12px] border border-brand-border/50">
           <span className="text-sm font-semibold text-[#1F2937] capitalize">
             {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
           </span>
        </div>
      </div>

      {/* KPI Cards (4 cards) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Ventas */}
        <Card className="hover:shadow-[0_8px_20px_rgba(255,127,127,0.15)] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-medium text-brand-text font-sans">Ventas Totales</CardTitle>
            <div className="p-2 bg-[#FFE4E4] rounded-[10px] transition-transform group-hover:scale-110">
               <DollarSign className="h-4 w-4 text-[#FF7F7F]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-bold font-mono text-brand-text leading-none">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-brand-muted mt-2">Ingresos brutos del mes</p>
          </CardContent>
        </Card>

        {/* COGS */}
        <Card className="hover:shadow-[0_8px_20px_rgba(167,139,250,0.15)] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-medium text-brand-text font-sans">Costo de Ventas</CardTitle>
            <div className="p-2 bg-[#EDE9FE] rounded-[10px] transition-transform group-hover:scale-110">
               <Package className="h-4 w-4 text-[#A78BFA]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-bold font-mono text-brand-text leading-none">${cogs.toFixed(2)}</div>
            <p className="text-xs text-brand-muted mt-2">Costo de los productos vendidos</p>
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card className="hover:shadow-[0_8px_20px_rgba(251,191,36,0.15)] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-medium text-brand-text font-sans">Gastos Operativos</CardTitle>
            <div className="p-2 bg-[#FEF3C7] rounded-[10px] transition-transform group-hover:scale-110">
               <ReceiptText className="h-4 w-4 text-[#FBBF24]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-bold font-mono text-brand-text leading-none">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-brand-muted mt-2">Empaques, envíos, publicidad</p>
          </CardContent>
        </Card>

        {/* Neta */}
        <Card className="hover:shadow-[0_8px_20px_rgba(52,211,153,0.15)] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[13px] font-medium text-brand-text font-sans">Utilidad Neta</CardTitle>
            <div className={`p-2 rounded-[10px] transition-transform group-hover:scale-110 ${estimatedProfit >= 0 ? "bg-[#D1FAE5]" : "bg-[#FEE2E2]"}`}>
               {estimatedProfit >= 0 ? (
                 <TrendingUp className="h-4 w-4 text-[#34D399]" />
               ) : (
                 <TrendingDown className="h-4 w-4 text-[#F87171]" />
               )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-bold font-mono text-brand-text leading-none">${estimatedProfit.toFixed(2)}</div>
            <p className="text-xs text-brand-muted mt-2">Lo que realmente te queda</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Highlight Cards Row */}
      <div className="grid gap-6 md:grid-cols-2">
         {/* Retiro Card */}
         <Card className={`border-0 overflow-hidden shadow-md flex flex-col justify-center`} style={{ background: estimatedProfit > 0 ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : 'linear-gradient(135deg, #FEE2E2, #FECACA)' }}>
           <CardContent className="p-8 text-center sm:text-left">
              {estimatedProfit > 0 ? (
                 <>
                   <div className="text-4xl mb-3">💸</div>
                   <h3 className="text-2xl font-bold font-serif text-[#064E3B] mb-2">¡Puedes retirar dinero!</h3>
                   <div className="text-4xl md:text-[42px] font-bold font-mono text-[#065F46] tracking-tight mb-3">
                     ${estimatedProfit.toFixed(2)}
                   </div>
                   <p className="text-[#064E3B]/80 text-sm font-sans font-medium">Esta es tu ganancia real. Retirar más afectaría tu negocio.</p>
                 </>
              ) : (
                 <>
                   <div className="text-4xl mb-3">⚠️</div>
                   <h3 className="text-2xl font-bold font-serif text-[#7F1D1D] mb-2">Aún no es momento de retirar</h3>
                   <div className="text-4xl md:text-[42px] font-bold font-mono text-[#991B1B] tracking-tight mb-3">
                     ${Math.abs(estimatedProfit).toFixed(2)} <span className="text-xl font-sans">en contra</span>
                   </div>
                   <p className="text-[#7F1D1D]/80 text-sm font-sans font-medium">Tu negocio necesita estos fondos para sostenerse.</p>
                 </>
              )}
           </CardContent>
         </Card>

         {/* Punto de Equilibrio Card */}
         <Card className="flex flex-col justify-center">
            <CardHeader className="pb-3">
               <CardTitle className="text-xl font-bold font-serif flex items-center gap-2">
                 <span>⚖️</span> Punto de Equilibrio
               </CardTitle>
               <CardDescription className="text-[13px]">
                 Necesitas vender {breakEvenUnits} unidades este mes para no perder
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="w-full bg-[#FCE7F3] rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                 <div 
                   className="h-3 rounded-full transition-all duration-1000 ease-out" 
                   style={{ 
                     width: `${breakEvenProgress}%`,
                     background: breakEvenProgress >= 100 
                       ? 'linear-gradient(90deg, #34D399, #6EE7B7)' 
                       : breakEvenProgress >= 50 
                         ? 'linear-gradient(90deg, #FBBF24, #FDE68A)' 
                         : 'linear-gradient(90deg, #FF7F7F, #FFB3B3)'
                   }}
                 />
               </div>
               <p className="text-xs font-semibold text-brand-muted text-right">
                 {totalSoldUnits} de {breakEvenUnits} unidades vendidas
               </p>
               {breakEvenUnits === 0 && (
                  <p className="text-xs text-brand-muted mt-4 bg-brand-secondary/30 p-2 border border-dashed rounded-[8px]">
                    Agrega productos, ventas y gastos fijos para calcular tu punto de equilibrio.
                  </p>
               )}
            </CardContent>
         </Card>
      </div>

      {/* Trend Area Chart */}
      <Card>
         <CardHeader>
           <CardTitle className="text-xl font-bold font-serif">Tu rentabilidad en el tiempo</CardTitle>
           <CardDescription>Evolución de ventas vs utilidad neta mensual</CardDescription>
         </CardHeader>
         <CardContent>
           <TrendChart data={chartData} />
         </CardContent>
      </Card>

      {/* Main Content Grid existing insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Insights */}
        <Card className="md:col-span-2 overflow-hidden">
          <CardHeader className="bg-[#F5F3FF]/50 border-b border-brand-border pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#A78BFA]/20 rounded-[8px]">
                 <Lightbulb className="h-5 w-5 text-[#A78BFA]" />
              </div>
              <CardTitle className="font-serif">Análisis Inteligente</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid gap-4">
            {insights.length === 0 ? (
               <p className="text-sm text-brand-muted italic">Registra más ventas y gastos para generar recomendaciones.</p>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} className={`flex gap-3 p-4 rounded-[12px] border 
                  ${insight.type === 'danger' ? 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]' : 
                    insight.type === 'warning' ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]' : 
                    insight.type === 'info' ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]' : 
                    'bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]'}`}>
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium font-sans leading-relaxed">{insight.text}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Low Stock Watchlist */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Productos en Riesgo</CardTitle>
            <CardDescription>Inventario igual o menor a {lowStockThreshold} unidades</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center p-8 text-sm text-brand-muted bg-[#FFF0F3]/30 rounded-[12px] border border-dashed border-brand-border">
                Todo el inventario está en un nivel saludable.
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between border-b border-brand-border pb-3 last:border-0">
                    <div>
                      <p className="font-semibold text-sm text-brand-text">{p.name}</p>
                      <p className="text-xs text-brand-muted">{p.category || "General"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] px-3 py-1 rounded-[8px]">
                        {p.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Margins */}
        <Card>
          <CardHeader>
             <CardTitle className="font-serif text-lg">Margen por Producto</CardTitle>
             <CardDescription>Rentabilidad bruta por unidad</CardDescription>
          </CardHeader>
          <CardContent>
            {margins.length === 0 ? (
               <div className="text-center p-8 text-sm text-brand-muted bg-[#FFF0F3]/30 rounded-[12px] border border-dashed border-brand-border">
                 Agrega productos para ver tus márgenes.
               </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {margins.sort((a,b) => Number(b.margin) - Number(a.margin)).map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-[#FCE7F3] last:border-0">
                    <span className="font-medium text-brand-text truncate mr-2">{m.name}</span>
                    <span className={`font-mono font-bold px-2.5 py-1 rounded-[8px] text-[12px] ${Number(m.margin) >= 40 ? 'bg-[#D1FAE5] text-[#065F46]' : Number(m.margin) >= 20 ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                      {m.margin}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
