import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Hathor marketplace front end. Static build; no keys are read here.
// The source page is app.html; `npm run publish` builds it for thoth.elghaly.dev/hathor/ and writes
// the built page (index.html) and its files next to it, where the site serves them.
export default defineConfig({
  base: process.env.HATHOR_BASE || '/',
  build: { sourcemap: false, rollupOptions: { input: 'app.html' } },
  plugins: [react(), tailwindcss()],
  server: { port: 5173, open: '/app.html' },
});
