"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"

export function ToastProvider() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    const message = searchParams.get("message")
    const success = searchParams.get("success")

    if (error || message || success) {
      if (error) setToast({ message: error, type: "error" })
      else if (message) setToast({ message: message, type: "error" }) // Some messages acting as errors based on prev codebase
      else if (success) setToast({ message: success, type: "success" })

      // Clean URL without refreshing page
      const newUrl = pathname
      router.replace(newUrl, { scroll: false })
      
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, pathname, router])

  if (!toast) return null

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border ${
        toast.type === "success" 
          ? "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]" 
          : "bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]"
      }`}>
        {toast.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
        <p className="font-sans text-sm font-semibold">{toast.message}</p>
      </div>
    </div>
  )
}
