
import { useState } from "react"
import type { ClosurePeriodType, ClosureReportPayload } from "@/types/closure"
import { generateClosureReport } from "@/services/closureService"
import { exportClosureToPDF } from "@/utils/export/pdf/closurePdfExport"
import { useAuth } from "@/context/AuthContext"

export const useClosure = () => {
  const { profile, user } = useAuth()
  
  // 🔹 Estados de carga independientes para cada botón
  const [loadingDiario, setLoadingDiario] = useState<boolean>(false)
  const [loadingSemanal, setLoadingSemanal] = useState<boolean>(false)
  const [loadingMensual, setLoadingMensual] = useState<boolean>(false)

  // Selector interno para cambiar el spinner adecuado
  const setLoader = (period: ClosurePeriodType, value: boolean) => {
    if (period === "DIARIO") setLoadingDiario(value)
    if (period === "SEMANAL") setLoadingSemanal(value)
    if (period === "MENSUAL") setLoadingMensual(value)
  }

  // 🔥 Función central para procesar y consolidar el cierre de caja
  const triggerClosure = async (period: ClosurePeriodType) => {
    setLoader(period, true)
    try {
      // 1. Ejecutar agregación contable en base de datos
      const reportData: ClosureReportPayload = await generateClosureReport(period)
      
      // 2. Resolver nombre del auditor que firma el documento
      const currentUserName = profile?.name || profile?.user || user?.email || "Sistema"

      // 3. Detonar la descarga automática del comprobante PDF estructurado
      exportClosureToPDF(reportData, currentUserName)

      return reportData
    } catch (error) {
      console.error(`Error crítico al generar el cierre de caja ${period}:`, error)
      throw error
    } finally {
      setLoader(period, false)
    }
  }

  return {
    loadingDiario,
    loadingSemanal,
    loadingMensual,
    triggerClosure
  }
}
