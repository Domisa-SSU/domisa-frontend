import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { resetRestoredLocalhostRoute } from './routes/devLocalhostRouteReset.ts'

const queryClient = new QueryClient()

resetRestoredLocalhostRoute()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App></App>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
