import { TasksContext } from './TasksStore'
import { useUserCollection } from '@/hooks/useUserCollection'
import { runTransaction, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthStore'
import { withTimeout } from '@/lib/errors'
export function TasksProvider({ children }) {
  const store = useUserCollection('tasks')
  const { userId } = useAuth()
  const addTask = task => store.add({
    title: task.title.trim(), description: (task.description || '').trim(), subject: task.subject || 'General',
    dueDate: task.dueDate || '', dueTime: task.dueTime || '', priority: task.priority || 'medium', status: task.status || 'todo',
    progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  })
  const updateTask = (id, patch) => store.update(id, { ...patch, updatedAt: new Date().toISOString(), ...(patch.status ? { progress: patch.status === 'completed' ? 100 : patch.status === 'todo' ? 0 : 50 } : {}) })
  const toggleTaskComplete = id => withTimeout(runTransaction(db, async transaction => {
    if (!userId) throw new Error('Sign in to update tasks.')
    const ref = doc(db, 'users', userId, 'tasks', id)
    const snap = await transaction.get(ref)
    if (!snap.exists()) throw new Error('This task no longer exists.')
    const done = snap.data().status !== 'completed'
    transaction.update(ref, { status: done ? 'completed' : 'todo', progress: done ? 100 : 0, updatedAt: new Date().toISOString() })
  }))
  return <TasksContext.Provider value={{ tasks: store.rows, isLoading: store.isLoading, error: store.error, addTask, updateTask, deleteTask: store.remove, toggleTaskComplete }}>{children}</TasksContext.Provider>
}
