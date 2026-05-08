import type { SolicitudWithRelations } from "@/types/solicitudes"
import { exportToExcel } from "../exportExcel"

/**
 * Exportación específica de solicitudes a Excel con estructura dinámica por Rol
 * @param filteredSolicitudes Listado de solicitudes filtradas
 * @param idRole ID del rol del usuario (1, 2 = Incluye sucursal | 3 = Oculta sucursal)
 */
export const exportSolicitudesToExcel = (
  filteredSolicitudes: SolicitudWithRelations[],
  idRole?: number // 👈 Añadido para controlar la visibilidad de la sucursal
) => {
  if (!filteredSolicitudes || filteredSolicitudes.length === 0) return

  // 1️⃣ ORDENAMIENTO: Primero por nombre de Sucursal (A-Z) y luego por ID (De mayor a menor)
  const solicitudesOrdenadas = [...filteredSolicitudes].sort((a, b) => {
    const sucursalA = a.branches?.name_branch || ""
    const sucursalB = b.branches?.name_branch || ""

    const compararSucursal = sucursalA.localeCompare(sucursalB, "es", { sensitivity: "base" })

    if (compararSucursal === 0) {
      return b.id - a.id
    }

    return compararSucursal
  })

  // 2️⃣ MASCARAS DE COLUMNAS: Condición para saber si se incluye la sucursal (Roles 1 y 2)
  const incluirSucursal = idRole === 1 || idRole === 2

  // Estructura dinámica de Headers para el componente base de Excel
  const headers = [
    { key: "index", label: "N°" },
    { key: "id_type_transaction", label: "TIPO DE TRANSACCIÓN" },
    ...(incluirSucursal ? [{ key: "id_branch", label: "SUCURSAL" }] : []), // 👈 Condicional
    { key: "id_employee", label: "EMPLEADO" },
    { key: "amount", label: "MONTO" },
    { key: "detail", label: "DETALLE" }
  ]

  // 3️⃣ TRANSFORMACIÓN DE DATOS: Mapeo limpio respetando el ordenamiento y las columnas del rol
  const data = solicitudesOrdenadas.map((item, index) => ({
    index: index + 1,
    id_type_transaction: item.type_transaction?.description || "Sin tipo",
    ...(incluirSucursal && { id_branch: item.branches?.name_branch || "Sin sucursal" }), // 👈 Condicional
    id_employee: item.employees?.name || "Sin empleado",
    amount: item.amount,
    detail: item.detail || "",   
  }))

  // 4️⃣ INVOCACIÓN: Envío de parámetros a la utilidad compartida de Excel
  exportToExcel({
    data,
    fileName: `Reporte_Solicitudes_${new Date().toISOString().slice(0,10)}`,
    sheetName: "Solicitudes",
    title: "REPORTE DE SOLICITUDES",
    headers
  })
}
