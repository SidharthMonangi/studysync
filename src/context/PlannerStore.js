import { createContext, useContext } from 'react'
export const PlannerContext = createContext(null)
export function usePlanner() { const ctx = useContext(PlannerContext); if (!ctx) throw new Error('usePlanner requires its provider'); return ctx }
