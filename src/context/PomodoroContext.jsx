import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { collection, doc, getDocs, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthContext'

const PomodoroContext = createContext(null)

export function PomodoroProvider({ children }) {
  const { userId } = useAuth()
  const [pomodoroSessions, setPomodoroSessions] = useState([])
  const [pomodoroSettings, setPomodoroSettingsState] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadPomodoro() {
      if (!userId) {
        if (mounted) {
          setPomodoroSessions([])
          setIsLoading(false)
        }
        return
      }
      setIsLoading(true)
      try {
        const sessionsRef = collection(db, 'users', userId, 'sessions')
        const settingsRef = doc(db, 'users', userId, 'pomodoroSettings', 'default')
        
        const [sessionsSnap, settingsSnap] = await Promise.all([
          getDocs(sessionsRef),
          getDoc(settingsRef)
        ])
        
        const sessions = sessionsSnap.docs.map(d => d.data())
        sessions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        
        const defaultSettings = {
          focusTime: 25,
          shortBreak: 5,
          longBreak: 15,
        }
        
        const settings = settingsSnap.exists() ? { ...defaultSettings, ...settingsSnap.data() } : defaultSettings

        if (mounted) {
          setPomodoroSessions(sessions)
          setPomodoroSettingsState(settings)
        }
      } catch (err) {
        console.error('Failed to load pomodoro data', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadPomodoro()
    return () => { mounted = false }
  }, [userId])

  const recordFocusSessionComplete = useCallback(async (focusMinutes) => {
    if (!userId) return
    const newDocRef = doc(collection(db, 'users', userId, 'sessions'))
    const row = {
      id: newDocRef.id,
      completedAt: new Date().toISOString(),
      focusMinutes: Math.max(1, focusMinutes),
    }
    setPomodoroSessions((prev) => [row, ...prev])
    await setDoc(newDocRef, row)
  }, [userId])

  const setPomodoroSettings = useCallback(async (next) => {
    if (!userId) return
    setPomodoroSettingsState(next)
    const settingsRef = doc(db, 'users', userId, 'pomodoroSettings', 'default')
    await setDoc(settingsRef, next, { merge: true })
  }, [userId])

  const value = {
    pomodoroSessions,
    pomodoroSettings,
    isLoading,
    recordFocusSessionComplete,
    setPomodoroSettings,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

export function usePomodoro() {
  const ctx = useContext(PomodoroContext)
  if (!ctx) throw new Error('usePomodoro must be used inside PomodoroProvider')
  return ctx
}
