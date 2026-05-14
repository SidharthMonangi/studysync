import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  Brain,
  Clock,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Search,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', to: '/dashboard/tasks' },
  { icon: Brain, label: 'Planner', to: '/dashboard/planner' },
  { icon: Clock, label: 'Pomodoro', to: '/dashboard/pomodoro' },
  { icon: FileText, label: 'Notes', to: '/dashboard/notes' },
  { icon: BarChart3, label: 'Analytics', to: '/dashboard/analytics' },
]

const bottomNavItems = [{ icon: Settings, label: 'Settings', to: '/dashboard/settings' }]

function navLinkClass(isActive) {
  return cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-smooth',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  )
}

export function DashboardShell({ children }) {
  const navigate = useNavigate()
  const { displayName, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col glass-card border-r border-border transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20',
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            {sidebarOpen && <span className="text-lg font-semibold text-foreground">StudySync</span>}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ChevronLeft
              className={cn('w-5 h-5 transition-transform', !sidebarOpen && 'rotate-180')}
            />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="py-4 px-3 border-t border-border">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => navLinkClass(isActive)}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-smooth text-left"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">StudySync</span>
          </Link>
          <button type="button" className="p-2 text-muted-foreground hover:text-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm border-0 cursor-default"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 glass-card border-r border-border z-10">
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">StudySync</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="py-4 px-3">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => navLinkClass(isActive)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="my-4 border-t border-border" />
              <ul className="space-y-1">
                {bottomNavItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => navLinkClass(isActive)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-smooth text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      )}

      <main
        className={cn(
          'min-h-screen pt-14 lg:pt-0 transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20',
        )}
      >
        <header className="hidden lg:flex items-center justify-between h-16 px-6 glass border-b border-border">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, notes, plans..."
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground relative transition-smooth"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-secondary transition-smooth"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-sm font-medium text-foreground">{displayName}</div>
                <div className="text-xs text-muted-foreground">Demo data · local only</div>
              </div>
            </Link>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1400px] mx-auto w-full">{children}</div>
      </main>
    </div>
  )
}
