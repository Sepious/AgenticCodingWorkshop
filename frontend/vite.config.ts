import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/teams': 'http://localhost:8000',
      '/matches': 'http://localhost:8000',
      '/fixtures': 'http://localhost:8000',
      '/league-table': 'http://localhost:8000',
      '/history': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
