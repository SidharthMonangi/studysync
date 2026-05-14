import { useMemo, useState, useEffect } from 'react'
import {
  FileText,
  Sparkles,
  Copy,
  Plus,
  Search,
  Clock,
  ChevronRight,
  Brain,
  BookOpen,
  Loader2,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Repeat,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useNotes } from '@/context/NotesContext'
import { useToast } from '@/hooks/useToast'
import { formatTimeShort } from '@/lib/dates'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { explainConcept } from '@/lib/gemini'

export default function NotesPage() {
  const { notes, isLoading, addNote, updateNote, deleteNote, generateNoteIntel } = useNotes()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showNewNote, setShowNewNote] = useState(false)
  const [newNote, setNewNote] = useState({ title: '', subject: 'General', content: '' })
  const [copied, setCopied] = useState(false)
  const [quizReveal, setQuizReveal] = useState({})
  const [flashcardFlipped, setFlashcardFlipped] = useState({})
  const [explainerTerm, setExplainerTerm] = useState('')
  const [explanation, setExplanation] = useState('')
  const [isExplaining, setIsExplaining] = useState(false)

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId) ?? null, [notes, selectedId])

  useEffect(() => {
    // Reset state when note changes
    setExplanation('')
    setExplainerTerm('')
    setFlashcardFlipped({})
    setQuizReveal({})
  }, [selectedId])

  useEffect(() => {
    if (notes.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !notes.some((n) => n.id === selectedId)) {
      setSelectedId(notes[0].id)
    }
  }, [notes, selectedId])

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const runIntel = async () => {
    if (!selectedNote) return
    setIsGenerating(true)
    try {
      const result = await generateNoteIntel(selectedNote.id)
      if (result?.isFallback) {
        toast.warning('Gemini quota reached. Showing local fallback materials.')
      } else {
        toast.success('Generated AI study materials')
      }
    } catch (err) {
      toast.error('Failed to generate study materials')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExplain = async () => {
    if (!explainerTerm.trim() || !selectedNote) return
    setIsExplaining(true)
    try {
      const text = await explainConcept(explainerTerm, selectedNote.content)
      setExplanation(text)
    } catch (err) {
      if (err.name === 'GeminiQuotaError') {
        setExplanation(`Local fallback generated because Gemini quota was unavailable.\n\n"${explainerTerm}" is a key concept from your notes. Please review the relevant section in your notes for more details.`)
        toast.warning('Gemini quota reached. Showing local fallback materials.')
      } else {
        toast.error('Failed to explain concept')
      }
    } finally {
      setIsExplaining(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const wordCount = (text) => (text || '').split(/\s+/).filter(Boolean).length

  const addNoteLocal = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error('Title and content are required')
      return
    }
    
    setIsSaving(true)
    try {
      const id = await addNote({
        title: newNote.title.trim(),
        subject: newNote.subject.trim() || 'General',
        content: newNote.content.trim(),
      })
      setSelectedId(id)
      setNewNote({ title: '', subject: 'General', content: '' })
      setShowNewNote(false)
      toast.success('Note created')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteNoteLocal = async (noteId) => {
    await deleteNote(noteId)
    toast.success('Note deleted')
  }

  const toggleQuiz = (qid) => {
    setQuizReveal((prev) => ({ ...prev, [qid]: !prev[qid] }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Notes workspace</h1>
          <p className="text-muted-foreground mt-1">
            Powered by Gemini 1.5 Flash. Generate summaries, quizzes, and flashcards instantly.
          </p>
        </div>
        <Button onClick={() => setShowNewNote(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New note
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>

          <div className="glass-card rounded-2xl p-4 max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : filteredNotes.length === 0 ? (
                notes.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No notes yet"
                    description="Capture a lecture or reading, then use Gemini AI to generate summaries and flashcards."
                    actionLabel="Create note"
                    onAction={() => setShowNewNote(true)}
                  />
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">No notes match your search.</p>
                )
              ) : (
                filteredNotes.map((note) => (
                  <button
                    type="button"
                    key={note.id}
                    onClick={() => setSelectedId(note.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-smooth group',
                      selectedNote?.id === note.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-secondary/50',
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-medium text-sm truncate',
                              selectedNote?.id === note.id ? 'text-primary' : 'text-foreground',
                            )}
                          >
                            {note.title}
                          </span>
                          {note.summary && <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{note.subject}</span>
                          <span>•</span>
                          <span>{wordCount(note.content)} words</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimeShort(note.updatedAt)}
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 flex-shrink-0 transition-smooth',
                          selectedNote?.id === note.id ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedNote ? (
            <>
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{selectedNote.title}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {selectedNote.subject}
                      </span>
                      <span>{wordCount(selectedNote.content)} words</span>
                      <span>{formatTimeShort(selectedNote.updatedAt)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNoteLocal(selectedNote.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-smooth flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">AI Summary</span>
                    </div>
                    {selectedNote.summary && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedNote.summary)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-smooth"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {selectedNote.summary ? (
                    <p className="text-foreground leading-relaxed">{selectedNote.summary}</p>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-3">No AI materials yet. Generate them below.</p>
                      <Button
                        type="button"
                        onClick={runIntel}
                        disabled={isGenerating}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Working…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate AI Materials
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {selectedNote.summary && (
                  <div className="space-y-4 mb-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Quiz Section */}
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-foreground">Practice Quiz</span>
                          <Button type="button" variant="outline" size="sm" onClick={runIntel} disabled={isGenerating} className="glass-button">
                            Regenerate
                          </Button>
                        </div>
                        {!selectedNote.quizQuestions || selectedNote.quizQuestions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No quiz available.</p>
                        ) : (
                          <ul className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                            {selectedNote.quizQuestions.map((q, idx) => (
                              <li key={q.id || idx} className="rounded-lg border border-border/80 p-3 bg-background/40">
                                <p className="text-sm text-foreground font-medium mb-2">
                                  {idx + 1}. {q.question}
                                </p>
                                <ul className="space-y-1 mb-2">
                                  {q.options.map((opt, oi) => (
                                    <li key={oi} className="text-xs text-muted-foreground pl-2">
                                      {String.fromCharCode(65 + oi)}. {opt}
                                    </li>
                                  ))}
                                </ul>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary h-auto p-0"
                                  onClick={() => setQuizReveal((prev) => ({ ...prev, [q.id || idx]: !prev[q.id || idx] }))}
                                >
                                  {quizReveal[q.id || idx] ? 'Hide answer' : 'Show answer'}
                                </Button>
                                {quizReveal[q.id || idx] && (
                                  <p className="text-xs text-primary mt-2">
                                    Correct: {String.fromCharCode(65 + (q.correctIndex ?? 0))}.{' '}
                                    {q.options[q.correctIndex]}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Flashcards Section */}
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-foreground">AI Flashcards</span>
                        </div>
                        {!selectedNote.flashcards || selectedNote.flashcards.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No flashcards available.</p>
                        ) : (
                          <ul className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                            {selectedNote.flashcards.map((f, idx) => (
                              <li key={f.id || idx} className="rounded-lg border border-border/80 p-3 bg-background/40">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card {idx + 1}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary h-auto p-0"
                                    onClick={() => setFlashcardFlipped((prev) => ({ ...prev, [f.id || idx]: !prev[f.id || idx] }))}
                                  >
                                    <Repeat className="w-3 h-3 mr-1" />
                                    Flip
                                  </Button>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded-lg min-h-[80px] flex items-center justify-center text-center transition-all duration-300">
                                  {flashcardFlipped[f.id || idx] ? (
                                    <p className="text-sm text-foreground">{f.back}</p>
                                  ) : (
                                    <p className="text-sm font-medium text-foreground">{f.front}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Concept Explainer */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Explain Concept</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a concept from your notes..."
                      value={explainerTerm}
                      onChange={(e) => setExplainerTerm(e.target.value)}
                      className="bg-background/50 border-border flex-1"
                    />
                    <Button type="button" onClick={handleExplain} disabled={isExplaining || !explainerTerm.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      {isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Explain'}
                    </Button>
                  </div>
                  {explanation && (
                    <div className="mt-4 p-4 rounded-lg bg-background/50 border border-border text-sm leading-relaxed">
                      {explanation}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="glass-button"
                    onClick={() => {
                      const next = window.prompt('Edit title', selectedNote.title)
                      if (next == null) return
                      updateNote(selectedNote.id, { title: next.trim() || selectedNote.title })
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="glass-button"
                    onClick={() => copyToClipboard(selectedNote.content)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy body
                  </Button>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Full note</h3>
                <textarea
                  className="w-full min-h-[220px] px-3 py-2 rounded-lg bg-secondary/30 border border-border text-foreground text-sm focus:border-primary outline-none resize-y"
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon={FileText}
              title="Select or create a note"
              description="Notes support inline editing. Generate AI summaries, quizzes, and flashcards instantly."
              actionLabel="New note"
              onAction={() => setShowNewNote(true)}
            />
          )}
        </div>
      </div>

      {showNewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm border-0 cursor-default"
            onClick={() => setShowNewNote(false)}
          />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold text-foreground mb-4">Create note</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <Input
                    placeholder="Note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <Input
                    value={newNote.subject}
                    onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                <textarea
                  placeholder="Paste or type your notes…"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-none h-64"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowNewNote(false)} className="flex-1 glass-button" disabled={isSaving}>
                Cancel
              </Button>
              <Button type="button" onClick={addNoteLocal} disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create note'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
