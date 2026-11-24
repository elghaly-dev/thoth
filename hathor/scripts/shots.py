"""Screenshots of every Hathor screen, desktop and phone, Arabic and English.

Usage: python3 scripts/shots.py [base_url] [out_dir]
Needs Python Playwright with a Chromium build installed.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173'
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'shots')
OUT.mkdir(parents=True, exist_ok=True)

SCREENS = [
    ('home', '/'),
    ('catalog', '/catalog'),
    ('product', '/product/medjool-premium'),
    ('supplier', '/supplier/nakheel-alwaha'),
    ('rfq-new', '/rfq/new?product=medjool-premium'),
    ('rfq-compare', '/rfq/R-2041'),
    ('deal', '/deal/D-1042'),
    ('messages', '/messages/t1'),
    ('registration', '/register'),
    ('pricing', '/pricing'),
    ('dashboard-buyer', '/dashboard'),
    ('dashboard-supplier', '/dashboard/supplier'),
]
VIEWPORTS = {'desktop': (1440, 900), 'mobile': (390, 844)}
LANGS = sys.argv[3].split(',') if len(sys.argv) > 3 else ['ar', 'en']

errors = []
# Banned wording on the rendered page: visible text plus labels, placeholders and titles.
BANNED = [r'safe', r'free', r'\bonly\b', r'%', r'99', r'\bA\.?I\b', r'ذكاء\s*(ال)?اصطناعي', r'فقط', r'مجان', r'آمن', r'ضمان', r'lillah', r'\blive\b', r'profit', r'guarantee', r'audit', r'launched']
import re
TEXT_JS = '''() => {
  const parts = [document.body.innerText, document.title];
  for (const el of document.querySelectorAll('[aria-label],[placeholder],[title],[alt]'))
    for (const a of ['aria-label', 'placeholder', 'title', 'alt']) if (el.getAttribute(a)) parts.push(el.getAttribute(a));
  return parts.join('\\n');
}'''
wording = []
def scan_page(page, where):
    text = page.evaluate(TEXT_JS)
    for pat in BANNED:
        flags = 0 if pat.startswith(r'\bA') else re.I
        m = re.search(pat, text, flags)
        if m:
            wording.append(f'{where}: {pat!r} near {text[max(0, m.start() - 30):m.end() + 30]!r}')
with sync_playwright() as p:
    browser = p.chromium.launch()
    for vp, (w, h) in VIEWPORTS.items():
        for lang in LANGS:
            ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if vp == 'mobile' else 1, reduced_motion='reduce', locale='ar' if lang == 'ar' else 'en-US')
            page = ctx.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
            for name, path in SCREENS:
                sep = '&' if '?' in path else '?'
                page.goto(f'{BASE}{path}{sep}lang={lang}', wait_until='networkidle')
                page.wait_for_timeout(900)
                scan_page(page, f'{name} {vp} {lang}')
                page.screenshot(path=str(OUT / f'{name}-{vp}-{lang}.png'), full_page=True)
            # Extra states: palette and assistant panel.
            page.goto(f'{BASE}/rfq/R-2041?lang={lang}', wait_until='networkidle')
            page.keyboard.press('Control+k')
            page.wait_for_timeout(500)
            page.screenshot(path=str(OUT / f'command-palette-{vp}-{lang}.png'))
            page.keyboard.press('Escape')
            page.wait_for_timeout(300)
            page.get_by_role('button', name='الغالي').last.click()
            page.wait_for_timeout(400)
            page.get_by_role('button', name='قارن هذه العروض' if lang == 'ar' else 'Compare these quotes').click()
            page.wait_for_timeout(1800)
            page.screenshot(path=str(OUT / f'alghali-panel-{vp}-{lang}.png'))
            ctx.close()
    browser.close()

print(f'shots in {OUT}')
if wording:
    print('banned wording on screen:')
    for w in wording:
        print(' -', w)
if errors:
    print('console errors:')
    for e in errors:
        print(' -', e)
if errors or wording:
    sys.exit(1)
print('no console errors, no banned wording on any screen')
