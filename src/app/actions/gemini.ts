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

  const prompt = `Eres una asesora financiera amigable para microemprendedoras salvadoreñas que venden por Instagram. Tono cálido, cercano y motivador, como una amiga que entiende de finanzas. Sin tecnicismos. Datos del negocio este mes: Ventas: $${ventas}, COGS: $${cogs}, Gastos operativos: $${gastos}, Utilidad neta: $${utilidad}, Margen promedio: ${margen}%, Unidades vendidas: ${unidades}. Dame exactamente 3 recomendaciones prácticas y accionables.`

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
          required: ["icono", "titulo", "texto"]
        }
      }
    },
    required: ["recomendaciones"]
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
            maxOutputTokens: 700,
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
      console.log("Insights Finish Reason:", candidate.finishReason)
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
         return { success: true, data: parsed as DashboardInsightsResult }
      }
      return { error: "No pudimos generar recomendaciones en este momento." }
    } catch (e) {
      console.error("Failed to parse JSON", rawText)
      return { error: "No pudimos generar recomendaciones en este momento." }
    }
  } catch (error) {
    console.error("Gemini API Error", error)
    return { error: "No pudimos generar recomendaciones en este momento." }
  }
}
