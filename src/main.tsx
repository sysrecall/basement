import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/public-sans'
import './styles.css'
import App from './App'

const ROUTE = '/request'
if (window.location.pathname !== ROUTE) {
  window.history.replaceState(null, '', ROUTE + window.location.search)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
