import { useMemo } from 'react'
import { useTasks } from '@/context/TasksContext'
import { usePomodoro } from '@/context/PomodoroContext'
import { useNotes } from '@/context/NotesContext'
import { usePlanner } from '@/context/PlannerContext'

export function useAnalytics() {
  const { tasks } = useTasks()
  const { pomodoroSessions } = usePomodoro()
  const { notes } = useNotes()
  const { plans } = usePlanner()

  const analytics = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const pendingTasks = tasks.filter((t) => t.status !== 'completed').length
    const focusSessions = pomodoroSessions.length
    const studyHours = pomodoroSessions.reduce((a, s) => a + (s.focusMinutes || 0), 0) / 60
    const notesCreated = notes.length
    const planTotal = plans.length
    const planDone = plans.filter((p) => p.status === 'completed').length
    const planRate = planTotal === 0 ? 0 : Math.round((planDone / planTotal) * 100)
    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      focusSessions,
      studyHours,
      notesCreated,
      planTotal,
      planDone,
      planRate,
    }
  }, [tasks, pomodoroSessions, notes, plans])

  return { analytics }
}
