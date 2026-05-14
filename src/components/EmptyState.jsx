import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto border border-border/50 hover:border-primary/20 transition-smooth group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none" />
      {Icon && (
        <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
          <Icon className="w-8 h-8 text-primary" />
        </div>
      )}
      <h3 className="relative text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="relative text-muted-foreground text-sm mb-6 leading-relaxed max-w-md mx-auto">{description}</p>
      <div className="relative">
        {actionTo && (
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            <Link to={actionTo}>{actionLabel}</Link>
          </Button>
        )}
        {onAction && (
          <Button type="button" onClick={onAction} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
