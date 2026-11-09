import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      // Two separate pages: the public site, and the admin CMS (moved to a secret
      // path after the build by scripts/place-admin.mjs). They share no entry chunk.
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: [
        '**/data/**',
        '**/uploads/**',
        '**/*.tmp',
        '**/.git/**',
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
