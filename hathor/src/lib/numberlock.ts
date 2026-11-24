import { toWesternDigits } from './mask';

// Every number in a text, normalised to Western digits with separators removed.
export function extractNumbers(s: string): string[] {
  const t = toWesternDigits(s);
  return (t.match(/\d+(?:[.,]\d+)*/g) || []).map((n) => n.replace(/,/g, '')).sort();
}

// A translation is shown alone when it keeps every number of the original.
export function numbersMatch(original: string, translated: string): boolean {
  const a = extractNumbers(original);
  const b = extractNumbers(translated);
  return a.length === b.length && a.every((n, i) => n === b[i]);
}
