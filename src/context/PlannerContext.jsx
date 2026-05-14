import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthContext'

const PlannerContext = createContext(null)

export function PlannerProvider({ children }) {
  const { userId } = useAuth()
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadPlans() {
      if (!userId) {
        if (mounted) {
          setPlans([])
          setIsLoading(false)
        }
        return
      }
      setIsLoading(true)
      try {
        const colRef = collection(db, 'users', userId, 'planner')
        const snap = await getDocs(colRef)
        const data = snap.docs.map(d => d.data())
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        if (mounted) setPlans(data)
      } catch (err) {
        console.error('Failed to load plans', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadPlans()
    return () => { mounted = false }
  }, [userId])

  const addPlan = useCallback(async (plan) => {
    if (!userId) return
    const newDocRef = doc(collection(db, 'users', userId, 'planner'))
    const row = {
      id: newDocRef.id,
      subject: plan.subject?.trim() || 'General',
      topic: plan.topic?.trim() || '',
      date: plan.date,
      startTime: plan.startTime || '09:00',
      durationMinutes: Math.max(5, Number(plan.durationMinutes) || 25),
      status: plan.status || 'planned',
      createdAt: new Date().toISOString(),
    }
    setPlans((prev) => [row, ...prev])
    await setDoc(newDocRef, row)
  }, [userId])

  const updatePlan = useCallback(async (id, patch) => {
    if (!userId) return
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    const docRef = doc(db, 'users', userId, 'planner', id)
    await updateDoc(docRef, patch)
  }, [userId])

  const deletePlan = useCallback(async (id) => {
    if (!userId) return
    setPlans((prev) => prev.filter((p) => p.id !== id))
    const docRef = doc(db, 'users', userId, 'planner', id)
    await deleteDoc(docRef)
  }, [userId])

  const value = {
    plans,
    isLoading,
    addPlan,
    updatePlan,
    deletePlan,
  }

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}

export function usePlanner() {
  const ctx = useContext(PlannerContext)
  if (!ctx) throw new Error('usePlanner must be used inside PlannerProvider')
  return ctx
}
