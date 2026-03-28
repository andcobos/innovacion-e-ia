"use server"

/**
 * AI Service for suggesting expense categories.
 * This is currently a rule-based mock, but the architectural boundary is established
 * here so it can be easily swapped for an actual LLM call (e.g. OpenAI GPT-4) later.
 */
export async function suggestExpenseCategory(description: string): Promise<string | null> {
  // Simulating network delay for realism
  await new Promise(resolve => setTimeout(resolve, 600))

  const lowerDesc = description.toLowerCase()
  
  if (lowerDesc.includes("bolsa") || lowerDesc.includes("caja") || lowerDesc.includes("empaque")) {
    return "Empaque"
  } 
  
  if (lowerDesc.includes("pauta") || lowerDesc.includes("instagram") || lowerDesc.includes("facebook") || lowerDesc.includes("ad")) {
    return "Publicidad"
  } 
  
  if (lowerDesc.includes("envio") || lowerDesc.includes("transporte") || lowerDesc.includes("gasolina") || lowerDesc.includes("uber") || lowerDesc.includes("pedidosya")) {
    return "Envío"
  } 
  
  if (lowerDesc.includes("descuento") || lowerDesc.includes("cupon") || lowerDesc.includes("promo")) {
    return "Promoción"
  } 
  
  if (lowerDesc.includes("sueldo") || lowerDesc.includes("pago") || lowerDesc.includes("salario")) {
    return "Planilla"
  } 
  
  if (lowerDesc.includes("luz") || lowerDesc.includes("agua") || lowerDesc.includes("internet") || lowerDesc.includes("telefonia")) {
    return "Servicios Básicos"
  }

  return null
}
