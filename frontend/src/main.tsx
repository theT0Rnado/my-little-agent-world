import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './test-messages' // Import test functions

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="dark">
      <App />
    </div>
  </StrictMode>,
)
