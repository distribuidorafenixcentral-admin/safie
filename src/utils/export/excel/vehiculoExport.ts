import { exportToExcel } from "../exportExcel"
import type { Vehiculo } from "@/types/vehiculo"

// 🔹 Export específico de vehiculos
export const exportVehiculosToExcel = (filteredVehiculos: Vehiculo[]) => {
      // 🔥 Transformar datos (agregar correlativo)
  const data = filteredVehiculos.map((item, index) => ({
    index: index + 1, //  correlativo
    marca: item.marca,
    name: item.name,
    modelo: item.modelo,
    cost: item.cost  
  }))

  exportToExcel({
    data,
    fileName: "Vehiculos",  
    sheetName: "Vehiculos",
    title: "REPORTE DE VEHICULOS",
    headers: [
      { key: "index", label: "N°" },
      { key: "marca", label: "MARCA" },
      { key: "name", label: "NOMBRE" },
      { key: "modelo", label: "MODELO" },
      { key: "cost", label: "COSTO" }
    ]
  })
}
