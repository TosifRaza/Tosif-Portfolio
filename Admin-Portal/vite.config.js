import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:5001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': { target: API_URL, changeOrigin: true },
      '/uploads': { target: API_URL, changeOrigin: true },
    },
  },
});
