import { createContext, useContext } from 'react'
export const PomodoroContext = createContext(null)
export function usePomodoro() { const ctx = useContext(PomodoroContext); if (!ctx) throw new Error('usePomodoro requires its provider'); return ctx }
