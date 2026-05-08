import { exportToExcel } from "../exportExcel"
import type { Vehiculo } from "@/types/vehiculo"

// 🔹 Export específico de vehiculos ordenados
export const exportVehiculosToExcel = (filteredVehiculos: Vehiculo[]) => {
  
  if (!filteredVehiculos || filteredVehiculos.length === 0) return

  // 🧠 1. Clonar y aplicar ordenamiento jerárquico por 4 niveles
  const sortedVehiculos = [...filteredVehiculos].sort((a, b) => {
    // 1° Criterio: Marca (Alfabético)
    const marcaA = a.marca || ""
    const marcaB = b.marca || ""
    const compareMarca = marcaA.localeCompare(marcaB)
    if (compareMarca !== 0) return compareMarca

    // 2° Criterio: Nombre/Línea (Alfabético)
    const nameA = a.name || ""
    const nameB = b.name || ""
    const compareName = nameA.localeCompare(nameB)
    if (compareName !== 0) return compareName

    // 3° Criterio: Modelo/Año (Alfabético)
    const modeloA = a.modelo || ""
    const modeloB = b.modelo || ""
    const compareModelo = modeloA.localeCompare(modeloB)
    if (compareModelo !== 0) return compareModelo

    // 4° Criterio: Costo/Precio (Numérico de menor a mayor)
    const costA = a.cost || 0
    const costB = b.cost || 0
    return costA - costB
  })

  // 🔥 2. Transformar los datos usando el arreglo ya ORDENADO
  const data = sortedVehiculos.map((item, index) => ({
    index: index + 1, // correlativo correcto basado en el nuevo orden
    marca: item.marca,
    name: item.name,
    modelo: item.modelo,
    cost: item.cost  
  }))

  // 🚀 3. Ejecutar la descarga de la hoja de cálculo
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
