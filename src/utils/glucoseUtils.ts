import type { GlucoseReading } from '../types/glucose'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function getAverage(readings: GlucoseReading[]): number {
  if (!readings.length) return 0
  return Math.round(readings.reduce((sum, r) => sum + r.value, 0) / readings.length)
}

export function getMax(readings: GlucoseReading[]): GlucoseReading | null {
  if (!readings.length) return null
  return readings.reduce((max, r) => r.value > max.value ? r : max, readings[0])
}

export function getMin(readings: GlucoseReading[]): GlucoseReading | null {
  if (!readings.length) return null
  return readings.reduce((min, r) => r.value < min.value ? r : min, readings[0])
}

export function getTodayReadings(readings: GlucoseReading[]): GlucoseReading[] {
  const start = startOfDay(new Date())
  const end = endOfDay(new Date())
  return readings.filter(r => {
    const d = new Date(r.timestamp)
    return d >= start && d <= end
  })
}

export function getLastNDays(readings: GlucoseReading[], days: number): GlucoseReading[] {
  const cutoff = startOfDay(subDays(new Date(), days - 1))
  return readings.filter(r => new Date(r.timestamp) >= cutoff)
}

// Para gráficas: agrupar por día con valor promedio
export function groupByDay(readings: GlucoseReading[]): { date: string; avg: number; min: number; max: number }[] {
  const map = new Map<string, number[]>()
  readings.forEach(r => {
    const key = format(new Date(r.timestamp), 'dd/MM', { locale: es })
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r.value)
  })
  return Array.from(map.entries()).map(([date, vals]) => ({
    date,
    avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    min: Math.min(...vals),
    max: Math.max(...vals),
  }))
}

// Para gráfica lineal (timeline)
export function toChartData(readings: GlucoseReading[]): { time: string; value: number; status: string }[] {
  return [...readings]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(r => ({
      time: format(new Date(r.timestamp), 'dd/MM HH:mm'),
      value: r.value,
      status: r.status ?? 'normal',
    }))
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "d 'de' MMM, HH:mm", { locale: es })
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm', { locale: es })
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "EEEE d 'de' MMMM", { locale: es })
}
