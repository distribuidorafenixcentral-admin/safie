import { exportToPDF } from "../exportPDF"
import type { Vehiculo } from "@/types/vehiculo"

//  Export específico de vehiculos
export const exportVehiculosToPDF = (
  vehiculos: Vehiculo[],
  user: string
) => {

  if (!vehiculos || vehiculos.length === 0) return

  exportToPDF({
    title: "REPORTE DE VEHICULOS",
    fileName: "Vehiculos",
    user,
 

    headers: ["ID", "MARCA", "NOMBRE", "MODELO", "COSTO"],

   body: vehiculos.map((p, index) => [
      index + 1,
      p.marca,
      p.name,
      p.modelo,
      p.cost
    ])
  })
}