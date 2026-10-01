import { useState } from 'react'
import { useAuth } from '@/context/AuthStore'
import { useToast } from '@/hooks/ToastStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { friendlyError } from '@/lib/errors'
import { saveTheme } from '@/lib/theme'
import { useTasks } from '@/context/TasksStore'
import { useNotes } from '@/context/NotesStore'
import { usePlanner } from '@/context/PlannerStore'
import { usePomodoro } from '@/context/PomodoroStore'
export default function SettingsPage() {
  const { profile, currentUser, updateProfile, logout } = useAuth()
  const toast = useToast()
  const { tasks } = useTasks(); const { notes } = useNotes(); const { plans } = usePlanner(); const { pomodoroSessions } = usePomodoro()
  const [form, setForm] = useState({ name: profile.name, college: profile.college, semesterYear: profile.semesterYear, studyGoal: profile.studyGoal })
  const [saving, setSaving] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('studysync-theme') || 'dark')
  const save = async event => {
    event.preventDefault(); setSaving(true)
    try { await updateProfile(Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]))); toast.success('Profile saved') }
    catch (error) { toast.error(friendlyError(error)) } finally { setSaving(false) }
  }
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), profile, tasks, notes, plans, pomodoroSessions }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'studysync-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <div className="max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold">Your workspace settings</h1><p className="text-muted-foreground mt-2">Make StudySync yours. Your profile is synced privately to your account.</p></div>
    <form onSubmit={save} className="glass-card rounded-2xl p-6 space-y-5"><h2 className="text-xl font-semibold">Profile</h2><p className="text-sm text-muted-foreground">{currentUser?.email}</p>
      {[['name', 'Display name', 100], ['college', 'College or school', 200], ['semesterYear', 'Semester and year', 100], ['studyGoal', 'Study goal', 1000]].map(([key, label, maxLength]) => <label key={key} className="block text-sm font-medium">{label}<Input required={key === 'name'} maxLength={maxLength} className="mt-2" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}
      <Button disabled={saving} type="submit">{saving ? 'Saving…' : 'Save profile'}</Button>
    </form>
    <section className="glass-card rounded-2xl p-6 space-y-4"><h2 className="text-xl font-semibold">Appearance</h2><div className="flex flex-wrap gap-3">{['dark', 'light', 'system'].map(value => <Button key={value} variant={theme === value ? 'default' : 'outline'} aria-pressed={theme === value} onClick={() => { saveTheme(value); setTheme(value) }}>{value[0].toUpperCase() + value.slice(1)}</Button>)}</div></section>
    <section className="glass-card rounded-2xl p-6 space-y-4"><h2 className="text-xl font-semibold">Your data</h2><p className="text-sm text-muted-foreground">Download a private backup of your notes, tasks, plans, and focus history.</p><Button variant="outline" onClick={exportData}>Export my data</Button><p className="text-sm text-muted-foreground">AI requests send the selected notes or tasks to Google Gemini. Review generated answers against your course material.</p><Button variant="outline" onClick={() => logout().catch(error => toast.error(friendlyError(error)))}>Sign out</Button></section>
  </div>
}
