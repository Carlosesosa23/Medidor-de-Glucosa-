import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { GlucoseBadge } from '../components/ui/GlucoseBadge'
import { GlucoseLineChart } from '../components/charts/GlucoseLineChart'
import { getTodayReadings, getAverage, getMax, getMin, formatTime, formatDate, getLastNDays } from '../utils/glucoseUtils'
import { MEAL_CONTEXT_LABELS } from '../types/glucose'
import type { GlucoseReading } from '../types/glucose'
import { useMemo } from 'react'

export function Dashboard() {
  const navigate = useNavigate()
  const { readings, profile } = useAppStore()

  const todayReadings = useMemo(() => getTodayReadings(readings), [readings])
  const week7Readings = useMemo(() => getLastNDays(readings, 7), [readings])
  const todayAvg      = useMemo(() => getAverage(todayReadings), [todayReadings])
  const todayMax      = useMemo(() => getMax(todayReadings), [todayReadings])
  const todayMin      = useMemo(() => getMin(todayReadings), [todayReadings])
  const latest        = readings[0] ?? null
  const targetMin     = profile?.targetMin ?? 70
  const targetMax     = profile?.targetMax ?? 140

  const inRangePct = useMemo(() => {
    if (!week7Readings.length) return 0
    const inRange = week7Readings.filter(r => r.value >= targetMin && r.value <= targetMax).length
    return Math.round((inRange / week7Readings.length) * 100)
  }, [week7Readings, targetMin, targetMax])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-[#f8f9fa]" style={{ paddingBottom: '1.5rem' }}>

      {/* ── TopAppBar ── */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-5 py-4 bg-[#f8f9fa]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0d631b]" style={{ fontVariationSettings: "'FILL' 1" }}>glucose</span>
          <span className="text-lg font-bold tracking-tight text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Glucosa
          </span>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#edeeef] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[#707a6c]">settings</span>
        </button>
      </nav>

      <div className="px-5 flex flex-col gap-5">

        {/* ── Greeting ── */}
        <header className="mt-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#191c1d] leading-snug" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {greeting}, {profile?.name?.split(' ')[0] ?? 'Hola'} 👋
          </h1>
          <p className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: '#707a6c' }}>
            {formatDate(new Date())}
          </p>
        </header>

        {/* ── Sin mediciones ── */}
        {!latest && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #2e7d32, #0d631b)', boxShadow: '0 16px 32px -8px rgba(13,99,27,0.25)' }}
            >
              <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
            <p className="font-bold text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>Sin mediciones aún</p>
            <p className="text-sm text-[#707a6c] mt-1">Toca <strong>+</strong> para registrar la primera</p>
          </div>
        )}

        {/* ── Hero card: Última medición ── */}
        {latest && (
          <section
            className="rounded-3xl p-5"
            style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(25,28,29,0.06)' }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#707a6c]">
                Última medición
              </span>
              <GlucoseBadge status={latest.status ?? 'normal'} size="sm" />
            </div>

            <p className="text-[#40493d] text-sm mb-3">
              {MEAL_CONTEXT_LABELS[latest.mealContext]} · {formatTime(latest.timestamp)}
            </p>

            <div className="flex items-baseline gap-2 mb-5">
              <span
                className="font-extrabold tracking-tighter text-[#0d631b]"
                style={{ fontSize: '3.5rem', lineHeight: 1, fontFamily: 'Manrope, sans-serif' }}
              >
                {latest.value}
              </span>
              <span className="text-lg font-medium text-[#40493d]">mg/dL</span>
            </div>

            <RangeBar value={latest.value} min={targetMin} max={targetMax} />
          </section>
        )}

        {/* ── Resumen del día ── */}
        {todayReadings.length > 0 && (
          <section>
            <h2
              className="text-base font-bold text-[#191c1d] mb-3"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Hoy ({todayReadings.length} medición{todayReadings.length > 1 ? 'es' : ''})
            </h2>
            <div className="grid grid-cols-3 gap-2.5">
              <StatCard label="Promedio" value={todayAvg}               dotColor="#0d631b" />
              <StatCard label="Máximo"   value={todayMax?.value ?? '—'} dotColor="#774d00" />
              <StatCard label="Mínimo"   value={todayMin?.value ?? '—'} dotColor="#286b33" />
            </div>
          </section>
        )}

        {/* ── Gráfica tendencia ── */}
        {todayReadings.length >= 2 && (
          <section
            className="rounded-3xl p-5"
            style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(25,28,29,0.06)' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Tendencia
              </h3>
              <span className="material-symbols-outlined text-[#707a6c] text-[18px]">more_horiz</span>
            </div>
            <GlucoseLineChart readings={todayReadings} targetMin={targetMin} targetMax={targetMax} />
          </section>
        )}

        {/* ── Semana ── */}
        {week7Readings.length >= 3 && (
          <section
            className="rounded-3xl p-5"
            style={{ background: '#ffffff', boxShadow: '0 2px 16px rgba(25,28,29,0.06)' }}
          >
            <h3 className="font-bold text-[#191c1d] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Últimos 7 días
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f3f4f5] rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#707a6c] mb-1.5">Promedio</p>
                <p className="text-xl font-extrabold text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {getAverage(week7Readings)}<span className="text-xs font-normal text-[#707a6c] ml-1">mg/dL</span>
                </p>
              </div>
              <div className="bg-[#f3f4f5] rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#707a6c] mb-1.5">En rango</p>
                <p className="text-xl font-extrabold text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {inRangePct}<span className="text-xs font-normal text-[#707a6c] ml-0.5">%</span>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Recientes ── */}
        {readings.length > 0 && (
          <section className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-base font-bold text-[#191c1d]"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Recientes
              </h2>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-[#0d631b]"
              >
                Ver todo
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {readings.slice(0, 4).map(r => (
                <ReadingRow key={r.id} reading={r} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => navigate('/new')}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full text-white flex items-center justify-center active:scale-90 transition-transform duration-200 z-50"
        style={{
          background: 'linear-gradient(135deg, #0d631b, #2e7d32)',
          boxShadow: '0 8px 20px rgba(13,99,27,0.35)',
        }}
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'wght' 600" }}>
          add
        </span>
      </button>
    </div>
  )
}

// ─── Sub-componentes ───────────────────────────────────────────────────────────

function StatCard({ label, value, dotColor }: { label: string; value: number | string; dotColor: string }) {
  return (
    <div className="bg-[#ffffff] rounded-2xl p-4 flex flex-col items-center text-center" style={{ boxShadow: '0 2px 8px rgba(25,28,29,0.05)' }}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#707a6c] mb-2">
        {label}
      </span>
      <span className="font-extrabold text-xl text-[#191c1d]" style={{ fontFamily: 'Manrope, sans-serif' }}>
        {value}
      </span>
      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ background: dotColor }} />
    </div>
  )
}

function ReadingRow({ reading }: { reading: GlucoseReading }) {
  const mealIconMap: Record<string, string> = {
    fasting:        'wb_sunny',
    before_meal:    'restaurant',
    after_meal:     'restaurant',
    before_sleep:   'bedtime',
    after_exercise: 'directions_run',
    with_insulin:   'syringe',
    other:          'glucose',
  }
  const statusBgMap: Record<string, string> = {
    normal:    '#d8f8d8',
    high:      '#ffddb4',
    very_high: '#ffdad6',
    pre_high:  '#ffecc7',
    low:       '#fff3cd',
    very_low:  '#ffdad6',
  }
  const statusTextMap: Record<string, string> = {
    normal:    'Normal',
    high:      'Alto',
    very_high: 'Muy alto',
    pre_high:  'Pre-alto',
    low:       'Bajo',
    very_low:  'Muy bajo',
  }
  const statusColorMap: Record<string, string> = {
    normal:    '#286b33',
    high:      '#774d00',
    very_high: '#ba1a1a',
    pre_high:  '#7a4f00',
    low:       '#7a5200',
    very_low:  '#ba1a1a',
  }
  const s = reading.status ?? 'normal'

  return (
    <div
      className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
      style={{ background: '#ffffff', boxShadow: '0 1px 8px rgba(25,28,29,0.05)' }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: statusBgMap[s] }}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ color: statusColorMap[s], fontVariationSettings: "'FILL' 1" }}
          >
            {mealIconMap[reading.mealContext] ?? 'glucose'}
          </span>
        </div>
        <div>
          <p className="font-bold text-[#191c1d] text-sm leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {reading.value} mg/dL
          </p>
          <p className="text-xs text-[#707a6c] mt-0.5 leading-tight">
            {MEAL_CONTEXT_LABELS[reading.mealContext].replace(/^.+ /, '')} · {formatTime(reading.timestamp)}
          </p>
        </div>
      </div>
      <span
        className="text-[11px] font-bold uppercase tracking-wide"
        style={{ color: statusColorMap[s] }}
      >
        {statusTextMap[s]}
      </span>
    </div>
  )
}

function RangeBar({ value, min, max }: { value: number; min: number; max: number }) {
  const displayMin = Math.min(min - 30, value - 20, 40)
  const displayMax = Math.max(max + 60, value + 20, 300)
  const range = displayMax - displayMin
  const pctVal = Math.max(1, Math.min(99, ((value - displayMin) / range) * 100))

  return (
    <div className="space-y-2">
      <div className="h-2 w-full bg-[#edeeef] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pctVal}%`,
            background: 'linear-gradient(90deg, #abf4ac, #2e7d32, #ffddb4)',
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-[#707a6c] uppercase tracking-tight">
        <span>{min} mg/dL</span>
        <span>{max} mg/dL</span>
      </div>
    </div>
  )
}
