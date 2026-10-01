import { useEffect } from 'react'
import { applyTheme } from '@/lib/theme'
import { ToastProvider } from '@/hooks/useToast'

export function AppProvider({ children }) {
  useEffect(() => {
    const update = () => applyTheme(localStorage.getItem('studysync-theme') || 'dark')
    const media = window.matchMedia('(prefers-color-scheme: light)')
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return (
    <ToastProvider>{children}</ToastProvider>
  )
}
