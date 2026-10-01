export function friendlyError(error) {
  const code = error?.code || ''
  if (code.includes('permission-denied')) return 'Your cloud data could not be accessed. Please contact the app owner; nothing has been confirmed saved.'
  if (code.includes('unavailable')) return 'Cloud sync is unavailable. Check your connection and try again.'
  if (code.includes('invalid-credential')) return 'The email or password is incorrect.'
  if (code.includes('email-already-in-use')) return 'An account already uses this email. Please sign in.'
  if (code.includes('too-many-requests')) return 'Too many attempts. Please wait and try again.'
  return error?.message || 'Something went wrong. Please try again.'
}
export async function withTimeout(promise, milliseconds = 15000) {
  let timer
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Cloud sync timed out. Check your connection before retrying; the request may still complete.')), milliseconds) })]) }
  finally { clearTimeout(timer) }
}
