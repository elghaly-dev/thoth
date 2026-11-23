import React from 'react';
import { Check } from 'lucide-react';
import type { LanguageCode } from '../types';
import { paletteVars, type Palette } from '../theme/palettes';
import { ts } from '../theme/strings';

interface ThemeTileProps {
  palette: Palette;
  lang: LanguageCode;
  selected: boolean;
  compact?: boolean;
  onPick: () => void;
}

/**
 * A preview of one palette. The preview box carries that palette's own colour
 * variables, so it shows the real look; the label below uses the current look.
 */
export const ThemeTile: React.FC<ThemeTileProps> = ({ palette, lang, selected, compact, onPick }) => (
  <button
    type="button"
    onClick={onPick}
    aria-pressed={selected}
    className={`group text-start rounded-3xl p-2 transition-all cursor-pointer border ${
      selected ? 'border-violet-500 bg-violet-950' : 'border-slate-700 hover:border-violet-500'
    }`}
  >
    <div
      style={paletteVars(palette) as React.CSSProperties}
      className={`thoth-tile rounded-2xl border border-slate-700 bg-slate-950 ${compact ? 'p-3' : 'p-4'} flex flex-col gap-2`}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <span className={`thoth-display text-white ${compact ? 'text-lg' : 'text-2xl'}`}>Thoth</span>
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </div>
      <span className="block h-px w-full bg-slate-700" />
      <span className="block h-2 w-3/4 rounded-full bg-slate-800" />
      <span className="block h-2 w-1/2 rounded-full bg-slate-800" />
      <span className={`self-start rounded-full bg-violet-700 text-white ${compact ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'} font-semibold`}>
        Aa
      </span>
    </div>
    <span className="flex items-center justify-between gap-2 px-1.5 pt-2 pb-1">
      <span className={`font-semibold text-slate-100 ${compact ? 'text-sm' : 'text-base'}`}>{ts(lang, palette.id)}</span>
      {selected && (
        <span className="inline-flex items-center gap-1 text-xs text-violet-300">
          <Check className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">{ts(lang, 'selected')}</span>
        </span>
      )}
    </span>
  </button>
);
