import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppProvider } from '@/context/AppProvider'
import { installPreloadRecovery } from '@/lib/preloadRecovery'

installPreloadRecovery(window)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ErrorBoundary><App /></ErrorBoundary>
    </AppProvider>
  </StrictMode>,
)
