import { exportToPDF } from "../exportPDF"
import type { SolicitudWithRelations } from "@/types/solicitudes"

/**
 * Exportación específica de solicitudes a PDF con estructura dinámica por Rol
 * @param solicitudes Listado de solicitudes a exportar
 * @param user Nombre o correo del usuario que genera el reporte
 * @param idRole ID del rol del usuario (1, 2 = Incluye sucursal | 3 = Oculta sucursal)
 */
export const exportSolicitudesToPDF = (
  solicitudes: SolicitudWithRelations[],
  user: string,
  idRole?: number // 👈 Añadido para controlar la visibilidad de las columnas
) => {
  if (!solicitudes || solicitudes.length === 0) return

  // 1️⃣ ORDENAMIENTO: Primero por nombre de Sucursal (A-Z) y luego por ID (Descendiente / Mayor a menor)
  const solicitudesOrdenadas = [...solicitudes].sort((a, b) => {
    const sucursalA = a.branches?.name_branch || ""
    const sucursalB = b.branches?.name_branch || ""

    // Comparación primaria por sucursal
    const compararSucursal = sucursalA.localeCompare(sucursalB, "es", { sensitivity: "base" })

    // Si pertenecen a la misma sucursal (o ambos son vacíos), ordena por ID de mayor a menor
    if (compararSucursal === 0) {
      return b.id - a.id
    }

    return compararSucursal
  })

  // 2️⃣ MASCARAS/FILTROS DE COLUMNAS: Condición para saber si se incluye la sucursal (Roles 1 y 2)
  const incluirSucursal = idRole === 1 || idRole === 2

  // Estructura dinámica de cabeceras
  const headers = incluirSucursal
    ? ["N°", "TIPO", "SUCURSAL", "EMPLEADO", "MONTO", "DETALLE"]
    : ["N°", "TIPO", "EMPLEADO", "MONTO", "DETALLE"]

  // Estructura dinámica del cuerpo de la tabla
  const body = solicitudesOrdenadas.map((solicitud, index) => {
    // Formateador de moneda local para el campo amount
    const montoFormateado = new Intl.NumberFormat("es-BO", {
      minimumFractionDigits: 2,
    }).format(solicitud.amount)

    if (incluirSucursal) {
      return [
        index + 1,
        solicitud.type_transaction?.description || "Sin tipo",
        solicitud.branches?.name_branch || "Sin sucursal",
        solicitud.employees?.name || "Sin empleado",
        montoFormateado,
        solicitud.detail || ""
      ]
    } else {
      // Retorna el arreglo omitiendo la columna de sucursal para Rol 3
      return [
        index + 1,
        solicitud.type_transaction?.description || "Sin tipo",
        solicitud.employees?.name || "Sin empleado",
        montoFormateado,
        solicitud.detail || ""
      ]
    }
  })

  // 3️⃣ INVOCACIÓN: Envío de parámetros estructurados a la utilidad compartida
  exportToPDF({
    title: "REPORTE DE SOLICITUDES",
    fileName: `Reporte_Solicitudes_${new Date().toISOString().slice(0,10)}`,
    user,
    headers,
    body
  })
}
