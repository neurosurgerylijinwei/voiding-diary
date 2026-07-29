import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DiaryProvider } from './context/DiaryContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DiaryProvider>
        <App />
      </DiaryProvider>
    </BrowserRouter>
  </StrictMode>,
)
