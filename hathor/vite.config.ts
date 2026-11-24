import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Hathor marketplace front end. Static build; no keys are read here.
export default defineConfig({
  base: process.env.HATHOR_BASE || '/',
  build: { sourcemap: false },
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
});
