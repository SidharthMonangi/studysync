import { useMemo, useState } from 'react'
import { Calendar, Clock, Plus, Trash2, Pencil, CheckCircle2, BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { usePlanner } from '@/context/PlannerContext'
import { useTasks } from '@/context/TasksContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useToast } from '@/hooks/useToast'
import { todayISO, formatISODate } from '@/lib/dates'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { generateStudyPlan } from '@/lib/gemini'
import { Sparkles } from 'lucide-react'

export default function PlannerPage() {
  const { plans, isLoading, addPlan, updatePlan, deletePlan } = usePlanner()
  const { analytics } = useAnalytics()
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterDate, setFilterDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const { tasks } = useTasks()
  const [form, setForm] = useState({
    subject: 'General',
    topic: '',
    date: todayISO(),
    startTime: '09:00',
    durationMinutes: 25,
    status: 'planned',
  })

  const today = todayISO()
  const todayPlans = useMemo(() => {
    return [...plans]
      .filter((p) => p.date === today)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  }, [plans, today])

  const visiblePlans = useMemo(() => {
    const list = filterDate ? plans.filter((p) => p.date === filterDate) : [...plans]
    return list.sort((a, b) => {
      const da = `${a.date}T${a.startTime || '00:00'}`
      const db = `${b.date}T${b.startTime || '00:00'}`
      return db.localeCompare(da)
    })
  }, [plans, filterDate])

  const taskDone = analytics.completedTasks
  const taskTotal = analytics.totalTasks || 0
  const taskRate = taskTotal === 0 ? 0 : Math.round((taskDone / taskTotal) * 100)

  const openNew = () => {
    setEditingId(null)
    setForm({
      subject: 'General',
      topic: '',
      date: filterDate || todayISO(),
      startTime: '09:00',
      durationMinutes: 25,
      status: 'planned',
    })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditingId(p.id)
    setForm({
      subject: p.subject || 'General',
      topic: p.topic || '',
      date: p.date || todayISO(),
      startTime: p.startTime || '09:00',
      durationMinutes: p.durationMinutes || 25,
      status: p.status || 'planned',
    })
    setShowModal(true)
  }

  const savePlan = async () => {
    if (!form.date) {
      toast.error('Date is required')
      return
    }
    
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updatePlan(editingId, {
          subject: form.subject.trim() || 'General',
          topic: form.topic.trim(),
          date: form.date,
          startTime: form.startTime,
          durationMinutes: Number(form.durationMinutes) || 25,
          status: form.status,
        })
        toast.success('Plan updated')
      } else {
        await addPlan({
          subject: form.subject.trim() || 'General',
          topic: form.topic.trim(),
          date: form.date,
          startTime: form.startTime,
          durationMinutes: Number(form.durationMinutes) || 25,
          status: form.status,
        })
        toast.success('Plan added')
      }
      setShowModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    await deletePlan(id)
    toast.success('Plan deleted')
  }

  const handleToggle = async (id, status) => {
    await updatePlan(id, { status: status === 'completed' ? 'planned' : 'completed' })
  }

  const handleGeneratePlan = async () => {
    const openTasks = tasks.filter(t => t.status !== 'completed')
    if (openTasks.length === 0) {
      toast.error('No open tasks to generate a plan for.')
      return
    }

    setIsGeneratingPlan(true)
    try {
      const suggestedPlans = await generateStudyPlan(openTasks)
      
      let currentHour = 9
      let currentMinute = 0
      
      for (const sp of suggestedPlans) {
        const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
        
        await addPlan({
          subject: sp.subject || 'General',
          topic: sp.topic || 'Study Session',
          date: todayISO(),
          startTime: startTime,
          durationMinutes: sp.durationMinutes || 25,
          status: 'planned'
        })
        
        currentMinute += (sp.durationMinutes || 25)
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60)
          currentMinute = currentMinute % 60
        }
      }
      
      toast.success('Generated AI study plan!')
    } catch (err) {
      if (err.name === 'GeminiQuotaError') {
        let currentHour = 9
        let currentMinute = 0
        
        for (const task of openTasks) {
          const startTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
          
          await addPlan({
            subject: task.subject || 'General',
            topic: task.title || 'Study Session',
            date: todayISO(),
            startTime: startTime,
            durationMinutes: 25,
            status: 'planned'
          })
          
          currentMinute += 25
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60)
            currentMinute = currentMinute % 60
          }
        }
        toast.warning('Gemini quota reached. Showing local fallback materials.')
      } else {
        toast.error(err.message || 'Failed to generate study plan.')
      }
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Study planner</h1>
          <p className="text-muted-foreground mt-1">
            Build your own blocks or use Gemini AI to generate a schedule from your open tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleGeneratePlan} disabled={isGeneratingPlan} variant="outline" className="glass-button text-primary border-primary/20 hover:bg-primary/10">
            {isGeneratingPlan ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Suggest Plan with AI
          </Button>
          <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add plan item
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Today ({formatISODate(today)})</h2>
              <p className="text-sm text-muted-foreground">
                {todayPlans.length} block{todayPlans.length === 1 ? '' : 's'} scheduled
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-2 mt-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : todayPlans.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No plan for today"
              description="Add a row with today’s date to see it here and on the dashboard."
              actionLabel="Add plan item"
              onAction={openNew}
            />
          ) : (
            <ul className="space-y-2 mt-4">
              {todayPlans.map((p) => (
                <li
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border border-border/60',
                    p.status === 'completed' ? 'bg-secondary/20 opacity-80' : 'bg-secondary/30',
                  )}
                >
                  <span className="text-sm text-muted-foreground w-14 flex-shrink-0">{p.startTime}</span>
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{p.topic || 'Study session'}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.subject} · {p.durationMinutes}m · {p.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(p.id, p.status)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary"
                    aria-label="Toggle complete"
                  >
                    <CheckCircle2 className={cn('w-4 h-4', p.status === 'completed' && 'text-primary')} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Progress hints</h3>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Plan completion</span>
              <span>{analytics.planRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${analytics.planRate}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.planDone} of {analytics.planTotal} plan items marked done
            </p>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Tasks completed</span>
              <span>{taskRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-chart-2 transition-all" style={{ width: `${taskRate}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {taskDone} of {taskTotal} tasks
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">All plan items</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Filter by date</label>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-secondary/50 border-border w-auto max-w-[200px]"
            />
            {filterDate && (
              <Button type="button" variant="outline" size="sm" className="glass-button" onClick={() => setFilterDate('')}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No study plan yet"
            description="Each row is a subject, topic, date, start time, duration, and status—everything syncs to analytics."
            actionLabel="Create first block"
            onAction={openNew}
          />
        ) : visiblePlans.length === 0 ? (
          <p className="text-muted-foreground text-sm mt-4">No items for this date.</p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 pr-3">Date</th>
                  <th className="pb-2 pr-3">Start</th>
                  <th className="pb-2 pr-3">Subject</th>
                  <th className="pb-2 pr-3">Topic</th>
                  <th className="pb-2 pr-3">Duration</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {visiblePlans.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2 pr-3 whitespace-nowrap">{p.date}</td>
                    <td className="py-2 pr-3">{p.startTime}</td>
                    <td className="py-2 pr-3">{p.subject}</td>
                    <td className="py-2 pr-3 max-w-[200px] truncate">{p.topic}</td>
                    <td className="py-2 pr-3">{p.durationMinutes}m</td>
                    <td className="py-2 pr-3 capitalize">{p.status}</td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="p-1.5 text-muted-foreground hover:text-primary transition-smooth"
                        onClick={() => handleToggle(p.id, p.status)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-1.5 text-muted-foreground hover:text-foreground transition-smooth" onClick={() => openEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-1.5 text-muted-foreground hover:text-destructive transition-smooth" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm border-0 cursor-default"
            onClick={() => setShowModal(false)}
          />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-foreground mb-4">{editingId ? 'Edit plan item' : 'New plan item'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Topic</label>
                <Input
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="bg-secondary/50 border-border"
                  placeholder="e.g. Chapter 5 problem set"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-secondary/50 border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start time</label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
                  <Input
                    type="number"
                    min={5}
                    step={5}
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:border-primary outline-none"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 glass-button" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="button" onClick={savePlan} disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
