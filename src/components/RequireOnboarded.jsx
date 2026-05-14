import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

/** After onboarding questionnaire is complete. */
export function RequireOnboarded() {
  const { profile, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!profile?.onboarded) {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}
