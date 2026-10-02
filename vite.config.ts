import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // three.js lives in the lazily-loaded hero scene chunk (~240 kB gzip). It is
    // fetched after first paint, so its size doesn't block the page.
    chunkSizeWarningLimit: 1000,
  },
})
