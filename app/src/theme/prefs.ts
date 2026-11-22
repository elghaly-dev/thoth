/**
 * Look and name, kept on this device only (localStorage; never sent anywhere).
 * Every read and write is wrapped: a browser that blocks storage still gets the
 * default look and simply sees the first-launch screens again next time.
 */
import { DEFAULT_PALETTE, paletteById, paletteVars, type PaletteId } from './palettes';

const THEME_KEY = 'thoth.theme';
const NAME_KEY = 'thoth.name';
const DONE_KEY = 'thoth.welcomed';
export const MAX_NAME = 40;

const read = (k: string): string | null => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const write = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch { /* storage blocked: keep it for this visit only */ }
};

export const savedTheme = (): PaletteId => paletteById(read(THEME_KEY) ?? DEFAULT_PALETTE).id;
export const saveTheme = (id: PaletteId) => write(THEME_KEY, id);

/** A name as typed, without control characters, at most MAX_NAME characters. */
export const cleanName = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
export const savedName = (): string => cleanName(read(NAME_KEY) ?? '');
export const saveName = (name: string) => write(NAME_KEY, cleanName(name));

export const hasWelcomed = () => read(DONE_KEY) === '1';
export const markWelcomed = () => write(DONE_KEY, '1');

/** Set the palette's colour variables on the page (CSSOM, so no inline-style CSP issue). */
export function applyTheme(id: PaletteId) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(paletteVars(paletteById(id)))) root.style.setProperty(k, v);
  root.dataset.theme = id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', paletteById(id).paper);
}
