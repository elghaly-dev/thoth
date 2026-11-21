import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// Fonts are served from this site (no font service, no outside request).
// Indic scripts and Chinese use the phone's own Noto system fonts.
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-800.css';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
  rootEl.dataset.mounted = '1';
}
