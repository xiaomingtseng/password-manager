import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['better-sqlite3', 'sqlite3', 'bcryptjs', 'crypto']
            },
            // 優化建置
            minify: 'esbuild',
            target: 'node16'
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(_options) {
          // 減少不必要的重載
          console.log('Preload script built')
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // 優化建置性能
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['zustand']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  },
})
