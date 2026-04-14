import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import type { GlucoseReading } from '../../types/glucose'
import { toChartData } from '../../utils/glucoseUtils'

interface GlucoseLineChartProps {
  readings: GlucoseReading[]
  targetMin: number
  targetMax: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value
    return (
      <div className="bg-white border border-[#e0e4e8] rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-bold text-[#191c1d]">{val} <span className="font-normal text-[#5f6368]">mg/dL</span></p>
        <p className="text-[#707a6c] text-xs mt-0.5">{payload[0].payload.time}</p>
      </div>
    )
  }
  return null
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  const colorMap: Record<string, string> = {
    very_low:  '#fbbf24',
    low:       '#fcd34d',
    normal:    '#34d399',
    pre_high:  '#fb923c',
    high:      '#f87171',
    very_high: '#ef4444',
  }
  const color = colorMap[payload.status] ?? '#66bb6a'
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={2} />
}

export function GlucoseLineChart({ readings, targetMin, targetMax }: GlucoseLineChartProps) {
  const data = toChartData(readings)

  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-[#94a3b8] text-sm">
        Sin datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8f5e9" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={targetMax} stroke="#fca5a5" strokeDasharray="4 4" label={{ value: `${targetMax}`, fontSize: 9, fill: '#f87171' }} />
        <ReferenceLine y={targetMin} stroke="#6ee7b7" strokeDasharray="4 4" label={{ value: `${targetMin}`, fontSize: 9, fill: '#10b981' }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#66bb6a"
          strokeWidth={2.5}
          dot={<CustomDot />}
          activeDot={{ r: 6, fill: '#2e7d32' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
