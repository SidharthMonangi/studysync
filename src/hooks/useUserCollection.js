import { useCallback, useEffect, useState } from 'react'
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthStore'
import { friendlyError, withTimeout } from '@/lib/errors'
export function useUserCollection(name, timestamp = 'createdAt') {
  const { userId } = useAuth()
  const [state, setState] = useState({ userId: null, rows: [], loading: true, error: '' })
  useEffect(() => {
    if (!userId) return
    let live = true
    const timer = setTimeout(() => { if (live) setState({ userId, rows: [], loading: false, error: 'Cloud sync is taking too long. Check your connection.' }) }, 12000)
    const unsubscribe = onSnapshot(collection(db, 'users', userId, name), snap => {
      clearTimeout(timer)
      const rows = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      rows.sort((a, b) => new Date(b[timestamp]) - new Date(a[timestamp]))
      if (live) setState({ userId, rows, loading: false, error: '' })
    }, error => { clearTimeout(timer); if (live) setState({ userId, rows: [], loading: false, error: friendlyError(error) }) })
    return () => { live = false; clearTimeout(timer); unsubscribe() }
  }, [userId, name, timestamp])
  const reference = useCallback(id => {
    if (!userId) throw new Error('Sign in before saving data.')
    return id ? doc(db, 'users', userId, name, id) : doc(collection(db, 'users', userId, name))
  }, [userId, name])
  const add = useCallback(async data => { const ref = reference(); await withTimeout(setDoc(ref, { ...data, id: ref.id })); return ref.id }, [reference])
  const update = useCallback((id, patch) => withTimeout(updateDoc(reference(id), patch)), [reference])
  const remove = useCallback(id => withTimeout(deleteDoc(reference(id))), [reference])
  return { rows: state.userId === userId ? state.rows : [], isLoading: Boolean(userId) && (state.userId !== userId || state.loading), error: state.userId === userId ? state.error : '', add, update, remove }
}
