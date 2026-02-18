import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // AI-Service (генерация разговоров, темы)
      '/api/v1/conversation': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      // World-Service (история разговоров, новости)
      '/api/v1/conversations': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/news': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    }
  }
})