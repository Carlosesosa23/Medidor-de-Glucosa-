// Tipos de diabetes
export type DiabetesType = 'type1' | 'type2' | 'unknown'

// Contexto de la medición
export type MealContext =
  | 'fasting'        // Ayunas
  | 'before_meal'    // Antes de comer
  | 'after_meal'     // Después de comer (2h)
  | 'before_sleep'   // Antes de dormir
  | 'after_exercise' // Después de ejercicio
  | 'with_insulin'   // Con insulina (tipo 1)
  | 'other'

// Estado del nivel de glucosa
export type GlucoseStatus = 'very_low' | 'low' | 'normal' | 'pre_high' | 'high' | 'very_high'

// Registro de medición
export interface GlucoseReading {
  id?: number
  value: number           // mg/dL
  timestamp: Date
  mealContext: MealContext
  notes?: string
  status?: GlucoseStatus  // calculado automáticamente
}

// Perfil de usuario
export interface UserProfile {
  id?: number
  name: string
  diabetesType: DiabetesType
  targetMin: number       // rango objetivo mínimo
  targetMax: number       // rango objetivo máximo
  createdAt: Date
}

// Rangos por tipo de diabetes (mg/dL)
export const GLUCOSE_RANGES: Record<DiabetesType, { targetMin: number; targetMax: number }> = {
  type1: { targetMin: 80, targetMax: 130 },
  type2: { targetMin: 80, targetMax: 140 },
  unknown: { targetMin: 70, targetMax: 140 },
}

// Umbrales de estado (mg/dL)
export const STATUS_THRESHOLDS = {
  very_low: 55,
  low: 70,
  normal_max_fasting: 99,
  pre_high: 125,
  high: 180,
  very_high: 250,
}

// Calcular estado según valor
export function getGlucoseStatus(value: number, diabetesType: DiabetesType = 'unknown'): GlucoseStatus {
  if (value < STATUS_THRESHOLDS.very_low) return 'very_low'
  if (value < STATUS_THRESHOLDS.low) return 'low'
  const maxNormal = diabetesType === 'type1' ? 130 : diabetesType === 'type2' ? 140 : 99
  if (value <= maxNormal) return 'normal'
  if (value <= STATUS_THRESHOLDS.pre_high) return 'pre_high'
  if (value <= STATUS_THRESHOLDS.high) return 'high'
  return 'very_high'
}

// Colores por estado — tokens Lush Vitality
export const STATUS_COLORS: Record<GlucoseStatus, { bg: string; text: string; border: string; label: string }> = {
  very_low:  { bg: 'bg-amber-100',            text: 'text-amber-800',       border: 'border-amber-300',          label: 'Muy bajo' },
  low:       { bg: 'bg-amber-50',             text: 'text-amber-700',       border: 'border-amber-200',          label: 'Bajo' },
  normal:    { bg: 'bg-secondary-container',  text: 'text-on-surface',      border: 'border-secondary-container', label: 'Normal' },
  pre_high:  { bg: 'bg-orange-50',            text: 'text-orange-700',      border: 'border-orange-200',         label: 'Pre-alto' },
  high:      { bg: 'bg-red-100',              text: 'text-red-700',         border: 'border-red-300',            label: 'Alto' },
  very_high: { bg: 'bg-red-100',              text: 'text-red-800',         border: 'border-red-400',            label: 'Muy alto' },
}

// Labels de contexto
export const MEAL_CONTEXT_LABELS: Record<MealContext, string> = {
  fasting:        '🌅 Ayunas',
  before_meal:    '🍽️ Antes de comer',
  after_meal:     '🍽️ Después de comer',
  before_sleep:   '🌙 Antes de dormir',
  after_exercise: '🏃 Tras ejercicio',
  with_insulin:   '💉 Con insulina',
  other:          '📌 Otro',
}

// Label de tipo de diabetes
export const DIABETES_TYPE_LABELS: Record<DiabetesType, string> = {
  type1: 'Tipo 1',
  type2: 'Tipo 2',
  unknown: 'No especificado',
}
