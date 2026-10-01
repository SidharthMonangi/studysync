export function installPreloadRecovery(target) {
  target.addEventListener('vite:preloadError', event => {
    try {
      const key = 'studysync-preload-retry'
      const now = Date.now()
      const previous = Number(target.sessionStorage.getItem(key) || 0)
      if (now - previous < 60000) return
      target.sessionStorage.setItem(key, String(now))
      event.preventDefault()
      target.location.reload()
    } catch {
      // The error boundary still offers a manual refresh if storage is unavailable.
    }
  })
}
