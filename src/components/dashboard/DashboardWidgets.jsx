import { useMemo } from 'react'
import { Sparkles, Activity, Clock, FileText, CheckCircle2, Calendar, Target, Brain, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AIInsights({ tasks, notes, pomodoroSessions, analytics, streak }) {
  const insights = useMemo(() => {
    const subjects = [...tasks.map(t => t.subject), ...notes.map(n => n.subject)].filter(Boolean)
    const counts = subjects.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {})
    const mostActive = Object.keys(counts).length > 0 ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) : 'General'
    
    const taskScore = Math.min(analytics.completedTasks * 5, 40)
    const streakScore = Math.min(streak * 5, 30)
    const focusScore = Math.min(analytics.studyHours * 10, 30)
    let score = Math.round(taskScore + streakScore + focusScore)
    if (score < 10 && (analytics.completedTasks > 0 || streak > 0)) score = 15
    
    let rec = "Consistency is key. Keep logging your sessions!"
    if (score > 80) rec = "Incredible momentum! Take short breaks to maintain focus."
    else if (analytics.pendingTasks > 5) rec = "You have many pending tasks. Try clearing a few quick ones."
    else if (streak === 0 && analytics.completedTasks === 0) rec = "Ready to start? Begin with a 25-minute focus block."
    else if (streak === 0) rec = "Time to build a new streak! Start a short Pomodoro session."
    else if (mostActive) rec = `You're focusing heavily on ${mostActive}. Make sure to balance your revision.`

    return {
      mostActive,
      score: score || 0,
      recommendation: rec
    }
  }, [tasks, notes, analytics, streak])

  return (
    <div className="glass-card rounded-2xl p-5 overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-chart-2 opacity-50" />
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">AI Study Insights</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Target className="w-4 h-4"/> Streak</span>
          <span className="font-semibold text-foreground">{streak} {streak === 1 ? 'day' : 'days'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Brain className="w-4 h-4"/> Most Studied</span>
          <span className="font-semibold text-foreground truncate max-w-[120px]">{insights.mostActive}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Activity className="w-4 h-4"/> Productivity</span>
          <span className={cn("font-bold", insights.score > 70 ? "text-green-500" : insights.score > 40 ? "text-yellow-500" : "text-primary")}>
            {insights.score}%
          </span>
        </div>
        
        <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">AI Recommendation</div>
          <p className="text-sm text-foreground leading-relaxed">{insights.recommendation}</p>
        </div>
      </div>
    </div>
  )
}

export function WeeklyHeatmap({ tasks, notes, pomodoroSessions }) {
  const heatmapData = useMemo(() => {
    const days = 28 // 4 weeks
    const data = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      data.push({ date: dateStr, count: 0, rawDate: d })
    }
    
    const addActivity = (dateStr) => {
      const day = data.find(d => d.date === dateStr)
      if (day) day.count++
    }
    
    tasks.filter(t => t.status === 'completed' && t.updatedAt).forEach(t => addActivity(t.updatedAt.slice(0, 10)))
    notes.forEach(n => addActivity(n.createdAt.slice(0, 10)))
    pomodoroSessions.forEach(s => addActivity(s.completedAt.slice(0, 10)))
    
    return data
  }, [tasks, notes, pomodoroSessions])

  const getColorClass = (count) => {
    if (count === 0) return 'bg-secondary/40'
    if (count <= 2) return 'bg-primary/30'
    if (count <= 4) return 'bg-primary/60'
    return 'bg-primary'
  }

  const hasData = heatmapData.some(d => d.count > 0)

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-chart-2" />
        <h2 className="text-lg font-semibold text-foreground">Weekly Consistency</h2>
      </div>
      
      {!hasData ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No recent activity. Complete tasks or focus sessions to build your heat map!</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 justify-start">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              title={`${day.count} activities on ${day.rawDate.toLocaleDateString()}`}
              className={cn(
                "w-6 h-6 rounded-md transition-colors duration-300 hover:ring-2 hover:ring-primary/50",
                getColorClass(day.count)
              )}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-secondary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/30" />
        <div className="w-3 h-3 rounded-sm bg-primary/60" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  )
}

export function ActivityFeed({ tasks, notes, pomodoroSessions, plans }) {
  const activities = useMemo(() => {
    const items = []
    tasks.filter(t => t.status === 'completed' && t.updatedAt).forEach(t => {
      items.push({ id: `t-${t.id}`, type: 'task', title: `Completed: ${t.title}`, timestamp: new Date(t.updatedAt).getTime(), icon: CheckCircle2, color: 'text-primary' })
    })
    notes.forEach(n => {
      items.push({ id: `n-${n.id}`, type: 'note', title: `Added: ${n.title}`, timestamp: new Date(n.createdAt).getTime(), icon: FileText, color: 'text-chart-2' })
    })
    pomodoroSessions.forEach(s => {
      items.push({ id: `p-${s.id}`, type: 'pomodoro', title: `Finished ${s.duration}m focus`, timestamp: new Date(s.completedAt).getTime(), icon: Clock, color: 'text-chart-3' })
    })
    plans.filter(p => p.createdAt).forEach(p => {
      items.push({ id: `pl-${p.id}`, type: 'plan', title: `Scheduled: ${p.topic}`, timestamp: new Date(p.createdAt).getTime(), icon: Calendar, color: 'text-chart-4' })
    })
    
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6)
  }, [tasks, notes, pomodoroSessions, plans])

  const timeAgo = (ts) => {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins || 1}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-chart-4" />
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        </div>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Your recent activity will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <act.icon className={cn("w-4 h-4", act.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium truncate group-hover:text-primary transition-colors">
                  {act.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(act.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
