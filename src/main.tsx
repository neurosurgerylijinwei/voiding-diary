import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { DiaryProvider } from './context/DiaryContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <DiaryProvider>
        <App />
      </DiaryProvider>
    </HashRouter>
  </StrictMode>,
)
