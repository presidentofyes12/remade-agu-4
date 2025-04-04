import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    host: 'localhost',
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 3003,
      protocol: 'ws',
      clientPort: 3003,
      timeout: 30000
    },
    middlewareMode: false,
    fs: {
      strict: true,
      allow: ['..']
    },
    cors: {
      origin: '*'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['wagmi', '@wagmi/core', 'viem']
  },
  clearScreen: false,
  logLevel: 'info'
}) 