import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',        icon: 'home',      label: 'Inicio'      },
  { path: '/history', icon: 'history',   label: 'Historial'   },
  { path: '/stats',   icon: 'analytics', label: 'Estadísticas' },
  { path: '/profile', icon: 'person',    label: 'Perfil'      },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="flex-shrink-0 w-full flex justify-around items-center px-4 pt-3 rounded-t-3xl"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -4px 20px rgba(25,28,29,0.07)',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
      }}
    >
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const isActive = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center px-5 py-1.5 rounded-2xl transition-all active:scale-90 duration-200 ${
              isActive
                ? 'bg-[#abf4ac] text-[#0d631b]'
                : 'text-[#707a6c] hover:text-[#0d631b]'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={{
                fontVariationSettings: isActive
                  ? "'FILL' 1, 'wght' 600"
                  : "'FILL' 0, 'wght' 400",
              }}
            >
              {icon}
            </span>
            <span className={`text-[11px] font-medium uppercase tracking-wide ${isActive ? 'font-bold' : ''}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
