import { useState } from "react"

import { useCommissions } from "@/hooks/useCommission"

import { DataTable } from "@/components/common/DataTable"
import { getColumnsCommissions } from "@/components/transactions/columnsCommissions"
import CommissionModal from "@/components/transactions/CommissionModal"

import type { CommissionGroup } from "@/types/commission"

export default function Comision() {

  const {
    groups,
    loading,

    details,
    history,

    fetchDetails,
    toggleSelect,
    selectAll,
    updateCommission,

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
  // 📌 PAGAR
  // =========================================
  const handlePay = async (discount: number, detail: string) => {

    try {
      await processPayment(discount, detail)

      setOpen(false)

    } catch (error) {
      console.error("Error al pagar:", error)
    }
  }

  const columns = getColumnsCommissions(handleView)

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold italic">
          PAGO DE COMISIONES
        </h2>

      </div>

      {/* TABLA */}
      <DataTable
        data={groups}
        columns={columns}
        loading={loading}
      />

      {/* MODAL */}
      <CommissionModal
        open={open}
        onClose={() => setOpen(false)}

        details={details}
        historyCount={history.length}

        onToggle={toggleSelect}
        onSelectAll={selectAll}
        onChangeAmount={updateCommission}

        total={totalCalculated}

        onPay={handlePay}
      />

    </div>
  )
}