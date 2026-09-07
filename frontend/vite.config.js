import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vite build/dev-server config for this project.
// https://vite.dev/config/
export default defineConfig({
  // Enables JSX support and React Fast Refresh (instant UI updates
  // during `npm run dev` without losing component state).
  plugins: [react()],
})
