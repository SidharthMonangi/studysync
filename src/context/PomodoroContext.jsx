import { useEffect, useState } from 'react'
import { PomodoroContext } from './PomodoroStore'
import { useUserCollection } from '@/hooks/useUserCollection'
import { onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthStore'
import { withTimeout, friendlyError } from '@/lib/errors'
const defaults = { focus: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLongBreak: 4 }
export function PomodoroProvider({ children }) {
  const store = useUserCollection('sessions', 'completedAt')
  const { userId } = useAuth()
  const [settings, setSettings] = useState({ uid: null, value: defaults, loading: true, error: '' })
  useEffect(() => {
    if (!userId) return
    const timer = setTimeout(() => setSettings({ uid: userId, value: defaults, loading: false, error: 'Focus settings sync is taking too long. Check your connection.' }), 12000)
    const stop = onSnapshot(doc(db, 'users', userId, 'pomodoroSettings', 'default'), snap => {
      clearTimeout(timer); setSettings({ uid: userId, value: { ...defaults, ...(snap.exists() ? snap.data() : {}) }, loading: false, error: '' })
    }, error => { clearTimeout(timer); setSettings({ uid: userId, value: defaults, loading: false, error: friendlyError(error) }) })
    return () => { clearTimeout(timer); stop() }
  }, [userId])
  const setPomodoroSettings = next => withTimeout(setDoc(doc(db, 'users', userId, 'pomodoroSettings', 'default'), next))
  const recordFocusSessionComplete = focusMinutes => store.add({ completedAt: new Date().toISOString(), focusMinutes: Math.min(120, Math.max(1, focusMinutes)) })
  return <PomodoroContext.Provider value={{ pomodoroSessions: store.rows, pomodoroSettings: settings.uid === userId ? settings.value : defaults, isLoading: store.isLoading || (Boolean(userId) && (settings.uid !== userId || settings.loading)), error: store.error || (settings.uid === userId ? settings.error : ''), setPomodoroSettings, recordFocusSessionComplete }}>{children}</PomodoroContext.Provider>
}
