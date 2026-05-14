import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './AuthContext'
import { generateNoteIntel as runGeminiIntel, GeminiQuotaError } from '@/lib/gemini'

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
      
      return { isFallback: false }
    } catch (err) {
      if (err.name === 'GeminiQuotaError') {
        const sentences = noteToProcess.content.split('.').filter(Boolean).map(s => s.trim() + '.')
        const summary = 'Local fallback generated because Gemini quota was unavailable.\n\n' + sentences.slice(0, 3).join(' ')
        
        // Extract words with length > 5, remove punctuation to keep clean keywords
        const allWords = noteToProcess.content.split(/\s+/).map(w => w.replace(/[^a-zA-Z0-9]/g, '')).filter(w => w.length > 5);
        const uniqueWords = Array.from(new Set(allWords));
        const words = uniqueWords.slice(0, 20); // Get up to 20 keywords for variety
        
        const quizQuestions = Array.from({ length: 5 }).map((_, i) => {
          const answer = words[i % words.length] || 'Concept';
          const otherWords = words.filter(w => w !== answer).sort(() => Math.random() - 0.5);
          
          const options = [answer];
          // Fill up to 4 options
          for (let j = 0; options.length < 4; j++) {
            if (otherWords[j] && !options.includes(otherWords[j])) {
              options.push(otherWords[j]);
            } else {
              options.push(`Alternative ${options.length}`);
            }
          }
          options.sort(() => Math.random() - 0.5); // Shuffle options
          
          return {
            id: `fallback-q-${i}`,
            question: `Which of the following terms is strongly associated with the concept of "${words[(i+1)%words.length] || 'this topic'}" in your notes?`,
            options: options,
            correctAnswer: answer
          };
        });
        
        // Improved Flashcard generation logic
        const defPatterns = [
          { regex: /^(.*?)\s+(is defined as|refers to|means)\s+(.*)$/i, termIdx: 1, defIdx: 3 },
          { regex: /^(.*?)\s+(is|are)\s+(a|an|the)\s+(.*)$/i, termIdx: 1, defIdx: 4 },
        ];
        
        let extractedDefinitions = [];
        for (const s of sentences) {
          const cleanSentence = s.trim();
          if (cleanSentence.length < 15 || cleanSentence.length > 150) continue;
          
          for (const pattern of defPatterns) {
            const match = cleanSentence.match(pattern.regex);
            if (match && match[pattern.termIdx].split(' ').length <= 4) {
              extractedDefinitions.push({
                front: `Define: ${match[pattern.termIdx].trim()}`,
                back: match[pattern.defIdx].trim().replace(/\.$/, '')
              });
              break;
            }
          }
        }
        
        // If not enough definitions, extract key sentences with keywords
        let remainingCards = 5 - extractedDefinitions.length;
        if (remainingCards > 0) {
          const fallbackSentences = sentences
            .filter(s => s.length > 20 && s.length < 150 && !extractedDefinitions.some(d => s.includes(d.back)))
            .sort(() => Math.random() - 0.5);
            
          for (let i = 0; i < remainingCards && i < fallbackSentences.length; i++) {
            const s = fallbackSentences[i];
            const sentenceWords = s.split(/\s+/);
            const keyWord = sentenceWords.find(w => w.length > 5) || sentenceWords[Math.floor(sentenceWords.length / 2)];
            
            extractedDefinitions.push({
              front: `Fill in the blank: ${s.replace(keyWord, '______')}`,
              back: keyWord.replace(/[^a-zA-Z0-9]/g, '')
            });
          }
        }
        
        // Ensure exactly 5 flashcards
        while(extractedDefinitions.length < 5) {
           const fallbackWord = words[extractedDefinitions.length % words.length] || `Concept ${extractedDefinitions.length + 1}`;
           extractedDefinitions.push({
             front: `What is ${fallbackWord}?`,
             back: `Refer to your notes to review the concept of ${fallbackWord}.`
           });
        }
        
        const flashcards = extractedDefinitions.slice(0, 5).map((d, i) => ({
          id: `fallback-f-${i}`,
          front: d.front,
          back: d.back
        }));
        
        const patch = { summary, quizQuestions, flashcards, updatedAt: new Date().toISOString() }
        setNotes((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
        const docRef = doc(db, 'users', userId, 'notes', id)
        await updateDoc(docRef, patch)
        
        return { isFallback: true }
      }
      
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
