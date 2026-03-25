import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type HeaderData = {
  title: string
  subtitle?: string
  date?: string
  logo?: string
}

type TableData = {
  head: string[]
  body: any[][]
}

export const generatePDF = (
  header: HeaderData,
  table: TableData
) => {
  const doc = new jsPDF()

  // 📌 LOGO
  if (header.logo) {
    doc.addImage(header.logo, "PNG", 10, 10, 30, 30)
  }

  // 📌 TITULO
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(header.title, 105, 15, { align: "center" })

  // 📌 SUBTITULO
  if (header.subtitle) {
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(header.subtitle, 105, 22, { align: "center" })
  }

  // 📌 FECHA
  if (header.date) {
    doc.setFontSize(10)
    doc.text(`Fecha: ${header.date}`, 160, 10)
  }

  // 📌 LINEA
  doc.line(10, 40, 200, 40)

  // 📌 TABLA
  autoTable(doc, {
    startY: 45,
    head: [table.head],
    body: table.body,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 102, 204] }
  })

  // 📌 FOOTER
  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.text(`Página ${i} de ${pageCount}`, 180, 290)
  }

  return doc
}