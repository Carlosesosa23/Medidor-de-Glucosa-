import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { NewReading } from './pages/NewReading'
import { History } from './pages/History'
import { Stats } from './pages/Stats'
import { Profile } from './pages/Profile'
import { BottomNav } from './components/layout/BottomNav'

function AppRoutes() {
  const { profile, profileLoaded, loadProfile, loadReadings } = useAppStore()

  useEffect(() => {
    loadProfile()
    loadReadings()
  }, [])

  if (!profileLoaded) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-on-primary text-xl">psychiatry</span>
          </div>
          <div className="w-8 h-8 rounded-full border-[3px] border-secondary-container border-t-primary animate-spin" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return <Onboarding />
  }

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/new"     element={<NewReading />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats"   element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
