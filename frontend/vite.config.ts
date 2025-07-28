import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Bỏ qua tất cả warnings
        return;
      }
    }
  },
  esbuild: {
    // Bỏ qua lỗi TypeScript trong esbuild
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
