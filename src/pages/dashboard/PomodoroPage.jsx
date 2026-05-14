import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Coffee,
  Brain,
  Target,
  Clock,
  SkipForward,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePomodoro } from '@/context/PomodoroContext'
import { useTasks } from '@/context/TasksContext'
import { useToast } from '@/hooks/useToast'
import { todayISO } from '@/lib/dates'

export default function PomodoroPage() {
  const { pomodoroSettings, setPomodoroSettings, pomodoroSessions, recordFocusSessionComplete } = usePomodoro()
  const { tasks } = useTasks()
  const toast = useToast()

  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(() => Math.max(1, Number(pomodoroSettings.focus) || 25) * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [focusCycles, setFocusCycles] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsDraft, setSettingsDraft] = useState(pomodoroSettings)
  const [currentTask, setCurrentTask] = useState('Study session')

  const timeLeftRef = useRef(timeLeft)
  const modeRef = useRef(mode)
  const settingsRef = useRef(pomodoroSettings)
  const handleCompleteRef = useRef(() => {})

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])
  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    settingsRef.current = pomodoroSettings
  }, [pomodoroSettings])

  const switchMode = useCallback((newMode) => {
    setMode(newMode)
    const s = settingsRef.current
    const len = Math.max(1, Number(newMode === 'focus' ? s.focus : newMode === 'shortBreak' ? s.shortBreak : s.longBreak) || 25)
    setTimeLeft(len * 60)
  }, [])

  const handleComplete = useCallback(() => {
    setIsRunning(false)
    const m = modeRef.current
    const s = settingsRef.current
    if (m === 'focus') {
      recordFocusSessionComplete(s.focus)
      setFocusCycles((c) => {
        const next = c + 1
        const nextMode = next % s.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
        queueMicrotask(() => switchMode(nextMode))
        return next
      })
    } else {
      switchMode('focus')
    }
  }, [recordFocusSessionComplete, switchMode])

  useEffect(() => {
    handleCompleteRef.current = handleComplete
  }, [handleComplete])

  useEffect(() => {
    if (!isRunning) return undefined
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return prev
        if (prev === 1) {
          queueMicrotask(() => handleCompleteRef.current())
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning])

  useEffect(() => {
    setSettingsDraft(pomodoroSettings)
    if (!isRunning) {
      const s = pomodoroSettings
      const len = Math.max(1, Number(mode === 'focus' ? s.focus : mode === 'shortBreak' ? s.shortBreak : s.longBreak) || 25)
      setTimeLeft(len * 60)
    }
  }, [pomodoroSettings, isRunning, mode])

  const currentDuration = Math.max(1, Number(mode === 'focus' ? pomodoroSettings.focus : mode === 'shortBreak' ? pomodoroSettings.shortBreak : pomodoroSettings.longBreak) || 25)
  const totalTime = currentDuration * 60
  const progress = totalTime === 0 ? 0 : ((totalTime - timeLeft) / totalTime) * 100

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => setIsRunning((r) => !r)

  const resetTimer = () => {
    const s = pomodoroSettings
    const len = Math.max(1, Number(mode === 'focus' ? s.focus : mode === 'shortBreak' ? s.shortBreak : s.longBreak) || 25)
    setTimeLeft(len * 60)
    setIsRunning(false)
  }

  const skipSession = () => {
    setIsRunning(false)
    const m = modeRef.current
    const s = settingsRef.current
    if (m === 'focus') {
      const next = (focusCycles + 1) % s.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
      switchMode(next)
    } else {
      switchMode('focus')
    }
  }

  const saveSettingsFromModal = () => {
    const next = {
      focus: Math.min(120, Math.max(1, Number(settingsDraft.focus) || 25)),
      shortBreak: Math.min(120, Math.max(1, Number(settingsDraft.shortBreak) || 5)),
      longBreak: Math.min(120, Math.max(1, Number(settingsDraft.longBreak) || 15)),
      sessionsBeforeLongBreak: Math.min(8, Math.max(2, Number(settingsDraft.sessionsBeforeLongBreak) || 4)),
    }
    setPomodoroSettings(next)
    setShowSettings(false)
    setIsRunning(false)
    const len = Math.max(1, Number(mode === 'focus' ? next.focus : mode === 'shortBreak' ? next.shortBreak : next.longBreak) || 25)
    setTimeLeft(len * 60)
    toast.success('Timer settings saved')
  }

  const today = todayISO()
  const todaySessions = useMemo(
    () => pomodoroSessions.filter((s) => (s.completedAt || '').startsWith(today)),
    [pomodoroSessions, today],
  )
  const todayMinutes = useMemo(() => todaySessions.reduce((a, s) => a + (s.focusMinutes || 0), 0), [todaySessions])

  const formatMinutes = (m) => {
    const h = Math.floor(m / 60)
    const min = m % 60
    if (h <= 0) return `${min}m`
    return `${h}h ${min}m`
  }

  const quickPickTasks = useMemo(
    () => tasks.filter((t) => t.status !== 'completed').slice(0, 5),
    [tasks],
  )

  const dots = pomodoroSettings.sessionsBeforeLongBreak
  const mod = focusCycles % dots
  const filledDots = mod === 0 && focusCycles > 0 ? dots : mod

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Pomodoro timer</h1>
          <p className="text-muted-foreground mt-1">Completed focus blocks are saved and roll into analytics study hours.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setShowSettings(true)} className="glass-button">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6 lg:p-8">
            <div className="flex justify-center gap-2 mb-8">
              <button
                type="button"
                onClick={() => {
                  setIsRunning(false)
                  switchMode('focus')
                }}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-smooth',
                  mode === 'focus'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
              >
                Focus
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRunning(false)
                  switchMode('shortBreak')
                }}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-smooth',
                  mode === 'shortBreak'
                    ? 'bg-chart-2 text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
              >
                Short break
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRunning(false)
                  switchMode('longBreak')
                }}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-smooth',
                  mode === 'longBreak'
                    ? 'bg-chart-4 text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
              >
                Long break
              </button>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative group">
                {/* Outer subtle glow */}
                <div className={cn(
                  "absolute inset-2 rounded-full blur-2xl opacity-20 transition-all duration-1000",
                  mode === 'focus' ? 'bg-primary' : mode === 'shortBreak' ? 'bg-chart-2' : 'bg-chart-4'
                )} />
                <svg className="w-64 h-64 lg:w-80 lg:h-80 transform -rotate-90 drop-shadow-md relative z-10">
                  <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-secondary/50" strokeWidth="6" />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className={cn(
                      'fill-none transition-all duration-1000 ease-in-out',
                      mode === 'focus' ? 'stroke-primary' : mode === 'shortBreak' ? 'stroke-chart-2' : 'stroke-chart-4',
                    )}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}%`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - Math.max(0, Math.min(100, progress)) / 100)}%`}
                    style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <span className="text-6xl lg:text-7xl font-bold text-foreground font-mono tracking-tighter drop-shadow-sm">{formatTime(timeLeft)}</span>
                  <div className="mt-3 px-3 py-1 rounded-full bg-background/50 border border-border/50 backdrop-blur-sm flex flex-col items-center">
                    <span className={cn(
                      "text-xs font-semibold uppercase tracking-widest",
                      mode === 'focus' ? 'text-primary' : mode === 'shortBreak' ? 'text-chart-2' : 'text-chart-4'
                    )}>
                      {mode.replace('Break', ' break')}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {mode === 'focus' ? `Stay focused for ${currentDuration}m` : mode === 'shortBreak' ? `Short break in progress` : `Long break mode`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="glass-button rounded-xl px-4 py-2 flex items-center gap-2 max-w-md">
                <Target className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{currentTask}</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button type="button" variant="outline" size="icon" onClick={resetTimer} className="w-12 h-12 rounded-xl glass-button">
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                onClick={toggleTimer}
                className={cn(
                  'w-16 h-16 rounded-2xl text-lg',
                  mode === 'focus'
                    ? 'bg-primary hover:bg-primary/90'
                    : mode === 'shortBreak'
                      ? 'bg-chart-2 hover:bg-chart-2/90'
                      : 'bg-chart-4 hover:bg-chart-4/90',
                  'text-primary-foreground',
                )}
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={skipSession} className="w-12 h-12 rounded-xl glass-button">
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {[...Array(dots)].map((_, i) => (
                <div
                  key={i}
                  className={cn('w-3 h-3 rounded-full transition-smooth', i < filledDots ? 'bg-primary' : 'bg-secondary')}
                />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Focus blocks completed in this session (resets on refresh): {focusCycles}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Today ({today})</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Focus sessions</span>
                </div>
                <span className="text-xl font-bold text-foreground">{todaySessions.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-chart-2" />
                  <span className="text-xs text-muted-foreground">Focus minutes</span>
                </div>
                <span className="text-xl font-bold text-foreground">{formatMinutes(todayMinutes)}</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/30 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <Coffee className="w-4 h-4 text-chart-4" />
                  <span className="text-xs text-muted-foreground">Breaks</span>
                </div>
                <span className="text-sm text-muted-foreground">Breaks are not logged separately in this build.</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent focus sessions</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pomodoroSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Finish a focus timer to build history here.</p>
              ) : (
                pomodoroSessions.slice(0, 12).map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">Focus block</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.completedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{session.focusMinutes}m</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick picks (from tasks)</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setCurrentTask('Study session')}
                className={cn(
                  'w-full text-left p-3 rounded-xl transition-smooth',
                  currentTask === 'Study session'
                    ? 'bg-primary/10 border border-primary/30 text-primary'
                    : 'bg-secondary/30 hover:bg-secondary/50 text-foreground',
                )}
              >
                Study session
              </button>
              {quickPickTasks.map((task) => (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => setCurrentTask(task.title)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl transition-smooth',
                    currentTask === task.title
                      ? 'bg-primary/10 border border-primary/30 text-primary'
                      : 'bg-secondary/30 hover:bg-secondary/50 text-foreground',
                  )}
                >
                  <span className="text-sm truncate block">{task.title}</span>
                  <span className="text-xs text-muted-foreground">{task.subject}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm border-0 cursor-default"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-foreground mb-4">Timer settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Focus: {settingsDraft.focus} min</label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={settingsDraft.focus}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, focus: parseInt(e.target.value, 10) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Short break: {settingsDraft.shortBreak} min</label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={settingsDraft.shortBreak}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, shortBreak: parseInt(e.target.value, 10) })}
                  className="w-full accent-chart-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Long break: {settingsDraft.longBreak} min</label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={settingsDraft.longBreak}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, longBreak: parseInt(e.target.value, 10) })}
                  className="w-full accent-chart-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sessions before long break: {settingsDraft.sessionsBeforeLongBreak}
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={settingsDraft.sessionsBeforeLongBreak}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, sessionsBeforeLongBreak: parseInt(e.target.value, 10) })
                  }
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowSettings(false)} className="flex-1 glass-button">
                Cancel
              </Button>
              <Button type="button" onClick={saveSettingsFromModal} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Save settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
