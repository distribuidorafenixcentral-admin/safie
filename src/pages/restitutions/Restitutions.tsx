import { useState } from "react"

import { useRestitutions } from "@/hooks/useRestitutions"

import { DataTable } from "@/components/common/DataTable"
import { getColumnsRestitutions } from "@/components/transactions/columnsRestitutions"
import RestitutionModal from "@/components/transactions/RestitutionModal"

import { useToast } from "@/context/ToastContext"

import type { RestitutionWithRelations } from "@/types/restitution"

export default function Restitutions() {

  const [search, setSearch] = useState("")
  const toast = useToast()

  const {
    filteredDeposits,
    handleRestitution
  } = useRestitutions(search)

  const [open, setOpen] = useState(false)
  const [selected, setSelected] =
    useState<(RestitutionWithRelations & { max_available: number }) | null>(null)

  // 📌 abrir modal
  const handleOpen = (row: any) => {
    setSelected(row)
    setOpen(true)
  }

  // 📌 submit
  const handleSubmit = async (data: any) => {
    try {

      await handleRestitution(data)

      toast("Restitución realizada correctamente", "success")

      setOpen(false)

    } catch (error: any) {
      toast(error.message || "Error al procesar", "error")
    }
  }

  const columns = getColumnsRestitutions(handleOpen)

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold italic">
          RESTITUCIONES
        </h2>

      </div>

      {/* BUSCADOR */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar..."
        className="border px-3 py-1 rounded mb-4 w-full max-w-md"
      />

      {/* TABLA */}
      <DataTable
        data={filteredDeposits}
        columns={columns}
      />

      {/* MODAL */}
      <RestitutionModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        selected={selected}
      />

    </div>
  )
}