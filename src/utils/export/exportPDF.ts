import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type ExportPDFOptions = {
  title: string
  headers: string[]
  body: any[][]
  fileName?: string
  user?: string
}

export const exportToPDF = ({
  title,
  headers,
  body,
  fileName = "Reporte",
  user = "Sistema",
  
}: ExportPDFOptions) => {

  if (!body || body.length === 0) return

  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.getWidth()

  // 🔹 Fecha actual formato DD/MM/YYYY
  const today = new Date()
  const formattedDate = today.toLocaleDateString("es-ES")

  let startY = 20


  // 🔥 TÍTULO
  doc.setFontSize(16)
  doc.text(title, pageWidth / 2, 15, { align: "center" })

  // 🔹 INFO GENERAL
  doc.setFontSize(10)
  doc.text(`Usuario: ${user}`, 14, startY + 10)
  doc.text(`Fecha: ${formattedDate}`, 14, startY + 16)

  // 🔹 LÍNEA
  doc.line(14, startY + 20, pageWidth - 14, startY + 20)

  // 🔥 TABLA
  autoTable(doc, {
    startY: startY + 25,
    head: [headers],
    body: body,
    styles: {
      fontSize: 9
    },
    headStyles: {
      fillColor: [41, 128, 185]
    }
  })

  doc.save(`${fileName}.pdf`)
}