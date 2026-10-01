import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
const AccountProvider = lazy(() => import('@/context/AccountProvider'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const DashboardLayout = lazy(() => import('@/pages/dashboard/DashboardLayout'))
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'))
const TasksPage = lazy(() => import('@/pages/dashboard/TasksPage'))
const PlannerPage = lazy(() => import('@/pages/dashboard/PlannerPage'))
const PomodoroPage = lazy(() => import('@/pages/dashboard/PomodoroPage'))
const NotesPage = lazy(() => import('@/pages/dashboard/NotesPage'))
const AnalyticsPage = lazy(() => import('@/pages/dashboard/AnalyticsPage'))
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'))
import { RequireSession } from '@/components/RequireSession'
import { RequireOnboarded } from '@/components/RequireOnboarded'

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div role="status" className="min-h-screen grid place-items-center">Loading your workspace…</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AccountProvider />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<RequireSession />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<RequireOnboarded />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="planner" element={<PlannerPage />} />
              <Route path="pomodoro" element={<PomodoroPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
