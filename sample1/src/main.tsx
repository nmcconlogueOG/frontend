import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@trussworks/react-uswds/lib/uswds.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
