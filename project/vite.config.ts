import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal Vite configuration to avoid React refresh issues
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
});
