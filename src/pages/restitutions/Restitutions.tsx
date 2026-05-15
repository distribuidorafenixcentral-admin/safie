import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { DataTable } from "@/components/common/DataTable"
import { FileText, FileSpreadsheet, RefreshCw } from "lucide-react"

// 🔹 Hooks y Servicios del Módulo
import { useRestituciones } from "@/hooks/useRestituciones"
import { getColumnsRestituciones } from "@/components/transactions/columnsRestituciones"
import RestitucionesModal from "@/components/transactions/RestitucionesModal"
import { getCuentas } from "@/services/cuentasService"

// 🔹 utilidades de Exportación
import { exportRestitucionesToPDF } from "@/utils/export/pdf/restitutionPdfExport"
import { exportRestitucionesToExcel } from "@/utils/export/excel/restitutionExcelExport"

import type { RestitutionWithRelations, RestitutionFilterType } from "@/types/restitution"

type CuentaCatalogo = {
  id: number
  numero_cta: string
  banco: string
  titular: string
  status: number
}

export default function Restituciones() {
  const { profile, user } = useAuth()
  const showToast = useToast()

  // 🔍 Estado local de búsqueda por texto
  const [search, setSearch] = useState<string>("")
  
  // ⚡ Hook central de restituciones
  const {
    filter,
    setFilter,
    loading,
    filteredRestituciones,
    fetchRestituciones,
    processRestitution
  } = useRestituciones(search)

  // 🏦 Catálogo de cuentas bancarias (recursos dinámicos)
  const [cuentas, setCuentas] = useState<CuentaCatalogo[]>([])

  // 🔹 Control de la Interfaz del Modal
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<RestitutionWithRelations | null>(null)

  // 🔥 1. Cargar catálogo de cuentas activas al iniciar la pantalla
  useEffect(() => {
    const loadCuentas = async () => {
      try {
        const data = await getCuentas()
        // Filtrar solo cuentas con status 1 (Activas)
        setCuentas((data || []).filter((c: any) => c.status === 1))
      } catch (err) {
        console.error("Error cargando cuentas bancarias:", err)
      }
    }
    loadCuentas()
  }, [])

  // 🔴 2. Disparar Modal de Devolución al dar clic en el icono rojo de dinero
  const handleOpenAction = (row: RestitutionWithRelations) => {
    setSelectedItem(row)
    setOpenModal(true)
  }

  // 🔥 3. Confirmar la restitución e inyectar el Tipo 9 en la BD
  const handleConfirmRestitution = async (formData: {
    amount: number
    detail: string
    type_pay: string
    id_cuenta: number | null
  }) => {
    if (!selectedItem) return

    try {
      await processRestitution({
        originId: selectedItem.id,
        id_branch: selectedItem.id_branch,
        id_employee: selectedItem.id_employee,
        id_customer: selectedItem.id_customer,
        amount: formData.amount,
        detail: formData.detail,
        type_pay: formData.type_pay,
        id_cuenta: formData.id_cuenta
      })

      showToast("¡Devolución de fondos procesada y registrada con éxito! 💸", "success")
      setOpenModal(false)
      setSelectedItem(null)
    } catch (error: any) {
      console.error(error)
      showToast("Error crítico al procesar la restitución.", "error")
    }
  }

  // =======================================================
  // 📌 GESTIÓN DE REPORTES
  // =======================================================
  const handleExportExcel = () => {
    exportRestitucionesToExcel(filteredRestituciones, filter)
  }

  const handleExportPDF = () => {
    const currentUserName = profile?.name || profile?.user || user?.email || "Sistema"
    exportRestitucionesToPDF(filteredRestituciones, filter, currentUserName)
  }

  // Obtener definición estricta de columnas inyectando el filtro actual
  const columns = getColumnsRestituciones(handleOpenAction)

  return (
    <div className="p-4 container mx-auto space-y-6">
      
      {/* 📌 SECCIÓN DE ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            Módulo de Restituciones
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Gestión de devoluciones de fondos vinculadas a depósitos comerciales.
          </p>
        </div>

        {/* Botones de acción global */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <FileText size={16} />
            Exportar PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <FileSpreadsheet size={16} />
            Exportar Excel
          </button>
          <button
            onClick={fetchRestituciones}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all"
            title="Refrescar datos manualmente"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 📌 SECCIÓN DE FILTROS SUPERIORES (PESTAÑAS) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-3 rounded-2xl border">
        
        {/* Swapper de Estados */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl gap-1 w-full sm:w-auto">
          {(["DEPOSITOS", "PAGADOS", "TODOS"] as RestitutionFilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all tracking-wider w-full sm:w-auto uppercase ${
                filter === tab
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "DEPOSITOS" ? "Aptos para Devolución" : tab === "PAGADOS" ? "Efectuados " : "Todos los registros"}
            </button>
          ))}
        </div>

        {/* Buscador de Texto */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por ID, cliente, monto..."
            className="border border-slate-300 px-4 py-2 text-xs rounded-xl w-full shadow-sm focus:outline-none focus:border-blue-500 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 📌 TABLA CENTRAL DE DATOS */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <DataTable
          data={filteredRestituciones}
          columns={columns}
          loading={loading}
        />
      </div>

      {/* 📌 MODAL DE ACCIONES ADICIONALES */}
      <RestitucionesModal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setSelectedItem(null)
        }}
        onConfirm={handleConfirmRestitution}
        selectedItem={selectedItem}
        cuentas={cuentas}
      />

    </div>
  )
}
