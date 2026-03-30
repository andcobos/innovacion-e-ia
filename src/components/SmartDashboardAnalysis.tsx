"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui"
import { getDashboardInsightsAction } from "@/app/actions/gemini"

type Recommendation = {
  icono: string
  titulo: string
  texto: string
}

export function SmartDashboardAnalysis({
  ventas,
  cogs,
  gastos,
  utilidad,
  margen,
  unidades,
  totalGastosCount,
  totalVentasCount,
}: {
  ventas: number
  cogs: number
  gastos: number
  utilidad: number
  margen: string
  unidades: number
  totalGastosCount: number
  totalVentasCount: number
}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const lastFetchedParams = useRef<string>("")

  useEffect(() => {
    // Only fetch if data criteria is met
    if (totalVentasCount >= 1 && totalGastosCount >= 1) {
      const currentParamsStr = `${ventas}-${cogs}-${gastos}-${utilidad}-${margen}-${unidades}`
      if (lastFetchedParams.current === currentParamsStr) {
        return // ya tenemos los datos y los parámetros no han cambiado
      }
      lastFetchedParams.current = currentParamsStr

      const fetchInsights = async () => {
        setLoading(true)
        setError("")
        try {
          const res = await getDashboardInsightsAction(ventas, cogs, gastos, utilidad, margen, unidades)
          if ("error" in res) {
            setError(res.error)
          } else {
            setRecommendations(res.data.recomendaciones)
          }
        } catch (e) {
          setError("No pudimos generar recomendaciones en este momento.")
        } finally {
          setLoading(false)
        }
      }
      fetchInsights()
    } else {
      setLoading(false)
    }
  }, [ventas, cogs, gastos, utilidad, margen, unidades, totalVentasCount, totalGastosCount])

  // Card header design specified in prompt
  const headerContent = (
    <CardHeader className="border-b border-brand-border/50 pb-4">
      <div className="flex flex-col gap-1">
        <CardTitle className="font-serif text-[22px] font-bold text-brand-text flex items-center gap-2">
          ✨ Análisis Inteligente
        </CardTitle>
        <p className="text-[14px] text-brand-muted font-sans tracking-tight">
          Recomendaciones personalizadas para tu negocio
        </p>
      </div>
    </CardHeader>
  )

  const hasEnoughData = totalVentasCount >= 1 && totalGastosCount >= 1

  if (!hasEnoughData) {
    return (
      <Card className="md:col-span-2 overflow-hidden border-brand-border bg-white" style={{ background: 'linear-gradient(135deg, #FFF0F3, #F5F3FF)' }}>
         {headerContent}
         <CardContent className="pt-6">
           <p className="p-8 text-center text-[15px] font-medium text-brand-text bg-white/60 rounded-[12px] border border-white/40 shadow-sm backdrop-blur-sm">
             Registra tus primeras ventas y gastos para recibir recomendaciones personalizadas 💡
           </p>
         </CardContent>
      </Card>
    )
  }

  return (
    <Card className="md:col-span-2 overflow-hidden border-brand-border shadow-md" style={{ background: 'linear-gradient(135deg, #FFF0F3, #F5F3FF)' }}>
      {headerContent}
      <CardContent className="pt-6 grid gap-4 sm:grid-cols-3">
        {loading ? (
          <>
             {/* 3 Skeletons */}
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-3 p-5 rounded-[16px] bg-white/70 border border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.03)] animate-pulse backdrop-blur-sm">
                   <div className="w-10 h-10 bg-brand-border/40 rounded-full shrink-0"></div>
                   <div className="w-3/4 h-5 bg-brand-border/40 rounded mt-1"></div>
                   <div className="w-full h-12 bg-brand-border/30 rounded mt-2"></div>
                </div>
             ))}
          </>
        ) : error ? (
           <div className="col-span-1 sm:col-span-3 p-6 bg-[#FFF0F3]/50 rounded-[16px] border border-[#FECACA] text-center shadow-sm">
             <p className="font-sans text-[#991B1B] font-medium">{error}</p>
           </div>
        ) : recommendations.length === 0 ? (
           <p className="col-span-3 text-brand-muted text-sm my-4 italic text-center">No se encontraron recomendaciones por ahora.</p>
        ) : (
          recommendations.map((rec, idx) => (
            <div key={idx} className="flex flex-col gap-3 p-5 rounded-[16px] bg-white shadow-[0_4px_16px_rgba(255,127,127,0.06)] border border-brand-border transition-transform hover:scale-[1.02]">
              <div className="text-3xl bg-brand-secondary/40 w-12 h-12 rounded-full flex items-center justify-center -ml-1">
                 {rec.icono}
              </div>
              <h4 className="font-sans font-semibold text-[16px] text-brand-text leading-tight mt-1">
                {rec.titulo}
              </h4>
              <p className="font-sans text-[13.5px] text-brand-muted leading-relaxed">
                {rec.texto}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
