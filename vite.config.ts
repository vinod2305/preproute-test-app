import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = 'https://admin-moderator-backend-staging.up.railway.app'

// The staging backend does not send CORS headers, so direct browser calls are
// blocked. We call a relative `/api` and proxy it here in dev (and via
// vercel.json in production), which makes every request same-origin.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
