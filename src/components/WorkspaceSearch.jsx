import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTasks } from '@/context/TasksStore'
import { useNotes } from '@/context/NotesStore'
import { usePlanner } from '@/context/PlannerStore'
export function WorkspaceSearch() {
  const [query, setQuery] = useState('')
  const { tasks } = useTasks(); const { notes } = useNotes(); const { plans } = usePlanner()
  const results = [...tasks.map(t => ({id:t.id,title:t.title,type:'Task',path:'/dashboard/tasks'})),...notes.map(n => ({id:n.id,title:n.title,type:'Note',path:'/dashboard/notes'})),...plans.map(p => ({id:p.id,title:p.topic,type:'Plan',path:'/dashboard/planner'}))].filter(r => r.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0,6)
  return <div className="relative w-80"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" /><Input aria-label="Search your workspace" placeholder="Search your workspace…" value={query} onChange={e=>setQuery(e.target.value)} className="pl-10" />{query.trim() && <div className="absolute top-12 left-0 right-0 rounded-xl border border-border bg-popover shadow-xl p-2 z-50">{results.length ? results.map(r=><Link key={`${r.type}-${r.id}`} className="block rounded-lg p-3 hover:bg-secondary" to={r.path} onClick={()=>setQuery('')}><span className="text-xs text-primary">{r.type}</span><p className="text-sm truncate">{r.title}</p></Link>):<p className="p-3 text-sm text-muted-foreground">No matching items.</p>}<button className="p-2 text-xs underline" onClick={()=>setQuery('')}>Close search</button></div>}</div>
}
