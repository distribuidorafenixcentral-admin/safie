

import jsPDF from "jspdf"

// Encabezado
type HeaderData = {
  title: string
  subtitle?: string
  date?: string
  logo?: string
  user?: string
}

// 📌 Datos del memorándum
type MemoData = {
  fecha: string
  sucursal: string
  nombre: string
  cargo: string
  motivo: string 
  banco: string
  tpago: string
  cta: string
  titular: string
  monto: number  
}

// 📌 Datos del usuarios
type UserData = {
  usuario: string 
  cargo_user:string
}

export const generatePDF = (
  header: HeaderData,
  data: MemoData,
  userdata: UserData, 
) => {
  const doc = new jsPDF()

  // 📌 LOGO
  if (header.logo) {
    doc.addImage(header.logo, "PNG", 10, 10, 25, 25)
  }

  // 📌 TITULO
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(header.title, 105, 20, { align: "center" })

  // 📌 SUBTITULO
  if (header.subtitle) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(header.subtitle, 105, 25, { align: "center" })
  }

  // 📌 FECHA
  if (header.user) {   
    doc.setFontSize(8)
    doc.text(`User: ${header.user}`, 165, 29)
  }

   // 📌 USUARIO
  if (header.date) {
    doc.setFontSize(8)
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
  doc.setFont("helvetica", "bold")
  doc.text("DATOS DE LA SANCIÓN", 10, y)
  doc.text("FORMA DE PAGO", 90, y)

  y += 8
  
  doc.text("Fecha:", 10, y)
  doc.text("T. Pago", 90, y)
  doc.setFont("helvetica", "normal")
  doc.text(data.fecha, 30, y)
  doc.text(data.tpago, 130, y)

  y += 6
  doc.setFont("helvetica", "bold")
  doc.text("Sucursal:", 10, y)
  doc.text("Banco", 90, y)
  doc.setFont("helvetica", "normal")
  doc.text(data.sucursal, 30, y)
  doc.text(data.banco, 130, y)

  y += 6
  doc.setFont("helvetica", "bold")
  doc.text("Nombre:", 10, y)
  doc.text("N° Cuenta / Titular:", 90, y)
  doc.setFont("helvetica", "normal")
  doc.text(data.nombre, 30, y)
  doc.text(`${String(data.cta)}   -   ${data.titular}`, 130, y)

  y += 6
  doc.setFont("helvetica", "bold")
  doc.text("Cargo:", 10, y)
  doc.text("Monto:", 90, y)
  doc.setFont("helvetica", "normal")
  doc.text(data.cargo, 30, y)
  doc.text(`Bs. ${data.monto.toLocaleString("es-BO")}`, 130, y)

  // 📌 SEPARADOR
  y += 5
  doc.line(10, y, 200, y)

  // 📌 ASUNTO
  y += 8

  doc.setFont("helvetica", "normal")

  const texto = `Reciba usted un cordial saludo.

Sirva el presente para comunicarle de manera oficial que, tras el análisis de las actividades recientes, se ha procedido a la entrega de este memorándum de incidencia.
La naturaleza de esta comunicación responde al motivo detallado a continuación y busca asegurar el cumplimiento de los estándares de la institución:

${data.motivo}

Se deja constancia para fines administrativos y se solicita tomar las acciones correspondientes para no volver a incurrir en la falta mencionada.
Sin otrp articular, me despido atentamente.`

  const textLines = doc.splitTextToSize(texto, 180)

  doc.text(textLines, 10, y)

  // 📌 FIRMA
  y += textLines.length * 6 + 25

  doc.line(70, y, 140, y)

  y += 6
  doc.setFontSize(10)
  doc.text(userdata.usuario, 105, y, { align: "center" })

  y += 5
  doc.setFont("helvetica", "bold")
  doc.text(userdata.cargo_user, 105, y, { align: "center" })

  // =====================================
  // 📌 FOOTER
  // =====================================

  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
    doc.text(`Página ${i} de ${pageCount}`, 180, 290)
  }

  return doc
}