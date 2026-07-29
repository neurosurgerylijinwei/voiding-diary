import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/voiding-diary/
export default defineConfig({
  plugins: [react()],
  base: '/voiding-diary/',
})
