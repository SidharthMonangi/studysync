import { NotesContext } from './NotesStore'
import { useUserCollection } from '@/hooks/useUserCollection'
import { generateNoteIntel as generate } from '@/lib/gemini'
import { runTransaction, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthStore'
import { withTimeout } from '@/lib/errors'
export function NotesProvider({ children }) {
  const store = useUserCollection('notes')
  const { userId } = useAuth()
  const addNote = note => store.add({ title: note.title.trim(), subject: note.subject || 'General', content: note.content.trim(), summary: null, quizQuestions: null, flashcards: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
  const updateNote = (id, patch) => store.update(id, { ...patch, ...(Object.hasOwn(patch, 'content') ? { summary: null, quizQuestions: null, flashcards: null } : {}), updatedAt: new Date().toISOString() })
  const generateNoteIntel = async id => {
    const note = store.rows.find(n => n.id === id)
    if (!note) throw new Error('Select a saved note first.')
    const result = await generate(note.content)
    await withTimeout(runTransaction(db, async transaction => {
      const ref = doc(db, 'users', userId, 'notes', id)
      const snap = await transaction.get(ref)
      if (!snap.exists() || snap.data().content !== note.content) throw new Error('Your notes changed during generation. Please generate again.')
      transaction.update(ref, { ...result, updatedAt: new Date().toISOString() })
    }))
    return { isFallback: false }
  }
  return <NotesContext.Provider value={{ notes: store.rows, isLoading: store.isLoading, error: store.error, addNote, updateNote, deleteNote: store.remove, generateNoteIntel }}>{children}</NotesContext.Provider>
}
