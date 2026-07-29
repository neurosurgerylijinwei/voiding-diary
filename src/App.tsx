import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Layout } from './components/Layout'
import { useDiary } from './context/DiaryContext'
import { GuidePage } from './pages/GuidePage'
import { HomePage } from './pages/HomePage'
import { NightPage } from './pages/NightPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'
import { SummaryPage } from './pages/SummaryPage'

function RequireProfile({ children }: { children: ReactNode }) {
  const { profile } = useDiary()
  if (!profile?.guided) return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        element={
          <RequireProfile>
            <Layout />
          </RequireProfile>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/night/:date" element={<NightPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
