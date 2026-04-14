import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAppStore } from '../store/appStore'
import { type MealContext, getGlucoseStatus } from '../types/glucose'
import { CheckCircle2 } from 'lucide-react'

interface FormData {
  value: string
  mealContext: MealContext
  notes?: string
}

const CONTEXTS: MealContext[] = ['fasting', 'before_meal', 'after_meal', 'before_sleep', 'after_exercise', 'with_insulin', 'other']

const CONTEXT_ICONS: Record<MealContext, string> = {
  fasting:        '🌅',
  before_meal:    '🍽️',
  after_meal:     '✅',
  before_sleep:   '🌙',
  after_exercise: '🏃',
  with_insulin:   '💉',
  other:          '📌',
}

const CONTEXT_LABELS: Record<MealContext, string> = {
  fasting:        'Ayunas',
  before_meal:    'Antes',
  after_meal:     'Después',
  before_sleep:   'Dormir',
  after_exercise: 'Ejercicio',
  with_insulin:   'Insulina',
  other:          'Otro',
}

const STATUS_LABEL: Record<string, string> = {
  normal:    'Normal',
  high:      'Alto',
  very_high: 'Muy alto',
  pre_high:  'Pre-alto',
  low:       'Bajo',
  very_low:  'Muy bajo',
}

const STATUS_BG: Record<string, string> = {
  normal:    '#abf4ac',
  high:      '#ffddb4',
  very_high: '#ffdad6',
  pre_high:  '#ffddb4',
  low:       '#abf4ac',
  very_low:  '#ffdad6',
}

const STATUS_TEXT: Record<string, string> = {
  normal:    '#286b33',
  high:      '#633f00',
  very_high: '#93000a',
  pre_high:  '#633f00',
  low:       '#286b33',
  very_low:  '#93000a',
}

export function NewReading() {
  const navigate = useNavigate()
  const { addReading, profile } = useAppStore()
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const diabetesType = profile?.diabetesType ?? 'unknown'

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { mealContext: 'fasting', value: '' }
  })

  const valueWatch = watch('value')
  const mealContext = watch('mealContext')
  const numericValue = valueWatch ? Number(valueWatch) : null
  const currentStatus = numericValue && numericValue >= 20 ? getGlucoseStatus(numericValue, diabetesType) : null

  const validate = (data: FormData) => {
    const n = Number(data.value)
    if (!data.value || isNaN(n)) return 'Ingresa un valor numérico'
    if (n < 20) return 'Mínimo 20 mg/dL'
    if (n > 600) return 'Máximo 600 mg/dL'
    return null
  }

  const onSubmit = async (data: FormData) => {
    const err = validate(data)
    if (err) { setSubmitError(err); return }
    setSubmitError('')
    await addReading({
      value: Number(data.value),
      mealContext: data.mealContext,
      notes: data.notes ?? '',
      timestamp: new Date(),
    })
    setSuccess(true)
    setTimeout(() => navigate('/'), 1400)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6 bg-[#f8f9fa]">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: '#abf4ac' }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: '#0d631b' }} />
        </div>
        <h2
          className="text-xl font-bold text-[#191c1d] tracking-tight"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          ¡Registrado!
        </h2>
        <p className="text-[#707a6c] text-sm text-center">Tu medición fue guardada.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto pb-6 bg-[#f8f9fa]">

      {/* ── TopAppBar ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-[#f8f9fa]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors"
            style={{ background: '#ffffff' }}
          >
            <span className="material-symbols-outlined text-[#0d631b]">arrow_back</span>
          </button>
          <div>
            <h1
              className="font-bold text-lg tracking-tight text-[#0d631b]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Nueva medición
            </h1>
            <p className="text-xs text-[#707a6c] font-medium">Registra tu nivel de glucosa</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 pt-4 flex flex-col gap-7 pb-6">

        {/* ── Valor Input Card ── */}
        <section className="relative">
          <div
            className="rounded-2xl p-8 flex flex-col items-center justify-center text-center"
            style={{ background: '#ffffff', boxShadow: '0 -4px 40px rgba(25,28,29,0.05)' }}
          >
            <div className="flex flex-col items-center gap-1 w-full">
              <input
                {...register('value', { required: 'Ingresa el valor' })}
                type="number"
                inputMode="numeric"
                placeholder="120"
                className="w-full bg-transparent border-none text-center font-extrabold outline-none placeholder:text-[#e1e3e4] text-[#191c1d]"
                style={{ fontSize: '4.5rem', lineHeight: 1, fontFamily: 'Manrope, sans-serif' }}
              />
              <span
                className="font-bold uppercase tracking-widest text-[#707a6c]"
                style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}
              >
                mg/dL
              </span>
            </div>

            {currentStatus && (
              <div
                className="mt-6 px-4 py-1.5 rounded-full flex items-center gap-2"
                style={{ background: STATUS_BG[currentStatus] }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: STATUS_TEXT[currentStatus] }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: STATUS_TEXT[currentStatus] }}
                >
                  {STATUS_LABEL[currentStatus]}
                </span>
              </div>
            )}

            {(errors.value || submitError) && (
              <p className="text-xs text-[#ba1a1a] text-center mt-3">{errors.value?.message ?? submitError}</p>
            )}
          </div>
          {/* Editorial decor */}
          <div
            className="absolute -z-10 -top-4 -right-4 w-32 h-32 rounded-full blur-3xl"
            style={{ background: 'rgba(46,125,50,0.05)' }}
          />
        </section>

        {/* ── Contexto ── */}
        <section className="flex flex-col gap-3">
          <h2
            className="font-bold uppercase tracking-[0.15em] ml-1"
            style={{ fontSize: '0.6875rem', color: '#707a6c' }}
          >
            ¿Cuándo mediste?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {CONTEXTS.filter(c => c !== 'with_insulin' || diabetesType === 'type1').map(ctx => {
              const isSelected = mealContext === ctx
              return (
                <label
                  key={ctx}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all active:scale-95"
                  style={{
                    background: isSelected ? '#abf4ac' : '#f3f4f5',
                    outline: isSelected ? '2px solid #2e7d32' : '2px solid transparent',
                  }}
                >
                  <input type="radio" {...register('mealContext')} value={ctx} className="sr-only" />
                  <span className="text-2xl mb-1">{CONTEXT_ICONS[ctx]}</span>
                  <span
                    className="text-[13px] font-medium text-center leading-tight"
                    style={{ color: isSelected ? '#0d631b' : '#40493d', fontWeight: isSelected ? 700 : 500 }}
                  >
                    {CONTEXT_LABELS[ctx]}
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        {/* ── Notas ── */}
        <section className="flex flex-col gap-3">
          <h2
            className="font-bold uppercase tracking-[0.15em] ml-1"
            style={{ fontSize: '0.6875rem', color: '#707a6c' }}
          >
            Notas · <span className="normal-case font-normal">opcional</span>
          </h2>
          <textarea
            {...register('notes')}
            placeholder="¿Algo especial que quieras anotar?"
            rows={3}
            className="w-full border-none rounded-2xl p-4 text-sm text-[#191c1d] placeholder:text-[#707a6c] outline-none resize-none focus:ring-2 transition-all"
            style={{
              background: '#e1e3e4',
            }}
          />
        </section>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 rounded-full font-bold text-lg text-white flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-60"
          style={{
            fontFamily: 'Manrope, sans-serif',
            background: 'linear-gradient(90deg, #0d631b, #2e7d32)',
            boxShadow: '0 12px 24px rgba(13,99,27,0.2)',
          }}
        >
          <span className="material-symbols-outlined">save</span>
          {isSubmitting ? 'Guardando...' : 'Guardar medición'}
        </button>
      </form>
    </div>
  )
}
