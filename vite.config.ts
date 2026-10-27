import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    watch: {
      ignored: ['**/public/**', '**/screenshots/**', '**/.git/**', '**/build/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
