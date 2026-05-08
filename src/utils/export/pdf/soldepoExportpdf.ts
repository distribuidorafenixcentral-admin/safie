import { exportToPDF } from "../exportPDF"
import type { SoldepoWithRelations } from "@/types/soldepo"

/**
 * Exportación específica de solicitudes de depósito a PDF con estructura dinámica por Rol
 * @param solicitudes Listado de solicitudes de depósito
 * @param user Nombre o correo del usuario que genera el reporte
 * @param idRole ID del rol del usuario (1, 2 = Incluye sucursal | 3 = Oculta sucursal)
 */
export const exportSoldepoToPDF = (
  solicitudes: SoldepoWithRelations[],
  user: string,
  idRole?: number // 👈 Parámetro para evaluar el rol operativo
) => {
  if (!solicitudes || solicitudes.length === 0) return

  // 1️⃣ ORDENAMIENTO: Primero por nombre de Sucursal (A-Z) y luego por ID (De mayor a menor)
  const solicitudesOrdenadas = [...solicitudes].sort((a, b) => {
    const sucursalA = a.branches?.name_branch || ""
    const sucursalB = b.branches?.name_branch || ""

    const compararSucursal = sucursalA.localeCompare(sucursalB, "es", { sensitivity: "base" })

    if (compararSucursal === 0) {
      return b.id - a.id
    }

    return compararSucursal
  })

  // 2️⃣ MÁSCARA DE COLUMNAS: Condición para saber si se incluye la sucursal (Roles 1 y 2)
  const incluirSucursal = idRole === 1 || idRole === 2

  // Estructura dinámica de cabeceras en PDF
  const headers = incluirSucursal
    ? ["N°", "TIPO", "SUCURSAL", "EMPLEADO", "VEHÍCULO", "CLIENTE", "CUOTA INICIAL", "DETALLE", "TIPO VENTA", "TIPO PAGO"]
    : ["N°", "TIPO", "EMPLEADO", "VEHÍCULO", "CLIENTE", "CUOTA INICIAL", "DETALLE", "TIPO VENTA", "TIPO PAGO"]

  // 3️⃣ TRANSFORMACIÓN DEL CUERPO DE LA TABLA
  const body = solicitudesOrdenadas.map((solicitud, index) => {
    // Formateadores monetarios limpios
    const cuotaFormateada = new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(solicitud.amount)

    if (incluirSucursal) {
      return [
        index + 1,
        solicitud.type_transaction?.description || "Sin tipo",
        solicitud.branches?.name_branch || "Sin sucursal",
        solicitud.employees?.name || "Sin empleado",
        solicitud.cars ? `${solicitud.cars.marca} ${solicitud.cars.name}` : "Sin vehículo",
        solicitud.customers?.name || "Sin cliente",  
        cuotaFormateada,
        solicitud.detail || "",
        solicitud.type_sale || "No definido",
        solicitud.type_pay || "No definido"
      ]
    } else {
      // Retorna el arreglo omitiendo la columna de sucursal para Rol 3
      return [
        index + 1,
        solicitud.type_transaction?.description || "Sin tipo",
        solicitud.employees?.name || "Sin empleado",
        solicitud.cars ? `${solicitud.cars.marca} ${solicitud.cars.name}` : "Sin vehículo",
        solicitud.customers?.name || "Sin cliente",  
        cuotaFormateada,
        solicitud.detail || "",
        solicitud.type_sale || "No definido",
        solicitud.type_pay || "No definido"
      ]
    }
  })

  // 📤 Invocación a la utilidad compartida de PDF
  exportToPDF({
    title: "REPORTE DE SOLICITUDES DE DEPOSITOS PENDIENTES",
    fileName: `Solicitudes_depositos_pendientes_${new Date().toISOString().slice(0, 10)}`,
    user,
    headers,
    body
  })
}
