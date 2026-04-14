import { useMemo, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { GlucoseLineChart } from '../components/charts/GlucoseLineChart'
import { WeeklyBarChart } from '../components/charts/WeeklyBarChart'
import { getLastNDays, getAverage, getMax, getMin, formatDateTime } from '../utils/glucoseUtils'
import { TrendingUp, TrendingDown } from 'lucide-react'

const PERIOD_OPTIONS = [
  { label: '7d',  days: 7  },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
]

export function Stats() {
  const { readings, profile } = useAppStore()
  const [period, setPeriod] = useState(7)

  const targetMin = profile?.targetMin ?? 70
  const targetMax = profile?.targetMax ?? 140

  const periodReadings = useMemo(() => getLastNDays(readings, period), [readings, period])
  const avg        = useMemo(() => getAverage(periodReadings), [periodReadings])
  const maxReading = useMemo(() => getMax(periodReadings), [periodReadings])
  const minReading = useMemo(() => getMin(periodReadings), [periodReadings])

  const inRangeCount = useMemo(() =>
    periodReadings.filter(r => r.value >= targetMin && r.value <= targetMax).length,
    [periodReadings, targetMin, targetMax]
  )
  const inRangePct = periodReadings.length
    ? Math.round((inRangeCount / periodReadings.length) * 100)
    : 0

  const highCount = periodReadings.filter(r => r.value > targetMax).length
  const lowCount  = periodReadings.filter(r => r.value < targetMin).length

  return (
    <div className="flex flex-col flex-1 overflow-y-auto pb-6 bg-[#f8f9fa]">

      {/* ── TopAppBar ── */}
      <nav className="sticky top-0 z-50 bg-[#f8f9fa]">
        <div className="flex items-center justify-between px-5 py-4">
          <h1
            className="font-bold text-xl tracking-tight text-[#2e7d32]"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Estadísticas
          </h1>
        </div>
      </nav>

      <main className="px-5 max-w-lg mx-auto">
        {/* Header */}
        <header className="mt-2 mb-5">
          <h2
            className="text-2xl font-extrabold tracking-tight text-[#191c1d]"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Estadísticas
          </h2>
          <p className="text-[#40493d] font-medium text-sm mt-1">
            Últimos {period} días · {periodReadings.length} mediciones
          </p>
        </header>

        {/* ── Selector período ── */}
        <div
          className="p-1.5 rounded-full flex gap-1 mb-6"
          style={{ background: '#f3f4f5', boxShadow: '0 2px 4px rgba(25,28,29,0.04)' }}
        >
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.days}
              onClick={() => setPeriod(opt.days)}
              className="flex-1 py-2 text-sm font-semibold rounded-full transition-all"
              style={{
                background: period === opt.days ? '#ffffff' : 'transparent',
                color: period === opt.days ? '#0d631b' : 'rgba(64,73,61,0.6)',
                fontWeight: period === opt.days ? 700 : 600,
                boxShadow: period === opt.days ? '0 2px 8px rgba(25,28,29,0.05)' : 'none',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {periodReadings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ background: '#f3f4f5' }}
            >
              <span className="material-symbols-outlined text-[#707a6c]">analytics</span>
            </div>
            <p className="font-semibold text-[#40493d] text-sm">Sin datos en este período</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pb-4">

            {/* ── Tiempo en rango ── */}
            <section
              className="rounded-2xl p-6"
              style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(25,28,29,0.04)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: '#abf4ac' }}
                  >
                    <span
                      className="material-symbols-outlined text-[#2e7238]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      timer
                    </span>
                  </div>
                  <span className="font-bold text-[#191c1d]">Tiempo en rango</span>
                </div>
                <span
                  className="text-4xl font-extrabold tracking-tighter text-[#0d631b]"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {inRangePct}%
                </span>
              </div>
              <div
                className="w-full h-3 rounded-full overflow-hidden mb-4"
                style={{ background: '#edeeef' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${inRangePct}%`,
                    background: 'linear-gradient(90deg, #0d631b, #abf4ac)',
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#40493d]">
                <span>Meta: {targetMin}–{targetMax} mg/dL</span>
                <span
                  className="px-2 py-1 rounded-md text-[#0d631b]"
                  style={{ background: '#f3f4f5' }}
                >
                  {inRangeCount} de {periodReadings.length}
                </span>
              </div>
            </section>

            {/* ── Métricas bento ── */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon="bar_chart"
                iconBg="#abf4ac"
                iconColor="#0d631b"
                label="Promedio"
                value={avg}
                unit="mg/dL"
              />
              <MetricCard
                icon="check_circle"
                iconBg="rgba(171,244,172,0.3)"
                iconColor="#286b33"
                label="En rango"
                value={`${inRangePct}`}
                unit="%"
              />
              <MetricCard
                icon="trending_up"
                iconBg="rgba(255,218,214,0.3)"
                iconColor="#ba1a1a"
                label="Episodios altos"
                value={highCount}
                unit="veces"
              />
              <MetricCard
                icon="trending_down"
                iconBg="rgba(255,221,180,0.3)"
                iconColor="#774d00"
                label="Episodios bajos"
                value={lowCount}
                unit="veces"
              />
            </div>

            {/* ── Gráfica lineal ── */}
            <section
              className="rounded-2xl p-6"
              style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(25,28,29,0.04)' }}
            >
              <h3
                className="font-bold text-[#191c1d] mb-6"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Tendencia del período
              </h3>
              <GlucoseLineChart readings={periodReadings} targetMin={targetMin} targetMax={targetMax} />
            </section>

            {/* ── Barras por día ── */}
            <section
              className="rounded-2xl p-6"
              style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(25,28,29,0.04)' }}
            >
              <h3
                className="font-bold text-[#191c1d] mb-6"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Promedio por día
              </h3>
              <WeeklyBarChart readings={periodReadings} targetMin={targetMin} targetMax={targetMax} />
            </section>

            {/* ── Valores extremos ── */}
            {(maxReading || minReading) && (
              <section className="mb-4">
                <h3
                  className="font-bold text-[#191c1d] mb-4 px-1"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Valores extremos
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {maxReading && (
                    <div
                      className="rounded-2xl p-5 border-l-4"
                      style={{
                        background: '#ffffff',
                        borderColor: '#ba1a1a',
                        boxShadow: '0 4px 16px rgba(25,28,29,0.04)',
                      }}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest mb-2"
                        style={{ color: 'rgba(186,26,26,0.7)' }}
                      >
                        Pico más alto
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-3xl font-extrabold text-[#191c1d]"
                          style={{ fontFamily: 'Manrope, sans-serif' }}
                        >
                          {maxReading.value}
                        </span>
                        <TrendingUp size={18} className="text-[#ba1a1a] font-bold" />
                      </div>
                      <p className="text-[10px] text-[#707a6c] mt-1">{formatDateTime(maxReading.timestamp)}</p>
                    </div>
                  )}
                  {minReading && (
                    <div
                      className="rounded-2xl p-5 border-l-4"
                      style={{
                        background: '#ffffff',
                        borderColor: '#774d00',
                        boxShadow: '0 4px 16px rgba(25,28,29,0.04)',
                      }}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest mb-2"
                        style={{ color: 'rgba(119,77,0,0.7)' }}
                      >
                        Pico más bajo
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-3xl font-extrabold text-[#191c1d]"
                          style={{ fontFamily: 'Manrope, sans-serif' }}
                        >
                          {minReading.value}
                        </span>
                        <TrendingDown size={18} className="text-[#774d00] font-bold" />
                      </div>
                      <p className="text-[10px] text-[#707a6c] mt-1">{formatDateTime(minReading.timestamp)}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function MetricCard({ icon, iconBg, iconColor, label, value, unit }: {
  icon: string; iconBg: string; iconColor: string
  label: string; value: number | string; unit: string
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(25,28,29,0.04)' }}
    >
      <div
        className="inline-flex p-2 rounded-lg mb-3"
        style={{ background: iconBg }}
      >
        <span
          className="material-symbols-outlined text-xl"
          style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-1"
        style={{ color: 'rgba(64,73,61,0.5)' }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span
          className="text-xl font-extrabold text-[#191c1d]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-[#40493d]">{unit}</span>
        )}
      </div>
    </div>
  )
}
