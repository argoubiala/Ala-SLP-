import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite config — https://vitejs.dev/config/
//
// `base` controls the URL path assets are served from. GitHub Pages project
// sites live at https://<user>.github.io/<repo-name>/, so the deploy
// workflow (.github/workflows/deploy.yml) sets BASE_PATH to "/<repo-name>/"
// automatically at build time. Locally (npm run dev) it defaults to "/".
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
