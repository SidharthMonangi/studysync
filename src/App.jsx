import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import TasksPage from '@/pages/dashboard/TasksPage'
import PlannerPage from '@/pages/dashboard/PlannerPage'
import PomodoroPage from '@/pages/dashboard/PomodoroPage'
import NotesPage from '@/pages/dashboard/NotesPage'
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'
import { RequireSession } from '@/components/RequireSession'
import { RequireOnboarded } from '@/components/RequireOnboarded'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
