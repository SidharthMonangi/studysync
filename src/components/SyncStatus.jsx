import { useAuth } from '@/context/AuthStore'
import { useTasks } from '@/context/TasksStore'
import { useNotes } from '@/context/NotesStore'
import { usePlanner } from '@/context/PlannerStore'
import { usePomodoro } from '@/context/PomodoroStore'
export function SyncStatus() {
  const sources = [useAuth(), useTasks(), useNotes(), usePlanner(), usePomodoro()]
  const error = sources.map(s => s.error).find(Boolean)
  if (!error) return null
  return <div role="alert" className="mb-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm"><strong>Cloud sync needs attention.</strong> {error} <button className="underline ml-2" onClick={() => window.location.reload()}>Retry</button></div>
}
