import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://pbl-fz9g.onrender.com/api', // Target local server during development
        changeOrigin: true,
        secure: false,
      },
    },
  },
});