import Dexie, { type EntityTable } from 'dexie'
import type { GlucoseReading, UserProfile } from '../types/glucose'
import { supabase } from '../lib/supabase'

class GlucosaDB extends Dexie {
  readings!: EntityTable<GlucoseReading, 'id'>
  profile!: EntityTable<UserProfile, 'id'>

  constructor() {
    super('GlucosaTrackerDB')
    this.version(1).stores({
      readings: '++id, timestamp, value, mealContext, status',
      profile: '++id',
    })
    this.readings.mapToClass(class {
      id?: number
      value!: number
      timestamp!: Date
      mealContext!: string
      notes?: string
      status?: string
    })
  }
}

export const db = new GlucosaDB()

// ─── Helper: detectar si hay conexión ─────────────────────────────────────

function isOnline(): boolean {
  return navigator.onLine
}

// ─── Operaciones de lecturas ───────────────────────────────────────────────

export async function addReading(reading: Omit<GlucoseReading, 'id'>): Promise<number> {
  // 1. Guardar localmente siempre
  const id = await db.readings.add(reading as GlucoseReading)

  // 2. Sincronizar con Supabase si hay internet
  if (isOnline()) {
    await supabase.from('readings').insert({
      local_id: id,
      value: reading.value,
      timestamp: reading.timestamp instanceof Date
        ? reading.timestamp.toISOString()
        : reading.timestamp,
      meal_context: reading.mealContext,
      notes: reading.notes ?? null,
      status: reading.status ?? null,
    })
  }

  return id as number
}

export async function getAllReadings(): Promise<GlucoseReading[]> {
  // Si hay internet, traer desde Supabase y sincronizar local
  if (isOnline()) {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .order('timestamp', { ascending: false })

    if (!error && data && data.length > 0) {
      // Mapear de snake_case (Supabase) a camelCase (app)
      const remoteReadings: GlucoseReading[] = data.map((r) => ({
        id: r.local_id,
        value: r.value,
        timestamp: new Date(r.timestamp),
        mealContext: r.meal_context,
        notes: r.notes ?? undefined,
        status: r.status ?? undefined,
      }))

      // Actualizar Dexie con los datos remotos
      await db.readings.clear()
      for (const r of remoteReadings) {
        await db.readings.put(r)
      }

      return remoteReadings
    }
  }

  // Fallback: leer desde Dexie (offline)
  const readings = await db.readings.orderBy('timestamp').reverse().toArray()
  return readings.map(r => ({ ...r, timestamp: new Date(r.timestamp) }))
}

export async function getReadingsByDateRange(from: Date, to: Date): Promise<GlucoseReading[]> {
  if (isOnline()) {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .gte('timestamp', from.toISOString())
      .lte('timestamp', to.toISOString())
      .order('timestamp', { ascending: false })

    if (!error && data) {
      return data.map((r) => ({
        id: r.local_id,
        value: r.value,
        timestamp: new Date(r.timestamp),
        mealContext: r.meal_context,
        notes: r.notes ?? undefined,
        status: r.status ?? undefined,
      }))
    }
  }

  // Fallback offline
  const readings = await db.readings
    .where('timestamp')
    .between(from, to, true, true)
    .reverse()
    .toArray()
  return readings.map(r => ({ ...r, timestamp: new Date(r.timestamp) }))
}

export async function deleteReading(id: number): Promise<void> {
  // 1. Borrar local
  await db.readings.delete(id)

  // 2. Borrar en Supabase
  if (isOnline()) {
    await supabase.from('readings').delete().eq('local_id', id)
  }
}

export async function getLastNReadings(n: number): Promise<GlucoseReading[]> {
  if (isOnline()) {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(n)

    if (!error && data) {
      return data.map((r) => ({
        id: r.local_id,
        value: r.value,
        timestamp: new Date(r.timestamp),
        mealContext: r.meal_context,
        notes: r.notes ?? undefined,
        status: r.status ?? undefined,
      }))
    }
  }

  const readings = await db.readings.orderBy('timestamp').reverse().limit(n).toArray()
  return readings.map(r => ({ ...r, timestamp: new Date(r.timestamp) }))
}

// ─── Operaciones de perfil ─────────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile | undefined> {
  if (isOnline()) {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .limit(1)
      .single()

    if (!error && data) {
      const profile: UserProfile = {
        id: data.local_id,
        name: data.name,
        diabetesType: data.diabetes_type,
        targetMin: data.target_min,
        targetMax: data.target_max,
        createdAt: new Date(data.created_at),
      }
      // Actualizar local también
      const existing = await db.profile.toCollection().first()
      if (existing?.id) {
        await db.profile.update(existing.id, profile)
      } else {
        await db.profile.add(profile)
      }
      return profile
    }
  }

  return await db.profile.toCollection().first()
}

export async function saveProfile(profile: Omit<UserProfile, 'id'>): Promise<void> {
  const existing = await db.profile.toCollection().first()

  if (existing?.id) {
    // Actualizar local
    await db.profile.update(existing.id, profile)

    // Actualizar en Supabase
    if (isOnline()) {
      await supabase.from('profile').update({
        name: profile.name,
        diabetes_type: profile.diabetesType,
        target_min: profile.targetMin,
        target_max: profile.targetMax,
      }).eq('local_id', existing.id)
    }
  } else {
    // Crear local
    const id = await db.profile.add({ ...profile, createdAt: new Date() } as UserProfile)

    // Crear en Supabase
    if (isOnline()) {
      await supabase.from('profile').insert({
        local_id: id,
        name: profile.name,
        diabetes_type: profile.diabetesType,
        target_min: profile.targetMin,
        target_max: profile.targetMax,
        created_at: new Date().toISOString(),
      })
    }
  }
}
