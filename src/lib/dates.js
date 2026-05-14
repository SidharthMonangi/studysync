/** Local date helpers (user's browser timezone). */

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatISODate(iso) {
  if (!iso || typeof iso !== 'string') return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  try {
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function formatDueLine(dueDate, dueTime) {
  const datePart = dueDate ? formatISODate(dueDate) : ''
  const timePart = dueTime || ''
  if (datePart && timePart) return `${datePart} · ${timePart}`
  if (datePart) return datePart
  if (timePart) return timePart
  return 'No deadline'
}

export function formatTimeShort(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}
