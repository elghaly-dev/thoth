import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// Fonts are served from this site (no font service, no outside request).
// Indic scripts and Chinese use the phone's own Noto system fonts.
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-800.css';
// Arabic, self-hosted like the Latin font: nothing is fetched from another site.
import '@fontsource/noto-sans-arabic/arabic-400.css';
import '@fontsource/noto-sans-arabic/arabic-500.css';
import '@fontsource/noto-sans-arabic/arabic-600.css';
import '@fontsource/noto-sans-arabic/arabic-700.css';
// Display serif for headings: Playfair Display (Latin) and Amiri (Arabic), self-hosted.
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/amiri/arabic-400.css';
import '@fontsource/amiri/arabic-700.css';
import './index.css';
import { applyTheme, savedTheme } from './theme/prefs';

// Set the saved look before the first paint.
applyTheme(savedTheme());

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
  rootEl.dataset.mounted = '1';
}
