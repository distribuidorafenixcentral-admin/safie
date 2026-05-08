import { exportToPDF } from "../exportPDF"
import type { Vehiculo } from "@/types/vehiculo"

// Export específico de vehiculos ordenados
export const exportVehiculosToPDF = (
  vehiculos: Vehiculo[],
  user: string
) => {

  if (!vehiculos || vehiculos.length === 0) return

  // 🧠 Clonar y aplicar ordenamiento jerárquico por 4 niveles
  const sortedVehiculos = [...vehiculos].sort((a, b) => {
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

    // 3° Criterio: Modelo/Año (Alfabético/Numérico como cadena)
    const modeloA = a.modelo || ""
    const modeloB = b.modelo || ""
    const compareModelo = modeloA.localeCompare(modeloB)
    if (compareModelo !== 0) return compareModelo

    // 4° Criterio: Costo/Precio (Numérico de menor a mayor)
    const costA = a.cost || 0
    const costB = b.cost || 0
    return costA - costB
  })

  exportToPDF({
    title: "REPORTE DE VEHICULOS",
    fileName: "Vehiculos",
    user,

    headers: ["ID", "MARCA", "NOMBRE", "MODELO", "COSTO"],

    // 📋 Mapeamos el arreglo ya ordenado
    body: sortedVehiculos.map((p, index) => [
      index + 1,
      p.marca,
      p.name,
      p.modelo,
      p.cost
    ])
  })
}
