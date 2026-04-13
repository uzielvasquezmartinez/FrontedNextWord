import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://unpoetically-interramal-loren.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'https://unpoetically-interramal-loren.ngrok-free.dev', // HTTPs inicial necesario para SockJS
        ws: true,
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': '69420' 
        }
      }
    }
  },
  define: {
    global: {}
  }
})
