import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

const PAGES_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "connect-src 'self' https://generativelanguage.googleapis.com",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
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
