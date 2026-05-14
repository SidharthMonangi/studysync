import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthContext'
import { generateNoteIntel as runGeminiIntel } from '@/lib/gemini'

const NotesContext = createContext(null)

export function NotesProvider({ children }) {
  const { userId } = useAuth()
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadNotes() {
      if (!userId) {
        if (mounted) {
          setNotes([])
          setIsLoading(false)
        }
        return
      }
      setIsLoading(true)
      try {
        const colRef = collection(db, 'users', userId, 'notes')
        const snap = await getDocs(colRef)
        const data = snap.docs.map(d => d.data())
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        if (mounted) setNotes(data)
      } catch (err) {
        console.error('Failed to load notes', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    loadNotes()
    return () => { mounted = false }
  }, [userId])

  const addNote = useCallback(async (note) => {
    if (!userId) return
    const newDocRef = doc(collection(db, 'users', userId, 'notes'))
    const row = {
      id: newDocRef.id,
      title: note.title.trim(),
      subject: note.subject || 'General',
      content: note.content.trim(),
      summary: null,
      quizQuestions: null,
      flashcards: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes((prev) => [row, ...prev])
    await setDoc(newDocRef, row)
    return row.id
  }, [userId])

  const updateNote = useCallback(async (id, patch) => {
    if (!userId) return
    const updatedAt = new Date().toISOString()
    setNotes((prev) => prev.map((n) =>
      n.id === id ? { ...n, ...patch, updatedAt } : n,
    ))
    const docRef = doc(db, 'users', userId, 'notes', id)
    await updateDoc(docRef, { ...patch, updatedAt })
  }, [userId])

  const deleteNote = useCallback(async (id) => {
    if (!userId) return
    setNotes((prev) => prev.filter((n) => n.id !== id))
    const docRef = doc(db, 'users', userId, 'notes', id)
    await deleteDoc(docRef)
  }, [userId])

  const generateNoteIntel = useCallback(async (id) => {
    if (!userId) return
    const noteToProcess = notes.find((x) => x.id === id)
    if (!noteToProcess) return

    try {
      const intel = await runGeminiIntel(noteToProcess.content)
      const updatedAt = new Date().toISOString()
      
      const patch = {
        summary: intel.summary,
        quizQuestions: intel.quizQuestions,
        flashcards: intel.flashcards,
        updatedAt,
      }

      setNotes((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
      
      const docRef = doc(db, 'users', userId, 'notes', id)
      await updateDoc(docRef, patch)
    } catch (err) {
      console.error('Failed to generate note intel', err)
      throw err
    }
  }, [userId, notes])

  const value = {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    generateNoteIntel,
  }

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used inside NotesProvider')
  return ctx
}
