import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui"
import { DollarSign, TrendingDown, TrendingUp, Package, AlertCircle, Lightbulb } from "lucide-react"

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
  const { data: sales } = await supabase.from("sales").select("*, products(cost_price)").eq("business_id", business.id)
  const { data: expenses } = await supabase.from("expenses").select("*").eq("business_id", business.id)

  // Calculations
  const totalSales = sales?.reduce((acc, sale) => acc + Number(sale.total_sale_amount), 0) || 0
  const cogs = sales?.reduce((acc, sale) => acc + (sale.quantity * Number((sale.products as any)?.cost_price || 0)), 0) || 0
  const totalExpenses = expenses?.reduce((acc, exp) => acc + Number(exp.amount), 0) || 0
  
  const estimatedProfit = totalSales - cogs - totalExpenses
  
  // Margins
  const margins = products?.map(p => {
    const margin = p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0
    return { name: p.name, margin: margin.toFixed(1) }
  }) || []

  // Low Stock
  const lowStockThreshold = 5
  const lowStockProducts = products?.filter(p => p.stock <= lowStockThreshold && p.is_active) || []

  // Insights Logic
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Hola, {profile?.full_name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500">Resumen financiero de {business.business_name}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Ingresos brutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Costo de Ventas (COGS)</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cogs.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Costo de los productos vendidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Gastos Operativos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Empaques, envíos, publicidad</p>
          </CardContent>
        </Card>

        <Card className={`${estimatedProfit >= 0 ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${estimatedProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>
              Utilidad Neta
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${estimatedProfit >= 0 ? "text-blue-700" : "text-red-700"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${estimatedProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>
              ${estimatedProfit.toFixed(2)}
            </div>
            <p className={`text-xs mt-1 ${estimatedProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>Lo que realmente te queda</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Insights */}
        <Card className="md:col-span-2 border-indigo-100 shadow-sm">
          <CardHeader className="bg-indigo-50/50 rounded-t-xl pb-4 border-b border-indigo-50">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-indigo-900">Análisis Inteligente</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid gap-4">
            {insights.length === 0 ? (
               <p className="text-sm text-gray-500 italic">Registra más ventas y gastos para generar recomendaciones.</p>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} className={`flex gap-3 p-4 rounded-lg border 
                  ${insight.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' : 
                    insight.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' : 
                    insight.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : 
                    'bg-green-50 border-green-200 text-green-800'}`}>
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{insight.text}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Low Stock Watchlist */}
        <Card>
          <CardHeader>
            <CardTitle>Productos en Riesgo</CardTitle>
            <CardDescription>Inventario igual o menor a {lowStockThreshold} unidades</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="text-center p-6 text-sm text-gray-500 bg-gray-50 rounded-lg">
                Todo el inventario está en un nivel saludable.
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.category || "General"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
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
             <CardTitle>Margen por Producto</CardTitle>
             <CardDescription>Rentabilidad bruta por unidad</CardDescription>
          </CardHeader>
          <CardContent>
            {margins.length === 0 ? (
               <div className="text-center p-6 text-sm text-gray-500 bg-gray-50 rounded-lg">
                 Agrega productos para ver tus márgenes.
               </div>
            ) : (
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {margins.sort((a,b) => Number(b.margin) - Number(a.margin)).map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate mr-2">{m.name}</span>
                    <span className={`font-semibold ${Number(m.margin) >= 40 ? 'text-green-600' : Number(m.margin) >= 20 ? 'text-yellow-600' : 'text-red-500'}`}>
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
