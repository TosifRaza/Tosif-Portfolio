import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedSchemes: ['http', 'https'],
    proxy: {
      '/api': { target: API_URL, changeOrigin: true },
      '/uploads': { target: API_URL, changeOrigin: true },
    },
  },
  // Allow the Z.ai preview host to access the dev server without CORS blocking
  preview: {
    port: 3000,
    host: true,
    allowedHosts: ['.space-z.ai', '.vercel.app'],
  },
});
