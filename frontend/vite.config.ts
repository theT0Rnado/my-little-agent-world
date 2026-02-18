import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/agent': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/news': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
})
