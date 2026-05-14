import { useMemo } from 'react'
import {
  CheckCircle2,
  Clock,
  Brain,
  Target,
  Play,
  Calendar,
  ArrowUpRight,
  Plus,
  ChevronRight,
  ListTodo,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/context/TasksContext'
import { usePlanner } from '@/context/PlannerContext'
import { usePomodoro } from '@/context/PomodoroContext'
import { useNotes } from '@/context/NotesContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { todayISO, formatDueLine, formatTimeShort } from '@/lib/dates'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

function streakFromSessions(sessions) {
  const days = new Set((sessions || []).map((s) => (s.completedAt || '').slice(0, 10)))
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (days.has(iso)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}

function taskSortKey(t) {
  const d = t.dueDate || '9999-12-31'
  const time = t.dueTime || '23:59'
  return `${d}T${time}`
}

export default function DashboardHome() {
  const { displayName } = useAuth()
  const { tasks, isLoading: tasksLoading, toggleTaskComplete } = useTasks()
  const { plans, isLoading: plansLoading } = usePlanner()
  const { notes, isLoading: notesLoading } = useNotes()
  const { pomodoroSessions, isLoading: pomodoroLoading } = usePomodoro()
  const { analytics } = useAnalytics()

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const streak = useMemo(() => streakFromSessions(pomodoroSessions), [pomodoroSessions])

  const studyHoursLabel =
    analytics.studyHours < 0.05 && analytics.studyHours > 0
      ? '<0.1h'
      : `${analytics.studyHours.toFixed(1)}h`

  const stats = [
    {
      label: 'Tasks completed',
      value: String(analytics.completedTasks),
      sub: `${analytics.pendingTasks} pending`,
      icon: CheckCircle2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Focus time (est.)',
      value: studyHoursLabel,
      sub: `${analytics.focusSessions} sessions`,
      icon: Clock,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      label: 'Notes',
      value: String(analytics.notesCreated),
      sub: 'saved locally',
      icon: Brain,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      label: 'Focus streak',
      value: `${streak}`,
      sub: streak === 1 ? 'day in a row' : 'days in a row',
      icon: Target,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
  ]

  const today = todayISO()
  const upcomingTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => taskSortKey(a).localeCompare(taskSortKey(b)))
      .slice(0, 5)
  }, [tasks])

  const todayPlans = useMemo(() => {
    return [...plans]
      .filter((p) => p.date === today)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  }, [plans, today])

  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt))
      .slice(0, 3)
  }, [notes])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {greeting}, {displayName}
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s a snapshot of your workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/tasks">
            <Button variant="outline" className="glass-button">
              <Plus className="w-4 h-4 mr-2" />
              New task
            </Button>
          </Link>
          <Link to="/dashboard/pomodoro">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-4 h-4 mr-2" />
              Start focus
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 lg:p-5 hover:border-primary/30 transition-smooth">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xs text-primary/90 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Upcoming tasks</h2>
              <Link to="/dashboard/tasks" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {tasksLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : upcomingTasks.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title="No open tasks"
                description="Add tasks with deadlines to see your next actions here."
                actionLabel="Add a task"
                actionTo="/dashboard/tasks"
              />
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-smooth group"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      className="w-5 h-5 rounded-full border-2 border-muted-foreground/50 hover:border-primary hover:bg-primary/20 transition-smooth flex-shrink-0"
                      aria-label="Mark complete"
                    />
                    <Link to="/dashboard/tasks" className="flex-1 min-w-0 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">{task.title}</span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-xs',
                              task.priority === 'high'
                                ? 'bg-destructive/20 text-destructive'
                                : task.priority === 'medium'
                                  ? 'bg-chart-4/20 text-chart-4'
                                  : 'bg-muted text-muted-foreground',
                            )}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <span>{task.subject}</span>
                          <span>•</span>
                          <span>{formatDueLine(task.dueDate, task.dueTime)}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${task.progress ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{task.progress ?? 0}%</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-smooth" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent notes</h2>
              <Link to="/dashboard/notes" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {notesLoading ? (
              <div className="grid sm:grid-cols-3 gap-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : recentNotes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No notes yet"
                description="Capture lecture snippets and generate a local summary plus quiz questions."
                actionLabel="Open notes"
                actionTo="/dashboard/notes"
              />
            ) : (
              <div className="grid sm:grid-cols-3 gap-3">
                {recentNotes.map((note) => (
                  <Link
                    key={note.id}
                    to="/dashboard/notes"
                    className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-smooth group text-left"
                  >
                    <div className="font-medium text-foreground text-sm mb-1 line-clamp-2 group-hover:text-primary transition-smooth">
                      {note.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{note.subject}</div>
                    <div className="text-xs text-muted-foreground mt-2">{formatTimeShort(note.updatedAt)}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Today&apos;s plan</h2>
              <Link to="/dashboard/planner" className="text-sm text-primary hover:underline flex items-center gap-1">
                Edit
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {plansLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : todayPlans.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Nothing scheduled today"
                description="Add plan blocks with date and start time—today’s list updates automatically."
                actionLabel="Open planner"
                actionTo="/dashboard/planner"
              />
            ) : (
              <div className="space-y-2">
                {todayPlans.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-smooth',
                      item.status === 'completed' ? 'opacity-60 bg-secondary/20' : 'bg-secondary/30',
                    )}
                  >
                    <div className="text-xs text-muted-foreground w-16 flex-shrink-0">{item.startTime}</div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-sm font-medium truncate', 'text-foreground')}>{item.topic || 'Study block'}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.subject} · {item.durationMinutes}m
                      </div>
                    </div>
                    {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/dashboard/pomodoro"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-smooth"
              >
                <Clock className="w-6 h-6 text-primary" />
                <span className="text-sm text-foreground">Pomodoro</span>
              </Link>
              <Link
                to="/dashboard/notes"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-smooth"
              >
                <Brain className="w-6 h-6 text-chart-2" />
                <span className="text-sm text-foreground">Notes</span>
              </Link>
              <Link
                to="/dashboard/planner"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-smooth"
              >
                <Calendar className="w-6 h-6 text-chart-4" />
                <span className="text-sm text-foreground">Planner</span>
              </Link>
              <Link
                to="/dashboard/analytics"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/30 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-smooth"
              >
                <Target className="w-6 h-6 text-chart-3" />
                <span className="text-sm text-foreground">Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
