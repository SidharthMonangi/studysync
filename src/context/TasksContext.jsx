import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthContext'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const { userId } = useAuth()
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadTasks() {
      if (!userId) {
        if (mounted) {
          setTasks([])
          setIsLoading(false)
        }
        return
      }
      setIsLoading(true)
      try {
        const colRef = collection(db, 'users', userId, 'tasks')
        const snap = await getDocs(colRef)
        const data = snap.docs.map(d => d.data())
        // Sort by createdAt descending
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        if (mounted) setTasks(data)
      } catch (err) {
        console.error('Failed to load tasks', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadTasks()
    return () => { mounted = false }
  }, [userId])

  const addTask = useCallback(async (task) => {
    if (!userId) return
    const newDocRef = doc(collection(db, 'users', userId, 'tasks'))
    const row = {
      id: newDocRef.id,
      title: task.title.trim(),
      description: (task.description || '').trim(),
      subject: task.subject || 'General',
      dueDate: task.dueDate || '',
      dueTime: task.dueTime || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [row, ...prev])
    await setDoc(newDocRef, row)
    return row.id
  }, [userId])

  const updateTask = useCallback(async (id, patch) => {
    if (!userId) return
    let finalPatch = { ...patch }
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t
      const next = { ...t, ...patch }
      if (patch.status === 'completed') next.progress = 100
      else if (patch.status === 'todo') next.progress = 0
      else if (patch.status === 'in-progress') next.progress = next.progress || 50
      finalPatch.progress = next.progress
      return next
    }))
    
    const docRef = doc(db, 'users', userId, 'tasks', id)
    await updateDoc(docRef, finalPatch)
  }, [userId])

  const deleteTask = useCallback(async (id) => {
    if (!userId) return
    setTasks((prev) => prev.filter((t) => t.id !== id))
    const docRef = doc(db, 'users', userId, 'tasks', id)
    await deleteDoc(docRef)
  }, [userId])

  const toggleTaskComplete = useCallback(async (id) => {
    if (!userId) return
    let finalPatch = {}
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t
      const done = t.status === 'completed'
      const status = done ? 'todo' : 'completed'
      const progress = done ? 0 : 100
      finalPatch = { status, progress }
      return { ...t, status, progress }
    }))
    
    const docRef = doc(db, 'users', userId, 'tasks', id)
    await updateDoc(docRef, finalPatch)
  }, [userId])

  const value = {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  }

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used inside TasksProvider')
  return ctx
}
