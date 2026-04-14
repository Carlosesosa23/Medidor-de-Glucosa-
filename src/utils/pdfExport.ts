import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { startOfDay, endOfDay } from 'date-fns'
import type { GlucoseReading, UserProfile } from '../types/glucose'
import { MEAL_CONTEXT_LABELS } from '../types/glucose'
import { getAverage, getMax, getMin } from './glucoseUtils'

// ── Paleta de colores ──────────────────────────────────────────────────────
const COLORS = {
  primary:    [13, 99, 27]    as [number, number, number],  // verde oscuro
  secondary:  [64, 73, 61]    as [number, number, number],  // verde gris
  surface:    [248, 249, 250] as [number, number, number],  // gris muy claro
  white:      [255, 255, 255] as [number, number, number],
  border:     [220, 225, 218] as [number, number, number],
  text:       [25, 28, 29]    as [number, number, number],
  textMuted:  [112, 122, 108] as [number, number, number],
  // estados
  normal:     [171, 244, 172] as [number, number, number],
  normalText: [46, 114, 56]   as [number, number, number],
  high:       [255, 221, 180] as [number, number, number],
  highText:   [99, 63, 0]     as [number, number, number],
  veryHigh:   [255, 218, 214] as [number, number, number],
  veryHighText:[147, 0, 10]   as [number, number, number],
  low:        [255, 221, 180] as [number, number, number],
  lowText:    [99, 63, 0]     as [number, number, number],
  veryLow:    [255, 218, 214] as [number, number, number],
  veryLowText:[147, 0, 10]    as [number, number, number],
}

const STATUS_LABELS: Record<string, string> = {
  normal:    'Normal',
  high:      'Alto',
  very_high: 'Muy alto',
  pre_high:  'Pre-alto',
  low:       'Bajo',
  very_low:  'Muy bajo',
}

function getStatusColors(status: string): { fill: [number,number,number]; text: [number,number,number] } {
  switch (status) {
    case 'normal':    return { fill: COLORS.normal,   text: COLORS.normalText }
    case 'high':      return { fill: COLORS.high,     text: COLORS.highText }
    case 'very_high': return { fill: COLORS.veryHigh, text: COLORS.veryHighText }
    case 'pre_high':  return { fill: COLORS.high,     text: COLORS.highText }
    case 'low':       return { fill: COLORS.low,      text: COLORS.lowText }
    case 'very_low':  return { fill: COLORS.veryLow,  text: COLORS.veryLowText }
    default:          return { fill: COLORS.surface,  text: COLORS.secondary }
  }
}

// ── Strip emojis from strings (jsPDF standard fonts don't support them) ────
function stripEmoji(str: string): string {
  // Remove common emoji ranges
  return str
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .trim()
}

// ── Función principal de exportación ──────────────────────────────────────
export function exportToPDF(
  readings: GlucoseReading[],
  profile: UserProfile | null,
  fromDate: Date,
  toDate: Date,
) {
  // Filtrar por rango de fechas
  const from = startOfDay(fromDate)
  const to   = endOfDay(toDate)
  const filtered = readings
    .filter(r => {
      const d = new Date(r.timestamp)
      return d >= from && d <= to
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  if (filtered.length === 0) {
    return { success: false, message: 'No hay mediciones en el rango seleccionado.' }
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 18

  // ── HEADER ──────────────────────────────────────────────────────────────
  // Banda verde superior
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageW, 38, 'F')

  // Icono circular
  doc.setFillColor(255, 255, 255, 0.15)
  doc.circle(margin + 8, 19, 8, 'F')
  doc.setTextColor(...COLORS.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('G', margin + 5.5, 22)

  // Título
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...COLORS.white)
  doc.text('Reporte de Glucosa', margin + 20, 16)

  // Nombre del usuario
  if (profile?.name) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 230, 200)
    doc.text(profile.name, margin + 20, 23)
  }

  // Rango de fechas en header
  const fromStr = format(fromDate, "d 'de' MMMM yyyy", { locale: es })
  const toStr   = format(toDate,   "d 'de' MMMM yyyy", { locale: es })
  doc.setFontSize(8)
  doc.setTextColor(200, 230, 200)
  doc.text(`${fromStr} — ${toStr}`, margin + 20, 30)

  // Fecha de generación (derecha)
  doc.setFontSize(7)
  doc.setTextColor(180, 220, 180)
  const generatedAt = format(new Date(), "d MMM yyyy, HH:mm", { locale: es })
  doc.text(`Generado: ${generatedAt}`, pageW - margin, 16, { align: 'right' })

  // ── ESTADÍSTICAS ────────────────────────────────────────────────────────
  let y = 48

  // Título sección
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.primary)
  doc.text('Resumen del período', margin, y)

  y += 6

  // Calcular stats
  const avg = getAverage(filtered)
  const maxR = getMax(filtered)
  const minR = getMin(filtered)
  const normalCount = filtered.filter(r => r.status === 'normal').length
  const inRangePct = Math.round((normalCount / filtered.length) * 100)

  const stats = [
    { label: 'Total mediciones', value: String(filtered.length) },
    { label: 'Promedio',         value: `${avg} mg/dL` },
    { label: 'Máximo',           value: maxR ? `${maxR.value} mg/dL` : '—' },
    { label: 'Mínimo',           value: minR ? `${minR.value} mg/dL` : '—' },
    { label: 'En rango normal',  value: `${inRangePct}%` },
  ]

  const cardW = (pageW - margin * 2 - 8) / stats.length
  stats.forEach((s, i) => {
    const x = margin + i * (cardW + 2)

    // Fondo tarjeta
    doc.setFillColor(...COLORS.surface)
    doc.roundedRect(x, y, cardW, 18, 2, 2, 'F')

    // Valor grande
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.primary)
    doc.text(s.value, x + cardW / 2, y + 8, { align: 'center' })

    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(s.label, x + cardW / 2, y + 14, { align: 'center' })
  })

  y += 26

  // ── TABLA DE MEDICIONES ─────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.primary)
  doc.text('Mediciones', margin, y)

  y += 4

  // Agrupar por día
  const grouped = new Map<string, GlucoseReading[]>()
  filtered.forEach(r => {
    const key = format(new Date(r.timestamp), 'EEEE d MMM yyyy', { locale: es })
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(r)
  })

  grouped.forEach((dayReadings, dayLabel) => {
    // Verificar si queda espacio, si no, nueva página
    if (y > pageH - 60) {
      doc.addPage()
      y = 20
    }

    // Cabecera de día
    doc.setFillColor(...COLORS.primary)
    doc.roundedRect(margin, y, pageW - margin * 2, 7, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLORS.white)
    doc.text(dayLabel.toUpperCase(), margin + 4, y + 5)
    doc.text(`${dayReadings.length} medición${dayReadings.length !== 1 ? 'es' : ''}`, pageW - margin - 4, y + 5, { align: 'right' })

    y += 9

    // Tabla del día
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Hora', 'Glucosa', 'Estado', 'Contexto', 'Notas']],
      body: dayReadings.map(r => [
        format(new Date(r.timestamp), 'HH:mm'),
        `${r.value} mg/dL`,
        STATUS_LABELS[r.status ?? 'normal'] ?? r.status ?? '',
        stripEmoji(MEAL_CONTEXT_LABELS[r.mealContext]),
        r.notes ?? '',
      ]),
      headStyles: {
        fillColor: [232, 245, 233],
        textColor: COLORS.secondary,
        fontStyle: 'bold',
        fontSize: 7.5,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        lineColor: COLORS.border,
        lineWidth: 0.3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.text,
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        lineColor: COLORS.border,
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [252, 253, 252],
      },
      columnStyles: {
        0: { cellWidth: 18 },                    // Hora
        1: { cellWidth: 28, fontStyle: 'bold' }, // Glucosa
        2: { cellWidth: 22 },                    // Estado
        3: { cellWidth: 40 },                    // Contexto
        4: { cellWidth: 'auto' },                // Notas
      },
      didParseCell: (data) => {
        // Colorear celda de estado
        if (data.section === 'body' && data.column.index === 2) {
          const status = dayReadings[data.row.index]?.status ?? 'normal'
          const { fill, text } = getStatusColors(status)
          data.cell.styles.fillColor = fill
          data.cell.styles.textColor = text
          data.cell.styles.fontStyle = 'bold'
        }
        // Negrita para valor de glucosa
        if (data.section === 'body' && data.column.index === 1) {
          const status = dayReadings[data.row.index]?.status ?? 'normal'
          const { text } = getStatusColors(status)
          data.cell.styles.textColor = text
        }
      },
      theme: 'grid',
    })

    y = (doc as any).lastAutoTable.finalY + 8
  })

  // ── FOOTER en cada página ────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(...COLORS.surface)
    doc.rect(0, pageH - 12, pageW, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textMuted)
    doc.text('GlucosaTracker — Datos personales, solo para uso personal', margin, pageH - 5)
    doc.text(`${p} / ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' })
  }

  // ── DESCARGAR ────────────────────────────────────────────────────────────
  const fileName = `glucosa_${format(fromDate, 'dd-MM-yyyy')}_al_${format(toDate, 'dd-MM-yyyy')}.pdf`
  doc.save(fileName)

  return { success: true, message: `PDF exportado: ${fileName}` }
}
