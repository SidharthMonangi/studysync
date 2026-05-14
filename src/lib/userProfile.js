/** localStorage keys — no backend yet */
export const STORAGE_DISPLAY_NAME = 'studysync_displayName'
export const STORAGE_EMAIL = 'studysync_email'

export function getRawDisplayName() {
  try {
    return localStorage.getItem(STORAGE_DISPLAY_NAME)?.trim() ?? ''
  } catch {
    return ''
  }
}

export function getDisplayName() {
  const raw = getRawDisplayName()
  return raw || 'Student'
}

/** Pass empty or whitespace to store the fallback label "Student". */
export function setDisplayName(name) {
  const value = name && String(name).trim() ? String(name).trim() : 'Student'
  try {
    localStorage.setItem(STORAGE_DISPLAY_NAME, value)
  } catch {
    /* ignore */
  }
  dispatchProfileChanged()
}

export function getStoredEmail() {
  try {
    return localStorage.getItem(STORAGE_EMAIL)?.trim() || ''
  } catch {
    return ''
  }
}

export function setStoredEmail(email) {
  try {
    if (!email || !String(email).trim()) {
      localStorage.removeItem(STORAGE_EMAIL)
    } else {
      localStorage.setItem(STORAGE_EMAIL, String(email).trim())
    }
  } catch {
    /* ignore */
  }
  dispatchProfileChanged()
}

export function initialsFromName(name) {
  const n = (name || '').trim()
  if (!n || n === 'Student') return 'S'
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return n.slice(0, 2).toUpperCase()
}

export function dispatchProfileChanged() {
  window.dispatchEvent(new CustomEvent('studysync-profile-changed'))
}
