import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { profile, completeOnboarding } = useAuth()
  const toast = useToast()
  const [name, setName] = useState(profile?.name || '')
  const [college, setCollege] = useState(profile?.college || '')
  const [semesterYear, setSemesterYear] = useState(profile?.semesterYear || '')
  const [studyGoal, setStudyGoal] = useState(profile?.studyGoal || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (profile?.onboarded) {
    return <Navigate to="/dashboard" replace />
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    
    setIsSubmitting(true)
    await completeOnboarding({
      name: name.trim(),
      college: college.trim(),
      semesterYear: semesterYear.trim(),
      studyGoal: studyGoal.trim(),
    })
    setIsSubmitting(false)
    toast.success('Profile setup complete!')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-semibold text-foreground">StudySync AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">Set up your profile</h1>
          <p className="text-muted-foreground text-sm">
            Saved only in this browser (localStorage). You can edit this later in Settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border"
              required
              placeholder="How should we greet you?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">College / school</label>
            <Input
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="bg-secondary/50 border-border"
              placeholder="e.g. State University"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Semester & year</label>
            <Input
              value={semesterYear}
              onChange={(e) => setSemesterYear(e.target.value)}
              className="bg-secondary/50 border-border"
              placeholder="e.g. Fall 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Preferred study goal</label>
            <textarea
              value={studyGoal}
              onChange={(e) => setStudyGoal(e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-primary outline-none resize-y"
              placeholder="e.g. Keep a 4-day streak, finish readings before lab, etc."
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow mt-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving profile...
              </>
            ) : (
              <>
                Continue to dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
