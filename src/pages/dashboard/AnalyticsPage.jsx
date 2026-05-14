import { useMemo } from 'react'
import { Clock, CheckCircle2, Brain, Calendar, FileText, ListTodo, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useTasks } from '@/context/TasksContext'
import { usePlanner } from '@/context/PlannerContext'
import { usePomodoro } from '@/context/PomodoroContext'
import { useNotes } from '@/context/NotesContext'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const PIE_COLORS = ['#22d3ee', '#a78bfa', '#f97316', '#facc15', '#ec4899', '#4ade80', '#38bdf8']

function weekDaySeries() {
  const out = []
  const d = new Date()
  for (let i = 6; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    const iso = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
    out.push({
      iso,
      label: x.toLocaleDateString(undefined, { weekday: 'short' }),
    })
  }
  return out
}

export default function AnalyticsPage() {
  const { analytics } = useAnalytics()
  const { tasks } = useTasks()
  const { plans } = usePlanner()
  const { notes } = useNotes()
  const { pomodoroSessions } = usePomodoro()

  const week = useMemo(() => weekDaySeries(), [])

  const focusChart = useMemo(() => {
    return week.map(({ iso, label }) => {
      const minutes = pomodoroSessions
        .filter((s) => (s.completedAt || '').startsWith(iso))
        .reduce((a, s) => a + (s.focusMinutes || 0), 0)
      return { day: label, hours: Math.round((minutes / 60) * 10) / 10, minutes }
    })
  }, [pomodoroSessions, week])

  const tasksCreatedChart = useMemo(() => {
    return week.map(({ iso, label }) => {
      const count = tasks.filter((t) => (t.createdAt || '').startsWith(iso)).length
      return { day: label, created: count }
    })
  }, [tasks, week])

  const subjectPie = useMemo(() => {
    const map = {}
    tasks.forEach((t) => {
      const s = t.subject || 'General'
      map[s] = (map[s] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const activity = useMemo(() => {
    const rows = []
    tasks.forEach((t) => {
      rows.push({
        sort: t.createdAt || '',
        text: t.status === 'completed' ? 'Task completed' : 'Task updated',
        detail: t.title,
      })
    })
    pomodoroSessions.forEach((s) => {
      rows.push({
        sort: s.completedAt || '',
        text: 'Focus session',
        detail: `${s.focusMinutes} minutes`,
      })
    })
    notes.forEach((n) => {
      rows.push({
        sort: n.updatedAt || n.createdAt || '',
        text: 'Note saved',
        detail: n.title,
      })
    })
    return rows
      .filter((r) => r.sort)
      .sort((a, b) => b.sort.localeCompare(a.sort))
      .slice(0, 12)
      .map((r) => ({
        ...r,
        time: new Date(r.sort).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      }))
  }, [tasks, pomodoroSessions, notes])

  const stats = [
    {
      label: 'Estimated study hours',
      value: `${analytics.studyHours < 0.05 && analytics.studyHours > 0 ? '<0.1' : analytics.studyHours.toFixed(1)}h`,
      sub: 'from completed Pomodoro focus blocks',
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Tasks completed',
      value: String(analytics.completedTasks),
      sub: `${analytics.pendingTasks} still open`,
      icon: CheckCircle2,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      label: 'Focus sessions',
      value: String(analytics.focusSessions),
      sub: 'stored in this browser',
      icon: Brain,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      label: 'Plan completion',
      value: `${analytics.planRate}%`,
      sub: `${analytics.planDone}/${analytics.planTotal || 0} plan items`,
      icon: Calendar,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
  ]

  const taskCompletionRate = analytics.totalTasks === 0 ? 0 : Math.round((analytics.completedTasks / analytics.totalTasks) * 100)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Charts reflect your local data from the past seven days (rolling).</p>
        </div>
        <Button type="button" variant="outline" className="glass-button" disabled title="Export needs a backend file download—add when you wire APIs.">
          <Calendar className="w-4 h-4 mr-2" />
          Export (soon)
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 lg:p-5 hover:border-primary/30 transition-smooth">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bgColor)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xs text-primary/90 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Focus time (hours)</h3>
            <div className="text-sm text-muted-foreground">Last 7 days</div>
          </div>
          <div className="h-64">
            {focusChart.every((d) => d.minutes === 0) ? (
              <p className="text-sm text-muted-foreground h-full flex items-center justify-center">Complete focus timers to populate this chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusChart}>
                  <defs>
                    <linearGradient id="colorFocusH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(18, 18, 24, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#22d3ee" fillOpacity={1} fill="url(#colorFocusH)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Tasks created</h3>
            <div className="text-sm text-muted-foreground">Last 7 days</div>
          </div>
          <div className="h-64">
            {tasksCreatedChart.every((d) => d.created === 0) ? (
              <p className="text-sm text-muted-foreground h-full flex items-center justify-center">Add tasks to see daily creation counts.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksCreatedChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(18, 18, 24, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="created" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Tasks by subject</h3>
          {subjectPie.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {subjectPie.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(18, 18, 24, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {subjectPie.map((subject, index) => (
                  <div key={subject.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-xs text-muted-foreground truncate">{subject.name}</span>
                    <span className="text-xs text-foreground ml-auto">{subject.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">At a glance</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <ListTodo className="w-4 h-4" />
                  Task completion
                </span>
                <span className="text-foreground">{taskCompletionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${taskCompletionRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Study plan done
                </span>
                <span className="text-foreground">{analytics.planRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-chart-2 transition-all" style={{ width: `${analytics.planRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </span>
                <span className="text-foreground">{analytics.notesCreated}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total notes stored locally.</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Use tasks, Pomodoro, and notes to build a timeline here.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {activity.map((row, index) => (
                <div key={`${row.sort}-${index}`} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground">{row.text}</div>
                    <div className="text-xs text-muted-foreground truncate">{row.detail}</div>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">{row.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
