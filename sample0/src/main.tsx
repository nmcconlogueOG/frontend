import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PermissionsProvider } from './contexts/PermissionsContext.tsx'

// Demo permissions: admin on program 1, member on program 2, viewer on program 3
const permissions: string[] = [
  '2:1:1', // PROGRAM 1 — ADMIN
  '2:2:2', // PROGRAM 2 — MEMBER
  '2:3:3', // PROGRAM 3 — VIEWER (excluded from nav)
]

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PermissionsProvider permissions={permissions}>
      <App />
    </PermissionsProvider>
  </StrictMode>,
)
