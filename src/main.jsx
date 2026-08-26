import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

if (typeof window !== "undefined") {
  const nav = performance.getEntriesByType?.("navigation")?.[0];
  const reload = nav?.type === "reload";
  history.scrollRestoration = "manual";
  if (reload) {
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
    window.addEventListener("load", () => window.scrollTo(0, 0), { once: true });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
