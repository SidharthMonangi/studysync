import { Outlet } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { TasksProvider } from './TasksContext'
import { PlannerProvider } from './PlannerContext'
import { PomodoroProvider } from './PomodoroContext'
import { NotesProvider } from './NotesContext'
export default function AccountProvider() {
  return <AuthProvider><TasksProvider><PlannerProvider><PomodoroProvider><NotesProvider><Outlet /></NotesProvider></PomodoroProvider></PlannerProvider></TasksProvider></AuthProvider>
}
