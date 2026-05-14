import { AuthProvider } from './AuthContext'
import { TasksProvider } from './TasksContext'
import { PlannerProvider } from './PlannerContext'
import { PomodoroProvider } from './PomodoroContext'
import { NotesProvider } from './NotesContext'
import { ToastProvider } from '@/hooks/useToast'

export function AppProvider({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <TasksProvider>
          <PlannerProvider>
            <PomodoroProvider>
              <NotesProvider>
                {children}
              </NotesProvider>
            </PomodoroProvider>
          </PlannerProvider>
        </TasksProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
