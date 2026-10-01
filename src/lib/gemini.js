import { auth } from '@/firebase'
import { validateInput, validateOutput } from '../../shared/ai.js'
async function request(input) {
  const payload = validateInput(input)
  if (!auth.currentUser) throw new Error('Sign in to use the study assistant.')
  const token = await auth.currentUser.getIdToken()
  let response
  try {
    response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload), signal: AbortSignal.timeout(45000) })
  } catch (cause) { throw new Error(cause.name === 'TimeoutError' ? 'The assistant timed out. Please try again.' : 'Check your connection and try again.', { cause }) }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'The study assistant is unavailable. Try again later.')
  return validateOutput(input.action, data.result)
}
export const generateNoteIntel = content => request({ action: 'notes', content })
export const explainConcept = (concept, context = '') => request({ action: 'explain', concept, context })
export const generateStudyPlan = tasks => request({ action: 'plan', tasks: tasks.map(t => ({ title: t.title, subject: t.subject || 'General', priority: t.priority || 'medium', dueDate: t.dueDate || '' })) })
