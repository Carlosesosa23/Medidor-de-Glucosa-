import { useState, useMemo } from 'react'
import { useAppStore } from '../store/appStore'
import { MEAL_CONTEXT_LABELS } from '../types/glucose'
import { formatDateTime } from '../utils/glucoseUtils'
import { Trash2 } from 'lucide-react'
import type { GlucoseReading, GlucoseStatus } from '../types/glucose'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExportModal } from '../components/ui/ExportModal'

const FILTER_OPTIONS: { label: string; value: 'all' | GlucoseStatus }[] = [
  { label: 'Todos',    value: 'all'       },
  { label: 'Normal',   value: 'normal'    },
  { label: 'Alto',     value: 'high'      },
  { label: 'Muy alto', value: 'very_high' },
  { label: 'Pre-alto', value: 'pre_high'  },
  { label: 'Bajo',     value: 'low'       },
  { label: 'Muy bajo', value: 'very_low'  },
]

const STATUS_BADGE_BG: Record<string, string> = {
  normal:    '#abf4ac',
  high:      '#ffddb4',
  very_high: '#ffdad6',
  pre_high:  '#ffddb4',
  low:       '#abf4ac',
  very_low:  '#ffdad6',
}
const STATUS_BADGE_TEXT: Record<string, string> = {
  normal:    '#2e7238',
  high:      '#633f00',
  very_high: '#93000a',
  pre_high:  '#633f00',
  low:       '#2e7238',
  very_low:  '#93000a',
}
const STATUS_LABEL: Record<string, string> = {
  normal:    'Normal',
  high:      'Alto',
  very_high: 'Muy alto',
  pre_high:  'Pre-alto',
  low:       'Bajo',
  very_low:  'Muy bajo',
}

function groupByDate(readings: GlucoseReading[]) {
  const groups = new Map<string, typeof readings>()
  readings.forEach(r => {
    const key = format(new Date(r.timestamp), 'EEEE, d MMM', { locale: es })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  })
  return groups
}

export function History() {
  const { readings, deleteReading } = useAppStore()
  const [filter, setFilter] = useState<'all' | GlucoseStatus>('all')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [showExport, setShowExport] = useState(false)

  const filtered = useMemo(() => {
    let result = filter === 'all' ? readings : readings.filter(r => r.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.value.toString().includes(q) ||
        MEAL_CONTEXT_LABELS[r.mealContext].toLowerCase().includes(q) ||
        (r.notes ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }, [readings, filter, search])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  const handleDelete = async (id: number) => {
    await deleteReading(id)
    setConfirmDelete(null)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto pb-6 bg-[#f8f9fa]">

      {/* ── TopAppBar ── */}
      <header className="pt-12 pb-2 bg-[#f8f9fa]">
        <div className="flex items-center justify-between px-5">
          <div>
            <h1
              className="font-bold tracking-tight text-2xl text-[#191c1d]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Historial
            </h1>
            <p className="text-sm text-[#40493d] font-medium">
              {readings.length} medición{readings.length !== 1 ? 'es' : ''} en total
            </p>
          </div>
          {/* Botón exportar PDF */}
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold active:scale-95 transition-all"
            style={{ background: '#0d631b', color: '#ffffff' }}
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Exportar
          </button>
        </div>
      </header>

      <div className="px-5 flex flex-col gap-5">

        {/* ── Búsqueda ── */}
        <section>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[#707a6c]">search</span>
            </div>
            <input
              type="text"
              placeholder="Buscar valor, contexto o nota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl border-none outline-none text-sm text-[#191c1d] placeholder:text-[#707a6c]"
              style={{
                background: '#ffffff',
                boxShadow: '0 4px 12px rgba(25,28,29,0.03)',
              }}
            />
          </div>
        </section>

        {/* ── Filtros pill ── */}
        <section
          className="flex gap-3 overflow-x-auto -mx-6 px-6 pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {FILTER_OPTIONS.map(opt => {
            const isActive = filter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className="flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: isActive ? '#0d631b' : '#ffffff',
                  color: isActive ? '#ffffff' : '#40493d',
                  boxShadow: isActive ? 'none' : '0 1px 4px rgba(25,28,29,0.06)',
                  outline: !isActive ? '1px solid rgba(191,202,186,0.3)' : 'none',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </section>

        {/* ── Sin resultados ── */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ background: '#f3f4f5' }}
            >
              <span className="material-symbols-outlined text-[#707a6c]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
            <p className="font-semibold text-[#40493d] text-sm">
              {filter !== 'all' ? 'Sin resultados con ese filtro' : 'Sin mediciones todavía'}
            </p>
            <p className="text-[#707a6c] text-xs mt-1">
              {filter !== 'all' ? 'Prueba otro filtro' : 'Registra la primera desde +'}
            </p>
          </div>
        )}

        {/* ── Lista agrupada ── */}
        <div className="flex flex-col gap-8 pb-4">
          {Array.from(grouped.entries()).map(([date, dayReadings]) => (
            <section key={date} className="flex flex-col gap-3">
              {/* Cabecera del grupo */}
              <header className="flex items-center justify-between">
                <h2
                  className="font-extrabold uppercase tracking-[0.15em] text-[#40493d]"
                  style={{ fontSize: '0.6875rem' }}
                >
                  {date.toUpperCase()}
                </h2>
                <div className="flex items-center flex-1 mx-4 h-px bg-[#e7e8e9]" />
                <span
                  className="font-bold text-sm text-[#0d631b]"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {dayReadings.length}
                </span>
              </header>

              <div className="flex flex-col gap-3">
                {dayReadings.map((reading: GlucoseReading) => {
                  const s = reading.status ?? 'normal'
                  return (
                    <div
                      key={reading.id}
                      className="p-5 rounded-2xl flex items-center justify-between"
                      style={{
                        background: '#ffffff',
                        boxShadow: '0 2px 12px rgba(25,28,29,0.04)',
                      }}
                    >
                      <div className="flex items-center gap-5">
                        {/* Valor */}
                        <div className="text-center">
                          <span
                            className="block font-extrabold text-2xl text-[#191c1d]"
                            style={{ fontFamily: 'Manrope, sans-serif' }}
                          >
                            {reading.value}
                          </span>
                          <span className="block text-[10px] font-bold text-[#40493d] uppercase tracking-tighter">
                            mg/dL
                          </span>
                        </div>

                        {/* Separador */}
                        <div className="w-px h-10 bg-[#edeeef]" />

                        {/* Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                background: STATUS_BADGE_BG[s],
                                color: STATUS_BADGE_TEXT[s],
                              }}
                            >
                              {STATUS_LABEL[s]}
                            </span>
                            <span className="text-xs font-medium text-[#40493d]">
                              {formatDateTime(reading.timestamp).split(' ')[1] ?? ''}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#191c1d]">
                            {MEAL_CONTEXT_LABELS[reading.mealContext]}
                          </p>
                          {reading.notes && (
                            <p className="text-xs text-[#707a6c] italic truncate">"{reading.notes}"</p>
                          )}
                        </div>
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={() => setConfirmDelete(reading.id ?? null)}
                        className="p-2 transition-colors"
                        style={{ color: 'rgba(64,73,61,0.4)' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── Modal confirmar borrado ── */}
      {confirmDelete !== null && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50 px-4 pb-8"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="rounded-3xl p-6 w-full max-w-sm"
            style={{ background: '#ffffff', boxShadow: '0 24px 48px rgba(25,28,29,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              className="text-base font-bold text-[#191c1d] mb-1 tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              ¿Eliminar medición?
            </h3>
            <p className="text-sm text-[#707a6c] mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-[#40493d]"
                style={{ background: '#edeeef' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-bold active:scale-95 transition-transform"
                style={{ background: '#ba1a1a' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal exportar PDF ── */}
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} />
      )}
    </div>
  )
}
