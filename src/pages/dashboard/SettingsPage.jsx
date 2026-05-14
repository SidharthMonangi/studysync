import { useState, useEffect } from 'react'
import {
  User,
  Bell,
  Moon,
  Sun,
  Globe,
  Trash2,
  Camera,
  Check,
  Sparkles,
  Database,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'

function initialsFromName(name) {
  const p = (name || '').trim().split(/\s+/)
  if (p.length === 0 || !p[0]) return 'S'
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase()
  return `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase()
}

const notificationSettings = [
  { id: 'email', label: 'Email reminders', description: 'Would send email when a backend exists', enabled: false },
  { id: 'push', label: 'Push notifications', description: 'Browser push is not wired in this build', enabled: false },
  { id: 'weekly', label: 'Weekly summary', description: 'Placeholder toggle (not persisted yet)', enabled: false },
  { id: 'reminders', label: 'Study nudges', description: 'Placeholder toggle (not persisted yet)', enabled: false },
]

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Moon },
  { id: 'data', label: 'Data', icon: Database },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { profile, currentUser, updateProfile, resetAllLocalData, logout } = useAuth()
  const toast = useToast()
  const [activeSection, setActiveSection] = useState('profile')
  const [form, setForm] = useState({
    name: profile.name || '',
    college: profile.college || '',
    semesterYear: profile.semesterYear || '',
    studyGoal: profile.studyGoal || '',
  })
  const [notifications, setNotifications] = useState(notificationSettings)
  const [theme, setTheme] = useState('dark')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm({
      name: profile.name || '',
      college: profile.college || '',
      semesterYear: profile.semesterYear || '',
      studyGoal: profile.studyGoal || '',
    })
  }, [profile])

  const syncFormFromProfile = () => {
    setForm({
      name: profile.name || '',
      college: profile.college || '',
      semesterYear: profile.semesterYear || '',
      studyGoal: profile.studyGoal || '',
    })
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Display name is required')
      return
    }
    
    setIsSaving(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        college: form.college.trim(),
        semesterYear: form.semesterYear.trim(),
        studyGoal: form.studyGoal.trim(),
      })
      await new Promise((r) => setTimeout(r, 300))
      syncFormFromProfile()
      toast.success('Profile updated successfully')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleNotification = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)))
  }

  const handleClearEverything = () => {
    if (!window.confirm('Delete ALL StudySync data in this browser and sign out?')) return
    resetAllLocalData()
    navigate('/', { replace: true })
  }

  const handleLogoutOnly = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your Firebase account and profile details.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  type="button"
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth text-left',
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Profile</h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                      {initialsFromName(form.name || currentUser?.name)}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-50 cursor-not-allowed"
                      title="Avatars would upload to a backend later"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{form.name.trim() || 'Student'}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser?.email || '—'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary capitalize flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Firebase account
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Email is tied to your Firebase account and isn&apos;t editable here directly.
                </p>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Display name</label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">College / school</label>
                      <Input
                        value={form.college}
                        onChange={(e) => setForm({ ...form, college: e.target.value })}
                        className="bg-secondary/50 border-border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Semester & year</label>
                    <Input
                      value={form.semesterYear}
                      onChange={(e) => setForm({ ...form, semesterYear: e.target.value })}
                      className="bg-secondary/50 border-border"
                      placeholder="e.g. Fall 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Study goal</label>
                    <textarea
                      value={form.studyGoal}
                      onChange={(e) => setForm({ ...form, studyGoal: e.target.value })}
                      className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-y"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                  <Button type="button" variant="outline" className="glass-button" onClick={syncFormFromProfile}>
                    Reset
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Notifications</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Toggles are UI-only for now—nothing is sent without a backend and service worker setup.
              </p>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                  >
                    <div>
                      <h3 className="font-medium text-foreground">{notification.label}</h3>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotification(notification.id)}
                      className={cn(
                        'relative w-12 h-6 rounded-full transition-smooth',
                        notification.enabled ? 'bg-primary' : 'bg-secondary',
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                          notification.enabled ? 'left-7' : 'left-1',
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-3">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Globe },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl transition-smooth',
                          theme === option.value
                            ? 'bg-primary/10 border border-primary/30 text-primary'
                            : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50',
                        )}
                      >
                        <option.icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{option.label}</span>
                        {theme === option.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    This build ships with a polished dark shell; wiring light mode would mean extending CSS tokens.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">Session</h2>
                <p className="text-sm text-muted-foreground mb-4">Sign out of your Firebase account securely.</p>
                <Button type="button" variant="outline" className="glass-button text-destructive border-destructive hover:bg-destructive/10" onClick={handleLogoutOnly}>
                  Log out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
