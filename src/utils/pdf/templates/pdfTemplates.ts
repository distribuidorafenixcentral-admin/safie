import jsPDF from "jspdf"

// Encabezado
type HeaderData = {
  title: string
  subtitle?: string
  date?: string
  logo?: string
}

// 📌 Datos del memorándum
type MemoData = {
  fecha: string
  sucursal: string
  nombre: string
  cargo: string
  motivo: string
  gerente: string
}

export const generatePDF = (
  header: HeaderData,
  data: MemoData
) => {
  const doc = new jsPDF()

  // 📌 LOGO
  if (header.logo) {
    doc.addImage(header.logo, "PNG", 10, 10, 25, 25)
  }

  // 📌 TITULO
  doc.setFont("helvetica", "normal")
  doc.setFontSize(18)
  doc.text(header.title, 105, 20, { align: "center" })

  // 📌 SUBTITULO
  if (header.subtitle) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(header.subtitle, 105, 25, { align: "center" })
  }

  // 📌 FECHA
  if (header.date) {
    doc.setFontSize(10)
    doc.text(`Date: ${header.date}`, 165, 33)
  }

  // 📌 LINEA
  doc.line(10, 36, 200, 36)

  // =====================================
  // 📌 CONTENIDO MEMORÁNDUM
  // =====================================

  let y = 15

  y += 20
  y += 10

  // 📌 DATOS
  doc.setFontSize(11)
  doc.text("DATOS DEL PERSONAL:", 10, y)

  y += 8
  doc.setFont("helvetica", "bold")

  doc.text("Fecha:", 10, y)
  doc.text(data.fecha, 50, y)

  y += 6
  doc.text("Sucursal:", 10, y)
  doc.text(data.sucursal, 50, y)

  y += 6
  doc.text("Nombre:", 10, y)
  doc.text(data.nombre, 50, y)

  y += 6
  doc.text("Cargo:", 10, y)
  doc.text(data.cargo, 50, y)

  // 📌 SEPARADOR
  y += 5
  doc.line(10, y, 200, y)

  // 📌 ASUNTO
  y += 10

  doc.setFont("helvetica", "bold")
  doc.text("ASUNTO:", 10, y)

  y += 8

  doc.setFont("helvetica", "normal")

  const texto = `Por medio del presente, se comunica lo siguiente:

${data.motivo}

Se deja constancia para fines administrativos y se solicita tomar las acciones correspondientes para no volver a incurrir en la falta mencionada.
Sin otrp articular, me despido atentamente.`

  const textLines = doc.splitTextToSize(texto, 180)

  doc.text(textLines, 10, y)

  // 📌 FIRMA
  y += textLines.length * 6 + 25

  doc.line(60, y, 140, y)

  y += 6
  doc.setFontSize(10)
  doc.text(data.gerente, 105, y, { align: "center" })

  y += 5
  doc.text("GERENTE", 105, y, { align: "center" })

  // =====================================
  // 📌 FOOTER
  // =====================================

  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.text(`Página ${i} de ${pageCount}`, 180, 290)
  }

  return doc
}