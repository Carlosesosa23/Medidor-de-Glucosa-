import { db } from './database'
import { getGlucoseStatus } from '../types/glucose'
import type { MealContext } from '../types/glucose'
import { subDays, setHours, setMinutes } from 'date-fns'

function randomBetween(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min)
}

function buildDate(daysAgo: number, hour: number, minute = 0): Date {
  return setMinutes(setHours(subDays(new Date(), daysAgo), hour), minute)
}

export async function seedDemoData() {
  const count = await db.readings.count()
  if (count > 0) return // ya hay datos, no sobreescribir

  const readings = []

  // 14 días de datos variados — simulando Diabetes Tipo 1
  for (let day = 13; day >= 0; day--) {
    // Ayunas (mañana)
    const fastingVal = randomBetween(78, 148)
    readings.push({
      value: fastingVal,
      timestamp: buildDate(day, 7, randomBetween(0, 30)),
      mealContext: 'fasting' as MealContext,
      status: getGlucoseStatus(fastingVal, 'type1'),
      notes: '',
    })

    // Antes almuerzo
    const beforeLunchVal = randomBetween(90, 160)
    readings.push({
      value: beforeLunchVal,
      timestamp: buildDate(day, 12, randomBetween(0, 30)),
      mealContext: 'before_meal' as MealContext,
      status: getGlucoseStatus(beforeLunchVal, 'type1'),
      notes: '',
    })

    // Después almuerzo
    const afterLunchVal = randomBetween(110, 220)
    readings.push({
      value: afterLunchVal,
      timestamp: buildDate(day, 14, randomBetween(0, 45)),
      mealContext: 'after_meal' as MealContext,
      status: getGlucoseStatus(afterLunchVal, 'type1'),
      notes: day === 5 ? 'Comí pizza 🍕' : day === 2 ? 'Ensalada, bien controlada' : '',
    })

    // Antes de dormir
    const sleepVal = randomBetween(85, 155)
    readings.push({
      value: sleepVal,
      timestamp: buildDate(day, 22, randomBetween(0, 30)),
      mealContext: 'before_sleep' as MealContext,
      status: getGlucoseStatus(sleepVal, 'type1'),
      notes: '',
    })
  }

  // Un par de episodios extremos para las estadísticas
  readings.push({
    value: 52,
    timestamp: buildDate(6, 10, 15),
    mealContext: 'after_exercise' as MealContext,
    status: getGlucoseStatus(52, 'type1'),
    notes: '⚠️ Después de correr, me sentí mareada',
  })
  readings.push({
    value: 285,
    timestamp: buildDate(3, 19, 30),
    mealContext: 'after_meal' as MealContext,
    status: getGlucoseStatus(285, 'type1'),
    notes: '🎂 Cumpleaños de mamá',
  })

  await db.readings.bulkAdd(readings)
}
