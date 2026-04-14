import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import type { GlucoseReading } from '../../types/glucose'
import { groupByDay } from '../../utils/glucoseUtils'

interface WeeklyBarChartProps {
  readings: GlucoseReading[]
  targetMin: number
  targetMax: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#e0e4e8] rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-bold text-[#191c1d]">{payload[0].payload.date}</p>
        <p className="text-[#5f6368]">Prom: <span className="font-semibold text-[#191c1d]">{payload[0].value}</span> mg/dL</p>
        <p className="text-xs text-[#707a6c]">Min: {payload[0].payload.min} · Max: {payload[0].payload.max}</p>
      </div>
    )
  }
  return null
}

export function WeeklyBarChart({ readings, targetMax }: WeeklyBarChartProps) {
  const data = groupByDay(readings).slice(-7)

  if (!data.length) {
    return (
      <div className="h-40 flex items-center justify-center text-[#94a3b8] text-sm">
        Sin datos para mostrar
      </div>
    )
  }

  const getColor = (val: number) => {
    if (val < 70)  return '#fbbf24'
    if (val <= targetMax) return '#34d399'
    if (val <= 180) return '#fb923c'
    return '#f87171'
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8f5e9" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f5' }} />
        <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getColor(entry.avg)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
