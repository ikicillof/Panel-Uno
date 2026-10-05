import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build normal (Vercel): three.js queda en un chunk aparte por el import() de Stage.
// Build "artifact": todo en un solo .html (npm run build:artifact).
const single = !!process.env.ARTIFACT
export default defineConfig({
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: { target: 'es2020', chunkSizeWarningLimit: 3000, assetsInlineLimit: single ? 100000000 : 4096 }
})
