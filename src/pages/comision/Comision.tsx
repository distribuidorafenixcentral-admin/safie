import { useState } from "react"
import { useCommissions } from "@/hooks/useCommission"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"

import { DataTable } from "@/components/common/DataTable"
import { getColumnsCommissions } from "@/components/transactions/columnsCommissions"
import CommissionModal from "@/components/transactions/CommissionModal"

import { FileSpreadsheet } from "lucide-react"

// 🔹 Exports
import { exportCommissionGroupsToExcel } from "@/utils/export/excel/commissionExcelExport"
import { exportCommissionLiquidationToPDF } from "@/utils/export/pdf/commissionExportpdf"

import type { CommissionGroup } from "@/types/commission"

export default function Comision() {
  const { profile, user } = useAuth()
  const showToast = useToast()

  const {
    groups,
    loading,
    details,
    history,
    fetchDetails,
    toggleSelect,
    selectAll,
    updateCommissionValue,
    totalCalculated,
    processPayment
  } = useCommissions()

  const [open, setOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<CommissionGroup | null>(null)

  // =========================================
  // 📌 ABRIR MODAL
  // =========================================
  const handleView = async (group: CommissionGroup) => {
    setSelectedGroup(group)
    await fetchDetails(group.id_employee, group.id_branch)
    setOpen(true)
  }

  // =========================================
  // 📌 PROCESAR PAGO Y GENERAR PDF 🔥
  // =========================================
  const handlePay = async (discount: number, detail: string) => {
    if (!selectedGroup) return

    try {
      // 1. Registrar en Base de Datos (Transacción Tipo 4 + Update Hijos)
      await processPayment({
        id_employee: selectedGroup.id_employee,
        id_branch: selectedGroup.id_branch,
        id_cuenta: null, 
        type_pay: "Efectivo", 
        discount: discount,
        detail: detail || `Liquidación comisiones - ${selectedGroup.employee_name}`
      })

      // 2. Preparar datos para el Comprobante PDF
      const currentUserName = profile?.name || profile?.user || user?.email || "Sistema"
      const selectedItems = details.filter(d => d.selected)

      // 3. Generar PDF Automáticamente
      exportCommissionLiquidationToPDF(
        selectedItems,
        selectedGroup.employee_name,
        { 
          calculated: totalCalculated, 
          discount: discount, 
          final: totalCalculated - discount 
        },
        currentUserName 
      )

      showToast("Comisiones pagadas y comprobante generado ✅", "success")
      
      // 4. Cerrar y limpiar estados
      setOpen(false)
      setSelectedGroup(null)

    } catch (error) {
      console.error("Error en liquidación:", error)
      showToast("No se pudo completar el pago", "error")
    }
  }

  // =========================================
  // 📌 EXPORTACIÓN EXCEL
  // =========================================
  const handleExcel = () => exportCommissionGroupsToExcel(groups)

  const columns = getColumnsCommissions(handleView)

  return (
    <div className="p-4 container mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            Pago de Comisiones
          </h2>
          <p className="text-slate-500 text-sm italic">Seleccione un empleado para liquidar sus depósitos confirmados.</p>
        </div>

        <button
          onClick={handleExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
        >
          <FileSpreadsheet size={18} />
          Reporte Excel
        </button>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <DataTable
          data={groups}
          columns={columns}
          loading={loading}
        />
      </div>

      {/* MODAL DE PAGO */}
      <CommissionModal
        open={open}
        onClose={() => {
          setOpen(false)
          setSelectedGroup(null)
        }}

        details={details}
        historyCount={history.length}

        onToggle={toggleSelect}
        onSelectAll={selectAll}
        onChangeAmount={updateCommissionValue}

        total={totalCalculated}
        onPay={handlePay}
      />
    </div>
  )
}
