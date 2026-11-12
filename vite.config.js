import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  // .glb / .gltf se sirven desde public/ sin procesar
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  build: {
    rollupOptions: {
      output: {
        /* React (y los ayudantes de Vite/Rollup) van en su propio chunk: si
           no, Rollup los mete dentro de "three" (R3F depende de React) y toda
           pagina descargaria WebGL aunque no muestre el robot. */
        manualChunks(id) {
          if (/[\/]node_modules[\/](three|@react-three|three-stdlib|troika|meshline|maath|camera-controls|zustand|its-fine|suspend-react|@monogrid|stats|detect-gpu|hls\.js|@use-gesture)/.test(id)) return 'three'
          if (/[\/]node_modules[\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\/]/.test(id)) return 'react'
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers')) return 'react'
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
})
