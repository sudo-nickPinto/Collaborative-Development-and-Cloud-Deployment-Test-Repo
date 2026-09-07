// Entry point: this is the first JS file that runs (loaded by index.html).
// It finds the empty <div id="root"> in index.html and mounts our React
// components into it 
// 
// everything the page shows comes from <App />.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // StrictMode is a development-only helper that highlights potential
  // bugs
  // no effect on the production build.
  <StrictMode>
    <App />
  </StrictMode>,
)
