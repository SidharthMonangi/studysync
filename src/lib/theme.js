export function applyTheme(preference) {
  const isLight = preference === 'light' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)
  document.documentElement.dataset.theme = isLight ? 'light' : 'dark'
  document.documentElement.classList.toggle('dark', !isLight)
}
export function saveTheme(preference) { localStorage.setItem('studysync-theme', preference); applyTheme(preference) }
