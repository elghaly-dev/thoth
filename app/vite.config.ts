import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const PAGES_CSP = [
  "default-src 'self'",
  // 'wasm-unsafe-eval' lets the page compile WebAssembly (the on-device
  // model); it does not allow eval() or new Function() for JavaScript.
  "script-src 'self' 'wasm-unsafe-eval'",
  // models.elghaly.dev: the on-device model files only (sha256-pinned).
  "connect-src 'self' https://generativelanguage.googleapis.com https://models.elghaly.dev",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "manifest-src 'self'",
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
].join('; ');

/** Build-only: inject a CSP meta tag and strip the /app/ fallback redirect. */
function pagesHardening(): Plugin {
  return {
    name: 'pages-hardening',
    apply: 'build',
    transformIndexHtml(html) {
      const withoutRedirect = html.replace(
        /<script\b[^>]*\bdata-app-redirect\b[^>]*>[\s\S]*?<\/script>\s*/gi,
        '',
      );
      if (withoutRedirect.includes('http-equiv="Content-Security-Policy"')) {
        return withoutRedirect;
      }
      return withoutRedirect.replace(
        /<head([^>]*)>/i,
        `<head$1>\n    <meta http-equiv="Content-Security-Policy" content="${PAGES_CSP}" />`,
      );
    },
  };
}

export default defineConfig(() => {
  return {
    base: process.env.THOTH_BASE || '/',
    // No source maps in production builds (the code is not published).
    build: { sourcemap: false },
    plugins: [react(), tailwindcss(), pagesHardening()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
