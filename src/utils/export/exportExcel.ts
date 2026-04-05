import * as XLSX from "xlsx"

type ExportExcelOptions = {
  data: any[]
  fileName?: string
  sheetName?: string
  headers?: { key: string; label: string }[]
  title?: string
}

export const exportToExcel = ({
  data,
  fileName = "Reporte",
  sheetName = "Datos",
  headers,
  title
}: ExportExcelOptions) => {

  if (!data || data.length === 0) return

  let formattedData = data

  // 🔹 Mapear headers
  if (headers && headers.length > 0) {
    formattedData = data.map(row => {
      const newRow: any = {}
      headers.forEach(h => {
        newRow[h.label] = row[h.key]
      })
      return newRow
    })
  }

  // 🔹 Crear hoja VACÍA
  const ws = XLSX.utils.aoa_to_sheet([])

  // 🔥 1. Insertar título en A1
  if (title) {
    XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" })
  }

  // 🔥 2. Insertar datos desde A2
  XLSX.utils.sheet_add_json(ws, formattedData, {
    origin: "A2",
    skipHeader: false
  })

  // 🔥 3. Merge del título
  if (title) {
    const colCount = Object.keys(formattedData[0]).length

    ws["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: colCount - 1 }
      }
    ]
  }

  // 🔹 Auto width columnas
  const colWidths = Object.keys(formattedData[0]).map(key => ({
    wch: Math.max(
      key.length,
      ...formattedData.map((row: any) =>
        row[key] ? row[key].toString().length : 10
      )
    ) + 2
  }))

  ws["!cols"] = colWidths

  // 🔹 Crear libro
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // 🔹 Descargar
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}