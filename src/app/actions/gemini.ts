"use server"

export type ExpenseCategoryResult = {
  categoria: string
  explicacion: string
}

export type DashboardRecommendation = {
  icono: string
  titulo: string
  texto: string
}

export type DashboardInsightsResult = {
  recomendaciones: DashboardRecommendation[]
}

export type ActionResponse<T> = 
  | { success: true; data: T }
  | { error: string }

export async function categorizeExpenseAction(description: string): Promise<ActionResponse<ExpenseCategoryResult>> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { error: "No API key configured" }
  }

  const prompt = `Categoriza este gasto en una sola categoría exacta.
Categorías válidas:
- Costo Variable - Materia Prima
- Costo Variable - Empaque
- Costo Variable - Envío
- Costo Variable - Publicidad
- Costo Fijo - Arriendo
- Costo Fijo - Servicios
- Costo Fijo - Suscripciones
- Gasto Operativo - Otros

Gasto: ${description}

Devuelve solo un JSON válido con:
- categoria
- explicacion
La explicacion debe ser muy breve, máximo 12 palabras.`

  const schema = {
    type: "object",
    properties: {
      categoria: {
        type: "string",
        enum: [
          "Costo Variable - Materia Prima",
          "Costo Variable - Empaque",
          "Costo Variable - Envío",
          "Costo Variable - Publicidad",
          "Costo Fijo - Arriendo",
          "Costo Fijo - Servicios",
          "Costo Fijo - Suscripciones",
          "Gasto Operativo - Otros"
        ]
      },
      explicacion: {
        type: "string"
      }
    },
    required: ["categoria", "explicacion"]
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1200,
            responseMimeType: "application/json",
            responseSchema: schema
          }
        }),
      }
    )

    if (!response.ok) {
      const status = response.status
      const body = await response.text()
      console.error(`Gemini API Error - Status: ${status}`, body)
      throw new Error("Error en la solicitud a Gemini")
    }

    const data = await response.json()
    const candidate = data?.candidates?.[0]
    
    if (candidate?.finishReason) {
      console.log("Categorize Finish Reason:", candidate.finishReason)
      if (candidate.finishReason === "MAX_TOKENS") {
        return { error: "La IA devolvió una respuesta incompleta. Inténtalo de nuevo." }
      }
    }

    let rawText = candidate?.content?.parts?.[0]?.text

    if (!rawText) {
      console.error("No text candidate found. Full response:", JSON.stringify(data))
      throw new Error("No text candidate found")
    }

    // Strip backticks safely
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim()

    try {
      const parsed = JSON.parse(rawText)
      
      if (parsed && typeof parsed === "object" && "categoria" in parsed && "explicacion" in parsed) {
         return { success: true, data: parsed as ExpenseCategoryResult }
      }
      return { error: "No pude categorizar esto. ¿Lo intentamos de nuevo? 🙏" }
    } catch (e) {
      console.error("Failed to parse JSON", rawText)
      return { error: "No pude categorizar esto. ¿Lo intentamos de nuevo? 🙏" }
    }
  } catch (error) {
    console.error("Gemini API Error", error)
    return { error: "No pude categorizar esto. ¿Lo intentamos de nuevo? 🙏" }
  }
}

const insightsCache = new Map<string, { data: DashboardInsightsResult, timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutos
let fallbackInsights: DashboardInsightsResult | null = null

export async function getDashboardInsightsAction(
  ventas: number, 
  cogs: number, 
  gastos: number, 
  utilidad: number, 
  margen: string, 
  unidades: number
): Promise<ActionResponse<DashboardInsightsResult>> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { error: "No API key configured" }
  }

  const cacheKey = `${ventas}-${cogs}-${gastos}-${utilidad}-${margen}-${unidades}`
  const cached = insightsCache.get(cacheKey)
  const now = Date.now()

  // Retornar si está en caché y no ha expirado
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    console.log("Using cached insights")
    return { success: true, data: cached.data }
  }

  const prompt = `Eres una asesora financiera amigable para microemprendedoras salvadoreñas que venden por Instagram.
Con base en estos datos:
Ventas: $${ventas}
COGS: $${cogs}
Gastos: $${gastos}
Utilidad: $${utilidad}
Margen: ${margen}%
Unidades: ${unidades}

Genera exactamente 3 recomendaciones prácticas.
Cada recomendación debe tener:
- icono
- titulo
- texto

Reglas:
- texto máximo 18 palabras
- titulo máximo 4 palabras
- usa solo estos iconos: ⚠️, 💡, ✅
- devuelve únicamente JSON válido`

  const schema = {
    type: "object",
    properties: {
      recomendaciones: {
        type: "array",
        items: {
          type: "object",
          properties: {
            icono: {
              type: "string",
              enum: ["⚠️", "💡", "✅"]
            },
            titulo: {
              type: "string"
            },
            texto: {
              type: "string"
            }
          },
          required: ["icono", "titulo", "texto"],
          additionalProperties: false
        }
      }
    },
    required: ["recomendaciones"],
    additionalProperties: false
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1400,
            responseMimeType: "application/json",
            responseJsonSchema: schema
          }
        }),
      }
    )

    if (!response.ok) {
      const status = response.status
      const body = await response.text()
      console.error(`Gemini API Error - Status: ${status}`, body)
      
      if (status === 429) {
        if (fallbackInsights) {
          return { success: true, data: fallbackInsights }
        }
        
        let retryDelayText = ""
        try {
          const errJson = JSON.parse(body)
          const retryInfo = errJson.error?.details?.find((d: { "@type": string; retryDelay?: string }) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')
          if (retryInfo?.retryDelay) {
            retryDelayText = ` (Reintenta en ${retryInfo.retryDelay})`
          }
        } catch (e) {
          // ignorar error de parseo del retryDelay
        }
        
        return { error: `La IA está temporalmente ocupada. Vuelve a intentarlo en unos segundos 💛${retryDelayText}` }
      }
      
      throw new Error("Error en la solicitud a Gemini")
    }

    const data = await response.json()
    const candidate = data?.candidates?.[0]
    
    if (candidate?.finishReason) {
      console.log("Insights Finish Reason:", candidate.finishReason)
      if (candidate.finishReason === "MAX_TOKENS") {
        if (fallbackInsights) {
          console.log("Using fallback insights after MAX_TOKENS")
          return { success: true, data: fallbackInsights }
        }
        return { error: "La IA devolvió una respuesta incompleta. Inténtalo de nuevo en unos segundos." }
      }
    }

    let rawText = candidate?.content?.parts?.[0]?.text

    if (!rawText) {
      console.error("No text candidate found. Full response:", JSON.stringify(data))
      throw new Error("No text candidate found")
    }

    // Strip backticks safely
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim()

    try {
      const parsed = JSON.parse(rawText)
      
      if (parsed && typeof parsed === "object" && "recomendaciones" in parsed) {
         const resultData = parsed as DashboardInsightsResult
         insightsCache.set(cacheKey, { data: resultData, timestamp: Date.now() })
         console.log("Saved insights to cache")
         fallbackInsights = resultData
         return { success: true, data: resultData }
      }
      return { error: "No pudimos generar recomendaciones en este momento." }
    } catch (e) {
      console.error("Failed to parse JSON", rawText)
      return { error: "No pudimos generar recomendaciones en este momento." }
    }
  } catch (error) {
    console.error("Gemini API Error", error)
    if (fallbackInsights) {
       return { success: true, data: fallbackInsights }
    }
    return { error: "No pudimos generar recomendaciones en este momento." }
  }
}
