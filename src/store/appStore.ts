import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GlucoseReading, UserProfile, DiabetesType } from '../types/glucose'
import { getGlucoseStatus, GLUCOSE_RANGES } from '../types/glucose'
import {
  addReading,
  getAllReadings,
  deleteReading,
  getProfile,
  saveProfile,
  getReadingsByDateRange,
} from '../db/database'
import { seedDemoData } from '../db/seedData'

interface AppState {
  profile: UserProfile | null
  profileLoaded: boolean
  readings: GlucoseReading[]
  readingsLoaded: boolean
  loadProfile: () => Promise<void>
  setProfile: (data: { name: string; diabetesType: DiabetesType }) => Promise<void>
  loadReadings: () => Promise<void>
  addReading: (data: Omit<GlucoseReading, 'id' | 'status'>) => Promise<void>
  deleteReading: (id: number) => Promise<void>
  getReadingsByRange: (from: Date, to: Date) => Promise<GlucoseReading[]>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      profileLoaded: false,
      readings: [],
      readingsLoaded: false,

      loadProfile: async () => {
        const profile = await getProfile()
        set({ profile: profile ?? null, profileLoaded: true })
      },

      setProfile: async ({ name, diabetesType }) => {
        const ranges = GLUCOSE_RANGES[diabetesType]
        const profileData: Omit<UserProfile, 'id'> = {
          name,
          diabetesType,
          targetMin: ranges.targetMin,
          targetMax: ranges.targetMax,
          createdAt: new Date(),
        }
        await saveProfile(profileData)
        // Sembrar datos demo si es la primera vez
        await seedDemoData()
        const saved = await getProfile()
        set({ profile: saved ?? null })
      },

      loadReadings: async () => {
        const readings = await getAllReadings()
        set({ readings, readingsLoaded: true })
      },

      addReading: async (data) => {
        const diabetesType = get().profile?.diabetesType ?? 'unknown'
        const status = getGlucoseStatus(data.value, diabetesType)
        const id = await addReading({ ...data, status })
        const newReading: GlucoseReading = { ...data, status, id }
        set(state => ({ readings: [newReading, ...state.readings] }))
      },

      deleteReading: async (id: number) => {
        await deleteReading(id)
        set(state => ({ readings: state.readings.filter(r => r.id !== id) }))
      },

      getReadingsByRange: async (from: Date, to: Date) => {
        return await getReadingsByDateRange(from, to)
      },
    }),
    {
      name: 'glucosa-app-store',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
)
