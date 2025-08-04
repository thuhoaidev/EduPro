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
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          mui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', 'dayjs', 'moment']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  esbuild: {
    // Bỏ qua lỗi TypeScript trong esbuild
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
