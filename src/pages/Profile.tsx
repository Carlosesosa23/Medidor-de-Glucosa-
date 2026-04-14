import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAppStore } from '../store/appStore'
import { DIABETES_TYPE_LABELS, GLUCOSE_RANGES } from '../types/glucose'
import { Check, AlertTriangle, ChevronRight } from 'lucide-react'
import { db, saveProfile, getProfile } from '../db/database'
import { supabase } from '../lib/supabase'

interface ProfileForm {
  name: string
  targetMin: number
  targetMax: number
}

export function Profile() {
  const navigate = useNavigate()
  const { profile } = useAppStore()
  const [saved, setSaved] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    defaultValues: {
      name: profile?.name ?? '',
      targetMin: profile?.targetMin ?? 80,
      targetMax: profile?.targetMax ?? 130,
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    await saveProfile({
      name: data.name,
      diabetesType: profile?.diabetesType ?? 'unknown',
      targetMin: Number(data.targetMin),
      targetMax: Number(data.targetMax),
      createdAt: profile?.createdAt ?? new Date(),
    })
    const updated = await getProfile()
    useAppStore.setState({ profile: updated ?? null })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = async () => {
    setResetting(true)
    // Borrar en Dexie (local)
    await db.readings.clear()
    await db.profile.clear()
    // Borrar en Supabase (nube)
    await supabase.from('readings').delete().neq('id', 0)
    await supabase.from('profile').delete().neq('id', 0)
    useAppStore.setState({ profile: null, readings: [], profileLoaded: false })
    navigate('/', { replace: true })
    window.location.reload()
  }

  const diabetesRanges = GLUCOSE_RANGES[profile?.diabetesType ?? 'unknown']

  return (
    <div className="flex flex-col flex-1 overflow-y-auto pb-6 bg-[#f8f9fa]">

      {/* ── TopAppBar ── */}
      <header className="flex flex-col px-5 pt-12 pb-4 bg-[#f8f9fa]">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-bold tracking-tight text-2xl text-[#1a5c24]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Perfil
            </h1>
            <p className="text-sm font-medium text-[#707a6c]">Tu configuración personal</p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#abf4ac' }}
          >
            <span className="material-symbols-outlined text-[#2e7238]">person</span>
          </div>
        </div>
      </header>

      <main className="px-5 flex flex-col gap-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-1">

          {/* ── Nombre ── */}
          <div
            className="p-5 rounded-2xl"
            style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.04)', outline: '1px solid rgba(191,202,186,0.1)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: '#a3f69c' }}
              >
                <span className="material-symbols-outlined text-[#0d631b]">person</span>
              </div>
              <div className="flex-1">
                <label
                  className="block text-[11px] font-bold tracking-wider uppercase mb-1"
                  style={{ color: '#707a6c' }}
                >
                  Tu nombre
                </label>
                <input
                  {...register('name', { required: 'Ingresa tu nombre', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
                  type="text"
                  className="w-full bg-transparent border-none p-0 font-semibold text-lg text-[#191c1d] outline-none"
                />
              </div>
            </div>
            {errors.name && <p className="text-xs text-[#ba1a1a] mt-2">{errors.name.message}</p>}
          </div>

          {/* ── Tipo de diabetes (solo lectura) ── */}
          <div
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.04)', outline: '1px solid rgba(191,202,186,0.1)' }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ background: '#abf4ac' }}
              >
                🩺
              </div>
              <div>
                <label
                  className="block text-[11px] font-bold tracking-wider uppercase"
                  style={{ color: '#707a6c' }}
                >
                  Tipo de diabetes
                </label>
                <p className="font-semibold text-[#191c1d]">
                  {DIABETES_TYPE_LABELS[profile?.diabetesType ?? 'unknown']}
                </p>
              </div>
            </div>
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#707a6c]"
              style={{ background: '#e7e8e9' }}
            >
              Fijo
            </span>
          </div>

          {/* ── Rangos objetivo ── */}
          <div
            className="p-5 rounded-2xl"
            style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.04)', outline: '1px solid rgba(191,202,186,0.1)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: '#ffddb4' }}
              >
                <span className="material-symbols-outlined text-[#774d00]">target</span>
              </div>
              <div>
                <h3 className="font-bold text-[#191c1d]">Rangos objetivo</h3>
                <p className="text-xs text-[#707a6c] font-medium">
                  Recomendado: {diabetesRanges.targetMin}–{diabetesRanges.targetMax} mg/dL
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div
                className="p-3 rounded-xl"
                style={{ background: '#f3f4f5' }}
              >
                <label className="block text-[10px] font-bold text-[#707a6c] uppercase mb-1">Mínimo</label>
                <div className="flex items-center gap-2">
                  <input
                    {...register('targetMin', { required: true, min: 40, max: 200 })}
                    type="number"
                    inputMode="numeric"
                    className="w-full bg-transparent border-none p-0 font-bold text-lg text-[#191c1d] outline-none"
                  />
                  <span className="text-[10px] font-bold text-[#707a6c]">mg/dL</span>
                </div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ background: '#f3f4f5' }}
              >
                <label className="block text-[10px] font-bold text-[#707a6c] uppercase mb-1">Máximo</label>
                <div className="flex items-center gap-2">
                  <input
                    {...register('targetMax', { required: true, min: 100, max: 400 })}
                    type="number"
                    inputMode="numeric"
                    className="w-full bg-transparent border-none p-0 font-bold text-lg text-[#191c1d] outline-none"
                  />
                  <span className="text-[10px] font-bold text-[#707a6c]">mg/dL</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#774d00]" />
                <span className="text-[10px] font-bold text-[#707a6c] uppercase">Bajo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#0d631b]" />
                <span className="text-[10px] font-bold text-[#707a6c] uppercase">Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                <span className="text-[10px] font-bold text-[#707a6c] uppercase">Alto</span>
              </div>
            </div>
          </div>

          {/* ── Guardar ── */}
          <button
            type="submit"
            disabled={!isDirty && !saved}
            className="w-full py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            style={{
              fontFamily: 'Manrope, sans-serif',
              background: 'linear-gradient(90deg, #0d631b, #2e7d32)',
              boxShadow: '0 8px 20px rgba(13,99,27,0.2)',
            }}
          >
            {saved ? <><Check size={16} /> Guardado</> : 'Guardar cambios'}
          </button>
        </form>

        {/* ── Sección Datos ── */}
        <div className="pt-2 flex flex-col gap-3">
          <h2
            className="text-[11px] font-extrabold tracking-widest text-[#707a6c] uppercase ml-1"
          >
            Datos
          </h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/history')}
              className="w-full p-4 rounded-2xl flex items-center justify-between active:bg-[#f3f4f5] transition-colors"
              style={{
                background: '#ffffff',
                boxShadow: '0 2px 12px rgba(25,28,29,0.04)',
                outline: '1px solid rgba(191,202,186,0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#707a6c]">history</span>
                <span className="font-semibold text-[#191c1d]">Ver historial completo</span>
              </div>
              <ChevronRight size={16} className="text-[#bfcaba]" />
            </button>

            <button
              onClick={() => setShowReset(true)}
              className="w-full p-4 rounded-2xl flex items-center justify-between active:bg-[#fff0f0] transition-colors"
              style={{
                background: '#ffffff',
                boxShadow: '0 2px 12px rgba(25,28,29,0.04)',
                outline: '1px solid rgba(191,202,186,0.1)',
              }}
            >
              <div className="flex items-center gap-3 text-[#ba1a1a]">
                <span className="material-symbols-outlined">delete</span>
                <span className="font-semibold">Borrar todos los datos</span>
              </div>
              <ChevronRight size={16} style={{ color: 'rgba(186,26,26,0.4)' }} />
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="py-8 text-center">
          <p
            className="text-[11px] font-bold tracking-wide uppercase"
            style={{ color: 'rgba(112,122,108,0.6)' }}
          >
            GlucosaTracker v1.0 · Hecho con 💚
          </p>
        </footer>
      </main>

      {/* ── Modal reset ── */}
      {showReset && (
        <div
          className="fixed inset-0 flex items-end justify-center z-50 px-4 pb-8"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
        >
          <div
            className="rounded-3xl p-6 w-full max-w-sm"
            style={{ background: '#ffffff', boxShadow: '0 24px 48px rgba(25,28,29,0.2)' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#ffdad6' }}
            >
              <AlertTriangle size={20} className="text-[#ba1a1a]" />
            </div>
            <h3
              className="text-base font-bold text-[#191c1d] text-center mb-1 tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              ¿Borrar todo?
            </h3>
            <p className="text-sm text-[#707a6c] text-center mb-5">
              Se eliminarán <strong>todas tus mediciones y tu perfil</strong>. Esta acción es irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-[#40493d]"
                style={{ background: '#edeeef' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 py-3 rounded-2xl text-white text-sm font-bold active:scale-95 transition-transform disabled:opacity-50"
                style={{ background: '#ba1a1a' }}
              >
                {resetting ? 'Borrando...' : 'Sí, borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
