import { PlannerContext } from './PlannerStore'
import { useUserCollection } from '@/hooks/useUserCollection'
import { writeBatch, doc, collection } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthStore'
import { withTimeout } from '@/lib/errors'
export function PlannerProvider({ children }) {
  const store = useUserCollection('planner')
  const { userId } = useAuth()
  const build = plan => ({ subject: plan.subject?.trim() || 'General', topic: plan.topic?.trim() || '', date: plan.date, startTime: plan.startTime || '09:00', durationMinutes: Math.min(120, Math.max(5, Math.round(Number(plan.durationMinutes)) || 25)), status: plan.status || 'planned', createdAt: new Date().toISOString() })
  const addPlans = async plans => {
    if (!userId) throw new Error('Sign in to save plans.')
    const batch = writeBatch(db)
    for (const plan of plans) { const ref = doc(collection(db, 'users', userId, 'planner')); batch.set(ref, { ...build(plan), id: ref.id }) }
    await withTimeout(batch.commit())
  }
  return <PlannerContext.Provider value={{ plans: store.rows, isLoading: store.isLoading, error: store.error, addPlan: plan => store.add(build(plan)), addPlans, updatePlan: store.update, deletePlan: store.remove }}>{children}</PlannerContext.Provider>
}
