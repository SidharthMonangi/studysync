import { useMemo, useState } from 'react'
import { Plus, Search, CheckCircle2, Calendar, Trash2, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTasks } from '@/context/TasksContext'
import { useToast } from '@/hooks/useToast'
import { formatDueLine } from '@/lib/dates'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'

const presetSubjects = ['General', 'Mathematics', 'Economics', 'Chemistry', 'Computer Science', 'Physics', 'English']

const statuses = ['All', 'To Do', 'In Progress', 'Completed']

export default function TasksPage() {
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleTaskComplete } = useTasks()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All Subjects')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: 'General',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    status: 'todo',
  })

  const subjectOptions = useMemo(() => {
    const fromTasks = [...new Set(tasks.map((t) => t.subject).filter(Boolean))]
    return ['All Subjects', ...new Set([...presetSubjects, ...fromTasks])]
  }, [tasks])

  const openNew = () => {
    setEditingId(null)
    setForm({
      title: '',
      description: '',
      subject: 'General',
      dueDate: '',
      dueTime: '',
      priority: 'medium',
      status: 'todo',
    })
    setShowModal(true)
  }

  const openEdit = (task) => {
    setEditingId(task.id)
    setForm({
      title: task.title,
      description: task.description || '',
      subject: task.subject || 'General',
      dueDate: task.dueDate || '',
      dueTime: task.dueTime || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
    })
    setShowModal(true)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'All Subjects' || task.subject === selectedSubject
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'To Do' && task.status === 'todo') ||
      (selectedStatus === 'In Progress' && task.status === 'in-progress') ||
      (selectedStatus === 'Completed' && task.status === 'completed')
    return matchesSearch && matchesSubject && matchesStatus
  })

  const saveTask = async () => {
    if (!form.title.trim()) {
      toast.error('Task title is required')
      return
    }
    
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateTask(editingId, {
          title: form.title.trim(),
          description: form.description.trim(),
          subject: form.subject.trim() || 'General',
          dueDate: form.dueDate,
          dueTime: form.dueTime,
          priority: form.priority,
          status: form.status,
        })
        toast.success('Task updated')
      } else {
        await addTask({
          title: form.title.trim(),
          description: form.description.trim(),
          subject: form.subject.trim() || 'General',
          dueDate: form.dueDate,
          dueTime: form.dueTime,
          priority: form.priority,
          status: form.status,
        })
        toast.success('Task added')
      }
      setShowModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    toast.success('Task deleted')
  }

  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Task manager</h1>
          <p className="text-muted-foreground mt-1">Organize and track your academic tasks (saved in this browser)</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add task
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-foreground">{taskCounts.all}</div>
          <div className="text-sm text-muted-foreground">Total tasks</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-chart-4">{taskCounts.todo}</div>
          <div className="text-sm text-muted-foreground">To do</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-primary">{taskCounts.inProgress}</div>
          <div className="text-sm text-muted-foreground">In progress</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-chart-2">{taskCounts.completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:border-primary outline-none"
            >
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:border-primary outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Start your task list"
            description="Add titles, subjects, deadlines, and priorities—everything persists after refresh."
            actionLabel="Add your first task"
            onAction={openNew}
          />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No tasks match filters"
            description="Try another subject or status, or clear the search box."
            actionLabel="Reset filters"
            onAction={() => {
              setSearchQuery('')
              setSelectedSubject('All Subjects')
              setSelectedStatus('All')
            }}
          />
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'glass-card rounded-xl p-4 hover:border-primary/30 transition-smooth',
                task.status === 'completed' && 'opacity-60',
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleTaskComplete(task.id)}
                  className={cn(
                    'mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-smooth flex items-center justify-center',
                    task.status === 'completed'
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/50 hover:border-primary hover:bg-primary/20',
                  )}
                  aria-label="Toggle complete"
                >
                  {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'font-medium',
                        task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground',
                      )}
                    >
                      {task.title}
                    </span>
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
                    <span className="text-xs text-muted-foreground capitalize border border-border rounded px-1.5 py-0.5">
                      {task.status === 'in-progress' ? 'in progress' : task.status}
                    </span>
                  </div>
                  {task.description ? <p className="text-sm text-muted-foreground mt-1">{task.description}</p> : null}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary/50" />
                      {task.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDueLine(task.dueDate, task.dueTime)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(task)}
                    className="p-2 text-muted-foreground hover:text-primary transition-smooth"
                    aria-label="Edit task"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-smooth"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
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
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-foreground mb-4">{editingId ? 'Edit task' : 'Add task'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                <Input
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  placeholder="Optional details"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-none h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <Input
                    list="task-subjects"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                  <datalist id="task-subjects">
                    {presetSubjects.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:border-primary outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Deadline date</label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Deadline time</label>
                  <Input
                    type="time"
                    value={form.dueTime}
                    onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm focus:border-primary outline-none"
                >
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 glass-button" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="button" onClick={saveTask} disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? 'Save changes' : 'Add task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
