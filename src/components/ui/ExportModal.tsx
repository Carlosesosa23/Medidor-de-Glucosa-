import { useState } from 'react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppStore } from '../../store/appStore'
import { exportToPDF } from '../../utils/pdfExport'

interface ExportModalProps {
  onClose: () => void
}

type QuickRange = '7d' | '14d' | '30d' | 'thisWeek' | 'thisMonth' | 'custom'

const QUICK_RANGES: { label: string; value: QuickRange }[] = [
  { label: 'Últimos 7 días',  value: '7d'        },
  { label: 'Últimos 14 días', value: '14d'       },
  { label: 'Últimos 30 días', value: '30d'       },
  { label: 'Esta semana',     value: 'thisWeek'  },
  { label: 'Este mes',        value: 'thisMonth' },
  { label: 'Personalizado',   value: 'custom'    },
]

function resolveRange(range: QuickRange): { from: Date; to: Date } {
  const today = new Date()
  switch (range) {
    case '7d':        return { from: subDays(today, 6),                          to: today }
    case '14d':       return { from: subDays(today, 13),                         to: today }
    case '30d':       return { from: subDays(today, 29),                         to: today }
    case 'thisWeek':  return { from: startOfWeek(today, { locale: es }),         to: endOfWeek(today, { locale: es }) }
    case 'thisMonth': return { from: startOfMonth(today),                        to: endOfMonth(today) }
    default:          return { from: today,                                      to: today }
  }
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { readings, profile } = useAppStore()

  const [quickRange, setQuickRange] = useState<QuickRange>('7d')
  const [fromStr, setFromStr]       = useState<string>(format(subDays(new Date(), 6), 'yyyy-MM-dd'))
  const [toStr, setToStr]           = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [exporting, setExporting]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)

  const handleQuickRange = (range: QuickRange) => {
    setQuickRange(range)
    setError(null)
    setSuccess(false)
    if (range !== 'custom') {
      const { from, to } = resolveRange(range)
      setFromStr(format(from, 'yyyy-MM-dd'))
      setToStr(format(to, 'yyyy-MM-dd'))
    }
  }

  const handleExport = async () => {
    setError(null)
    setSuccess(false)
    const fromDate = new Date(fromStr + 'T00:00:00')
    const toDate   = new Date(toStr   + 'T23:59:59')
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      setError('Las fechas ingresadas no son válidas.')
      return
    }
    if (fromDate > toDate) {
      setError('La fecha de inicio no puede ser posterior a la de fin.')
      return
    }
    setExporting(true)
    try {
      const result = exportToPDF(readings, profile, fromDate, toDate)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => onClose(), 1800)
      } else {
        setError(result.message)
      }
    } catch (e) {
      setError('Ocurrió un error al generar el PDF.')
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const fromDate     = new Date(fromStr + 'T00:00:00')
  const toDate       = new Date(toStr   + 'T23:59:59')
  const previewCount = readings.filter(r => {
    const d = new Date(r.timestamp)
    return d >= fromDate && d <= toDate
  }).length

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50 px-4 pb-6"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl w-full max-w-sm flex flex-col"
        style={{
          background: '#ffffff',
          boxShadow: '0 24px 64px rgba(25,28,29,0.25)',
          maxHeight: 'calc(100dvh - 48px)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Cabecera verde ── */}
        <div
          className="px-5 pt-5 pb-5 flex-shrink-0 rounded-t-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d631b 0%, #1a8028 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>picture_as_pdf</span>
              </div>
              <div>
                <h2
                  className="text-base font-bold text-white leading-tight"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Exportar PDF
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  Elige el intervalo de fechas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        </div>

        <div className="px-5 pt-5 pb-5 flex flex-col gap-5 overflow-y-auto">

          {/* ── Rangos rápidos — 2 columnas ── */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#40493d] mb-3">
              Rangos rápidos
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_RANGES.map(opt => {
                const isActive = quickRange === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleQuickRange(opt.value)}
                    className="py-3 px-4 rounded-2xl text-sm font-semibold text-left transition-all active:scale-95"
                    style={{
                      background: isActive ? '#0d631b' : '#f3f4f5',
                      color:      isActive ? '#ffffff' : '#40493d',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Selector de fechas — apilado verticalmente ── */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#40493d] mb-3">
              Rango de fechas
            </p>
            <div className="flex flex-col gap-3">

              {/* Desde */}
              <div
                className="flex items-center gap-3 px-4 rounded-2xl"
                style={{ background: '#f3f4f5', height: 52 }}
              >
                <span className="material-symbols-outlined text-[#707a6c]" style={{ fontSize: 18 }}>calendar_today</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#707a6c]">Desde</span>
                  <input
                    type="date"
                    value={fromStr}
                    max={toStr}
                    onChange={e => {
                      setFromStr(e.target.value)
                      setQuickRange('custom')
                      setError(null)
                      setSuccess(false)
                    }}
                    className="bg-transparent text-sm font-bold text-[#191c1d] outline-none border-none w-full"
                    style={{ padding: 0, margin: 0 }}
                  />
                </div>
              </div>

              {/* Flecha separadora */}
              <div className="flex items-center justify-center">
                <div className="flex-1 h-px" style={{ background: '#e7e8e9' }} />
                <span className="mx-3 text-xs font-bold text-[#bfcaba]">hasta</span>
                <div className="flex-1 h-px" style={{ background: '#e7e8e9' }} />
              </div>

              {/* Hasta */}
              <div
                className="flex items-center gap-3 px-4 rounded-2xl"
                style={{ background: '#f3f4f5', height: 52 }}
              >
                <span className="material-symbols-outlined text-[#707a6c]" style={{ fontSize: 18 }}>event</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#707a6c]">Hasta</span>
                  <input
                    type="date"
                    value={toStr}
                    min={fromStr}
                    onChange={e => {
                      setToStr(e.target.value)
                      setQuickRange('custom')
                      setError(null)
                      setSuccess(false)
                    }}
                    className="bg-transparent text-sm font-bold text-[#191c1d] outline-none border-none w-full"
                    style={{ padding: 0, margin: 0 }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Preview count ── */}
          {previewCount > 0 && !error && !success && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: '#f0faf0' }}
            >
              <span
                className="material-symbols-outlined text-[#0d631b] flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}
              >
                check_circle
              </span>
              <p className="text-sm text-[#0d631b] font-semibold">
                {previewCount} medición{previewCount !== 1 ? 'es' : ''} en este período
              </p>
            </div>
          )}

          {/* ── Sin mediciones ── */}
          {previewCount === 0 && !error && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: '#fdf6ec' }}
            >
              <span className="material-symbols-outlined text-[#b06000] flex-shrink-0" style={{ fontSize: 20 }}>
                info
              </span>
              <p className="text-sm text-[#b06000] font-semibold">
                No hay mediciones en este período
              </p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: '#fff2f2' }}
            >
              <span className="material-symbols-outlined text-[#ba1a1a] flex-shrink-0" style={{ fontSize: 20 }}>error</span>
              <p className="text-sm text-[#ba1a1a] font-semibold">{error}</p>
            </div>
          )}

          {/* ── Éxito ── */}
          {success && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: '#f0faf0' }}
            >
              <span
                className="material-symbols-outlined text-[#0d631b] flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}
              >
                download_done
              </span>
              <p className="text-sm text-[#0d631b] font-semibold">¡PDF descargado correctamente!</p>
            </div>
          )}

          {/* ── Botones ── */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-[#40493d] active:scale-95 transition-all"
              style={{ background: '#f3f4f5' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || previewCount === 0}
              className="flex-[2] py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
              style={{ background: '#0d631b' }}
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generando…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                  Exportar PDF
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
