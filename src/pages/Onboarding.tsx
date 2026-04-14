import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppStore } from '../store/appStore'
import type { DiabetesType } from '../types/glucose'
import { GLUCOSE_RANGES } from '../types/glucose'

const schema = z.object({
  name: z.string().min(2, 'Escribe al menos 2 caracteres').max(50),
  diabetesType: z.enum(['type1', 'type2', 'unknown']),
})
type FormData = z.infer<typeof schema>

const DIABETES_OPTIONS: { value: DiabetesType; label: string; description: string; emoji: string }[] = [
  { value: 'type1',   label: 'Tipo 1',         description: 'Autoinmune · Usa insulina · Rangos estrictos',      emoji: '💉' },
  { value: 'type2',   label: 'Tipo 2',         description: 'Resistencia a la insulina · Más común en adultos',  emoji: '🩺' },
  { value: 'unknown', label: 'No especificado', description: 'Prefiero no decirlo o aún no tengo diagnóstico',    emoji: '🤍' },
]

export function Onboarding() {
  const { setProfile } = useAppStore()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { diabetesType: 'type1' }
  })

  const selectedType = watch('diabetesType')
  const nameValue    = watch('name')

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    await setProfile({ name: data.name, diabetesType: data.diabetesType })
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col flex-1 bg-[#f8f9fa] overflow-y-auto pb-3">

      {/* Progress bar */}
      <div className="flex gap-2 px-8 pt-14">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= step ? '#2e7d32' : '#edeeef' }}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 px-8 pt-8 pb-12">

        {/* ── Paso 0: Bienvenida ── */}
        {step === 0 && (
          <div className="flex flex-col flex-1 items-center justify-center text-center space-y-8">
            {/* Icon badge */}
            <div className="relative">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #2e7d32, #0d631b)',
                  boxShadow: '0 20px 40px -15px rgba(13,99,27,0.3)',
                }}
              >
                <span
                  className="material-symbols-outlined text-white"
                  style={{ fontSize: 64, fontVariationSettings: "'FILL' 1" }}
                >
                  water_drop
                </span>
              </div>
              {/* Accent dot */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full border-4 border-[#f8f9fa]" style={{ background: '#774d00' }} />
            </div>

            {/* Text */}
            <div className="space-y-4">
              <h1
                className="font-extrabold text-[2.5rem] leading-[1.1] tracking-tight"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                <span className="text-[#191c1d]">Bienvenida a</span><br />
                <span className="text-[#2e7d32]">GlucosaTracker</span>
              </h1>
              <p className="text-[#707a6c] text-lg leading-relaxed max-w-[280px] mx-auto">
                Tu compañera para controlar tu glucosa de manera fácil y ordenada.
              </p>
            </div>

            {/* CTA */}
            <div className="w-full pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-5 px-8 rounded-full flex items-center justify-center gap-2 text-lg font-bold text-white active:scale-95 transition-all"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  background: '#2e7d32',
                  boxShadow: '0 12px 24px rgba(13,99,27,0.25)',
                }}
              >
                Comenzar
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
              <p
                className="mt-6 text-center uppercase tracking-widest text-[0.7rem] font-bold"
                style={{ color: '#bfcaba' }}
              >
                Paso 1 de 3
              </p>
            </div>
          </div>
        )}

        {/* ── Paso 1: Nombre ── */}
        {step === 1 && (
          <div className="flex flex-col flex-1 justify-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.15em] mb-2"
              style={{ color: '#707a6c' }}
            >
              Paso 1 de 2
            </p>
            <h2
              className="text-2xl font-extrabold tracking-tight mb-2 text-[#191c1d]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              ¿Cómo te llamas?
            </h2>
            <p className="text-[#707a6c] mb-8 text-sm">Para personalizar tu experiencia</p>

            <div
              className="rounded-2xl p-5 mb-2"
              style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.04)' }}
            >
              <label
                className="block text-[11px] font-bold tracking-wider uppercase mb-2"
                style={{ color: '#707a6c' }}
              >
                Tu nombre
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Escribe tu nombre..."
                autoFocus
                className="w-full bg-transparent border-none text-2xl font-semibold text-[#191c1d] outline-none placeholder:text-[#bfcaba]"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-[#ba1a1a] mt-1">{errors.name.message}</p>
            )}

            <div className="flex gap-3 mt-10">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[#edeeef] text-[#40493d] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button
                type="button"
                onClick={() => nameValue?.length >= 2 && setStep(2)}
                disabled={!nameValue || nameValue.length < 2}
                className="flex-1 py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  background: 'linear-gradient(90deg, #0d631b, #2e7d32)',
                  boxShadow: '0 8px 20px rgba(13,99,27,0.2)',
                }}
              >
                Continuar
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 2: Tipo de diabetes ── */}
        {step === 2 && (
          <div className="flex flex-col flex-1 justify-center">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.15em] mb-2"
              style={{ color: '#707a6c' }}
            >
              Paso 2 de 2
            </p>
            <h2
              className="text-2xl font-extrabold tracking-tight mb-2 text-[#191c1d]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              ¿Tipo de diabetes?
            </h2>
            <p className="text-[#707a6c] mb-6 text-sm">Ajustaremos tus rangos objetivo</p>

            <div className="space-y-3">
              {DIABETES_OPTIONS.map(opt => {
                const isSelected = selectedType === opt.value
                const ranges = GLUCOSE_RANGES[opt.value]
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('diabetesType', opt.value)}
                    className="w-full text-left rounded-2xl px-4 py-4 transition-all active:scale-[0.98]"
                    style={{
                      background: isSelected ? '#f3fff4' : '#ffffff',
                      boxShadow: isSelected
                        ? '0 0 0 2px #2e7d32, 0 4px_16px rgba(13,99,27,0.08)'
                        : '0 2px 12px rgba(25,28,29,0.04)',
                      outline: isSelected ? '2px solid #2e7d32' : '2px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-[#191c1d]">{opt.label}</p>
                        <p className="text-xs text-[#707a6c] mt-0.5">{opt.description}</p>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: isSelected ? '#0d631b' : '#bfcaba',
                          background: isSelected ? '#0d631b' : 'transparent',
                        }}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    {isSelected && opt.value !== 'unknown' && (
                      <div className="mt-3 pt-2.5 border-t border-[#abf4ac] flex gap-3 text-xs">
                        <span className="text-[#707a6c]">Rango objetivo</span>
                        <span className="font-bold text-[#0d631b]">{ranges.targetMin}–{ranges.targetMax} mg/dL</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3 mt-7">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[#edeeef] text-[#40493d] active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  background: 'linear-gradient(90deg, #0d631b, #2e7d32)',
                  boxShadow: '0 8px 20px rgba(13,99,27,0.2)',
                }}
              >
                {isSubmitting ? 'Configurando...' : '¡Empezar! 🎉'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
