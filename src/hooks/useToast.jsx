import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

let toastIdCount = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastIdCount
    setToasts((prev) => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = {
    toast: {
      success: (msg, dur) => addToast(msg, 'success', dur),
      error: (msg, dur) => addToast(msg, 'error', dur),
    },
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (toast.duration === Infinity) return
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => onRemove(toast.id), 300) // wait for animation
    }, toast.duration)
    return () => clearTimeout(timer)
  }, [toast, onRemove])

  const Icon = toast.type === 'success' ? CheckCircle2 : XCircle
  const colorClass = toast.type === 'success' ? 'text-primary' : 'text-destructive'
  const borderClass = toast.type === 'success' ? 'border-primary/30' : 'border-destructive/30'

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl glass-card pointer-events-auto shadow-lg min-w-[280px] max-w-sm transition-all duration-300 ease-in-out',
        borderClass,
        isLeaving ? 'opacity-0 translate-x-8' : 'animate-in slide-in-from-right-8'
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', colorClass)} />
      <p className="text-sm font-medium text-foreground flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => {
          setIsLeaving(true)
          setTimeout(() => onRemove(toast.id), 300)
        }}
        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-smooth"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
