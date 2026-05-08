import type { SoldepoWithRelations } from "@/types/soldepo"
import { exportToExcel } from "../exportExcel"

/**
 * Exportación específica de solicitudes de depósito a Excel con estructura dinámica por Rol
 * @param filteredSoldepo Listado de solicitudes de depósito
 * @param idRole ID del rol del usuario (1, 2 = Incluye sucursal | 3 = Oculta sucursal)
 */
export const exportSoldepoToExcel = (
  filteredSoldepo: SoldepoWithRelations[],
  idRole?: number // 👈 Parámetro para evaluar el rol operativo
) => {
  // 🔒 Validar datos
  if (!filteredSoldepo || filteredSoldepo.length === 0) {
    console.warn("No existen solicitudes para exportar")
    return
  }

  // 1️⃣ ORDENAMIENTO: Primero por nombre de Sucursal (A-Z) y luego por ID (De mayor a menor)
  const solicitudesOrdenadas = [...filteredSoldepo].sort((a, b) => {
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

  // Estructura dinámica de Headers para el componente base de Excel
  const headers = [
    { key: "index", label: "N°" },
    { key: "tipo_transaccion", label: "TIPO DE TRANSACCIÓN" },
    ...(incluirSucursal ? [{ key: "sucursal", label: "SUCURSAL" }] : []), // 👈 Condicional por Rol
    { key: "empleado", label: "EMPLEADO" },
    { key: "cliente", label: "CLIENTE" },
    { key: "vehiculo", label: "VEHÍCULO" },     
    { key: "precio", label: "PRECIO FINAL" },
    { key: "cuota_inicial", label: "CUOTA INICIAL" },
    { key: "detalle", label: "DETALLE" },
    { key: "tipo_venta", label: "TIPO DE VENTA" },
    { key: "tipo_pago", label: "TIPO DE PAGO" }
  ]

  // 3️⃣ TRANSFORMACIÓN DE DATOS: Mapeo limpio respetando el ordenamiento y las columnas del rol
  const data = solicitudesOrdenadas.map((item, index) => ({
    index: index + 1,
    tipo_transaccion: item.type_transaction?.description || "Sin tipo",
    ...(incluirSucursal && { sucursal: item.branches?.name_branch || "Sin sucursal" }), // 👈 Condicional por Rol
    empleado: item.employees?.name || "Sin empleado",
    vehiculo: item.cars ? `${item.cars.marca} ${item.cars.name}` : "Sin vehículo",
    cliente: item.customers?.name || "Sin cliente",
    precio: item.costo ?? item.cars?.cost ?? 0,
    cuota_inicial: item.amount,
    detalle: item.detail || "",
    tipo_venta: item.type_sale || "No definido",
    tipo_pago: item.type_pay || "No definido"
  }))

  // 📤 Exportar
  exportToExcel({
    data,
    fileName: `Solicitudes_depositos_pendientes_${new Date().toISOString().slice(0, 10)}`,
    sheetName: "Solicitudes",
    title: "REPORTE DE SOLICITUDES DE DEPÓSITOS PENDIENTES",
    headers
  })
}
