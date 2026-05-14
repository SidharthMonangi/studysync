import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Brain,
  BarChart3,
  FileText,
  ArrowRight,
  Menu,
  X,
  Zap,
  LayoutDashboard,
  ListTodo,
  Timer,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Brain,
    title: 'Study planner',
    description: 'Lay out blocks for classes, assignments, and breaks—then adjust as your week changes.',
  },
  {
    icon: CheckCircle2,
    title: 'Task list',
    description: 'Track what is due, what is in progress, and what is done without juggling five apps.',
  },
  {
    icon: Clock,
    title: 'Pomodoro timer',
    description: 'Start focus sessions with clear breaks so deep work feels sustainable.',
  },
  {
    icon: FileText,
    title: 'Notes workspace',
    description: 'Store notes, run an offline summary, and practice with auto-generated quiz items—no API keys.',
  },
  {
    icon: BarChart3,
    title: 'Analytics views',
    description: 'Charts and cards read from your own tasks, planner, Pomodoro logs, and notes in localStorage.',
  },
  {
    icon: Zap,
    title: 'Lightweight reminders',
    description: 'Room for notification preferences when you connect a backend.',
  },
]

/** Product areas—no invented user or revenue numbers. */
const productPillars = [
  { title: 'Local-first', body: 'Sign up, profile, tasks, planner, Pomodoro, notes, and analytics persist in your browser.' },
  { title: 'Interview-ready', body: 'Clear React state flow, guarded routes, and charts driven from structured data.' },
  { title: 'Honest scope', body: 'No fake testimonials, ratings, or growth stats—extend with Firebase or Gemini when you want.' },
]

const designHighlights = [
  {
    title: 'One screen for the day',
    body: 'The home dashboard is meant to answer: what is due, what is next, and how do I start a focus block?',
  },
  {
    title: 'Built for coursework rhythms',
    body: 'Tasks, planner, Pomodoro, and notes are grouped the way many students actually work—not generic “productivity.”',
  },
  {
    title: 'Honest about what is demo',
    body: 'Routes, forms, and charts are real React code—not screenshots—with persistence you can inspect in DevTools.',
  },
]

const coreCapabilities = [
  {
    icon: ListTodo,
    title: 'Plan and track tasks',
    description: 'Add items, filter by subject, and mark progress—everything is saved per account in localStorage.',
  },
  {
    icon: Brain,
    title: 'Sketch a weekly plan',
    description: 'Create dated study blocks with duration and status; the dashboard highlights today automatically.',
  },
  {
    icon: Timer,
    title: 'Run Pomodoro sessions',
    description: 'Run focus and break timers; finished focus blocks append to your session history and analytics.',
  },
  {
    icon: FileText,
    title: 'Organize notes',
    description: 'Paste notes, generate heuristic summaries, and reveal three practice questions—still fully offline.',
  },
  {
    icon: BarChart3,
    title: 'Review sample analytics',
    description: 'Recharts views for focus time, task creation, subjects, and a live activity feed from your data.',
  },
  {
    icon: LayoutDashboard,
    title: 'Central dashboard',
    description: 'Jump between modules from one shell so the app feels cohesive in interviews and demos.',
  },
]

function scrollToDemo() {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen animated-gradient">
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">StudySync AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">
                Features
              </a>
              <a href="#highlights" className="text-muted-foreground hover:text-foreground transition-smooth">
                Highlights
              </a>
              <a href="#explore" className="text-muted-foreground hover:text-foreground transition-smooth">
                What you can do
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
              </Link>
            </div>

            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass-card border-t border-border">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-muted-foreground hover:text-foreground">
                Features
              </a>
              <a href="#highlights" className="block text-muted-foreground hover:text-foreground">
                Highlights
              </a>
              <a href="#explore" className="block text-muted-foreground hover:text-foreground">
                What you can do
              </a>
              <div className="pt-4 flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="w-full bg-primary text-primary-foreground">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-button mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Student productivity UI (portfolio)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 text-balance">
            Study Smarter, <span className="gradient-text glow-text">Not Harder</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            A focused dashboard for planning, tasks, Pomodoro sessions, and notes—wired to localStorage so you can demo
            a believable student workflow without a backend.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 glow">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="glass-button px-8"
              onClick={() => {
                scrollToDemo()
                setMobileMenuOpen(false)
              }}
            >
              View Demo
            </Button>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 max-w-4xl mx-auto">
            {productPillars.map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-6 text-left border border-border/80">
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/80 max-w-xl mx-auto mt-6 text-center">
            Nothing here pretends to be live product traction—open the app to generate your own numbers.
          </p>
        </div>
      </section>

      <section id="demo" className="pb-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-2xl p-6 sm:p-8 border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-foreground">Dashboard preview</h2>
                  <p className="text-sm text-muted-foreground">
                    Interactive modules with real CRUD in the browser—sign up to populate your own dashboard.
                  </p>
                </div>
              </div>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                  Create free account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-secondary/40 border border-border p-4 text-left">
                <div className="text-xs text-muted-foreground mb-1">Today</div>
                <div className="text-sm font-medium text-foreground">Upcoming tasks</div>
                <div className="h-2 mt-3 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-3/4 bg-primary rounded-full" />
                </div>
              </div>
              <div className="rounded-xl bg-secondary/40 border border-border p-4 text-left">
                <div className="text-xs text-muted-foreground mb-1">Focus</div>
                <div className="text-sm font-medium text-foreground">Pomodoro block</div>
                <div className="mt-3 font-mono text-2xl text-foreground">25:00</div>
              </div>
              <div className="rounded-xl bg-secondary/40 border border-border p-4 text-left">
                <div className="text-xs text-muted-foreground mb-1">Notes</div>
                <div className="text-sm font-medium text-foreground">Summary panel</div>
                <div className="mt-2 h-10 rounded-md bg-muted/50 border border-border/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What this build includes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A coherent student workflow in the browser—ready for you to connect real persistence and AI later.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-smooth group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="highlights" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Built for real study habits</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No invented user counts—just design choices that keep schoolwork organized.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {designHighlights.map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-smooth">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <Layers className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase tracking-wide">Highlight</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="explore" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What you can do in the demo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore each module with your own saved data after sign-up. This is a learning and portfolio project—not a
              paid SaaS listing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreCapabilities.map((item) => (
              <div
                key={item.title}
                className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-smooth text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/signup">
              <Button size="lg" variant="outline" className="glass-button px-8">
                Sign up to try the app
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Try the workflow end-to-end</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Sign up to create a local account, finish onboarding, then move through tasks, planner, Pomodoro, notes, and
            analytics backed by your own data.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 glow">
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">StudySync AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-smooth">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-smooth">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-smooth">
                Support
              </a>
            </div>
            <div className="text-sm text-muted-foreground">© 2026 StudySync AI (portfolio demo). All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
