import { useClosure } from "@/hooks/useClosure"
import { useToast } from "@/context/ToastContext"
import { useConfirm } from "@/context/ConfirmContext"
import { 
  CalendarDays, 
  CalendarRange, 
  Calendar, 
  Loader2, 
  FileText 
} from "lucide-react"
import type { ClosurePeriodType } from "@/types/closure"

export default function Cierres() {
  const showToast = useToast()
  const confirm = useConfirm()
  
  // ⚡ Consumir el hook independiente de cierres de caja
  const {
    loadingDiario,
    loadingSemanal,
    loadingMensual,
    triggerClosure
  } = useClosure()

  // 🔥 Manejador de eventos para ejecutar la consolidación contable
  const handleProcessClosure = (period: ClosurePeriodType) => {
    // Cuadro de diálogo formal de confirmación para evitar cierres accidentales
    confirm({
      title: `Confirmar Cierre ${period}`,
      message: `¿Está seguro de que desea consolidar los movimientos y generar el reporte del periodo ${period.toLowerCase()}?`,
      confirmText: "Generar Cierre",
      onConfirm: async () => {
        try {
          await triggerClosure(period)
          showToast(`¡Cierre ${period.toLowerCase()} procesado y PDF generado con éxito! 📄✅`, "success")
        } catch (error) {
          showToast(`Error al intentar compilar el cierre ${period.toLowerCase()}.`, "error")
        }
      }
    })
  }

  return (
    <div className="p-4 container mx-auto space-y-6">
      
      {/* 📌 ENCABEZADO DEL MÓDULO */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
          Cierres de Caja y Auditoría
        </h2>
        <p className="text-slate-500 text-sm font-medium">
          Consolidación de transacciones confirmadas agrupadas por tipo de movimiento financiero.
        </p>
      </div>

      {/* 📌 PANEL CENTRAL: TRES BOTONES DE ACCIÓN INDEPENDIENTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 💵 TARJETA 1: CIERRE DIARIO */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Cierre Diario</h3>
              <p className="text-xs text-slate-400 font-medium">Filtra el rango de las últimas 24 horas</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-dashed">
            Agrupa todas las operaciones confirmadas desde las 00:00 del día de hoy hasta el momento actual.
          </p>
          <button
            type="button"
            disabled={loadingDiario || loadingSemanal || loadingMensual}
            onClick={() => handleProcessClosure("DIARIO")}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            {loadingDiario ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            {loadingDiario ? "PROCESANDO..." : "EJECUTAR CIERRE DIARIO"}
          </button>
        </div>

        {/* 💵 TARJETA 2: CIERRE SEMANAL */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <CalendarRange size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Cierre Semanal</h3>
              <p className="text-xs text-slate-400 font-medium">Rango de Lunes a Domingo actual</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-dashed">
            Consolida los balances acumulados desde el primer minuto del lunes de la presente semana.
          </p>
          <button
            type="button"
            disabled={loadingDiario || loadingSemanal || loadingMensual}
            onClick={() => handleProcessClosure("SEMANAL")}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            {loadingSemanal ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            {loadingSemanal ? "PROCESANDO..." : "EJECUTAR CIERRE SEMANAL"}
          </button>
        </div>

        {/* 💵 TARJETA 3: CIERRE MENSUAL */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Cierre Mensual</h3>
              <p className="text-xs text-slate-400 font-medium">Del día 1 al último del mes en curso</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-dashed">
            Audita el balance general neto de ingresos y egresos de caja de todo el mes de manera agrupada.
          </p>
          <button
            type="button"
            disabled={loadingDiario || loadingSemanal || loadingMensual}
            onClick={() => handleProcessClosure("MENSUAL")}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            {loadingMensual ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            {loadingMensual ? "PROCESANDO..." : "EJECUTAR CIERRE MENSUAL"}
          </button>
        </div>

      </div>
    </div>
  )
}
