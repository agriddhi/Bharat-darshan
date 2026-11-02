import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built site works when served from any sub-path
// (GitHub Pages serves at /repo-name/, Vercel at /).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: false },
  build: { outDir: 'dist', sourcemap: false },
})
