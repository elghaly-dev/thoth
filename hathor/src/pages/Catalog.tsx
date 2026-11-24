import { AnimatePresence, motion } from 'motion/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { useRouter } from '../lib/router';
import { CATEGORIES, FOCUS_CATEGORIES, PRODUCTS, SUPPLIERS, byId, type CategoryId } from '../data/sample';
import { directFirst, PRICE_REFERENCE } from '../lib/listing';
import { ProductCard } from '../components/Cards';
import { Button, ButtonLink, PageHeader, Rise, SampleBadge, Stagger } from '../components/ui';
import { GlowLine } from '../components/GlowLine';
import { fmtNumber } from '../lib/format';

type Sort = 'best' | 'price' | 'lead' | 'reply';

function Filters({ cats, setCats, countries, setCountries, level, setLevel, samples, setSamples }: {
  cats: Set<CategoryId>; setCats: (s: Set<CategoryId>) => void;
  countries: Set<string>; setCountries: (s: Set<string>) => void;
  level: number; setLevel: (n: number) => void;
  samples: boolean; setSamples: (b: boolean) => void;
}) {
  const { t, lang } = useI18n();
  const countryList = [...new Map(SUPPLIERS.map((s) => [s.countryCode, s.country[lang]])).entries()];
  const toggle = <T,>(set: Set<T>, v: T, fn: (s: Set<T>) => void) => { const n = new Set(set); if (n.has(v)) n.delete(v); else n.add(v); fn(n); };
  const box = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm text-ink-1 hover:bg-lilac-400/5';
  const check = 'h-[18px] w-[18px] accent-[#c4a1ec]';
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-xs font-semibold text-lilac-400">{t('catalog.category')}</legend>
        {CATEGORIES.map((c) => (
          <label key={c.id} className={box}><input type="checkbox" className={check} checked={cats.has(c.id)} onChange={() => toggle(cats, c.id, setCats)} />{c.name[lang]}{FOCUS_CATEGORIES.includes(c.id) && <span className="chip ms-auto !text-[0.65rem] text-lilac-200">{t('catalog.focus')}</span>}</label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xs font-semibold text-lilac-400">{t('catalog.country')}</legend>
        {countryList.map(([code, name]) => (
          <label key={code} className={box}><input type="checkbox" className={check} checked={countries.has(code)} onChange={() => toggle(countries, code, setCountries)} />{name}</label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xs font-semibold text-lilac-400">{t('catalog.verification')}</legend>
        {([[0, 'sort.best'], [1, 'verify.documents'], [2, 'verify.partner'], [3, 'verify.site']] as const).map(([n, k]) => (
          <label key={n} className={box}><input type="radio" name="lvl" className={check} checked={level === n} onChange={() => setLevel(n)} />{n === 0 ? (lang === 'ar' ? 'الكل' : 'All') : t(k)}</label>
        ))}
      </fieldset>
      <label className={box}><input type="checkbox" className={check} checked={samples} onChange={() => setSamples(!samples)} />{t('catalog.samples')}</label>
    </div>
  );
}

export function Catalog() {
  const { t, lang } = useI18n();
  const { search } = useRouter();
  const [q, setQ] = useState(search.get('q') ?? '');
  const initCat = search.get('cat') as CategoryId | null;
  const [cats, setCats] = useState<Set<CategoryId>>(new Set(initCat ? [initCat] : []));
  const [countries, setCountries] = useState<Set<string>>(new Set());
  const [level, setLevel] = useState(0);
  const [samples, setSamples] = useState(false);
  const [sort, setSort] = useState<Sort>('best');
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const id = setTimeout(() => setLoading(false), 450); return () => clearTimeout(id); }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = PRODUCTS.filter((p) => {
      const s = byId(SUPPLIERS, p.supplierId)!;
      if (needle && !`${p.title.ar} ${p.title.en} ${p.hs} ${s.name.ar} ${s.name.en}`.toLowerCase().includes(needle)) return false;
      if (cats.size && !cats.has(p.category)) return false;
      if (countries.size && !countries.has(s.countryCode)) return false;
      if (level && s.level < level) return false;
      if (samples && !p.sampleAvailable) return false;
      return true;
    });
    if (sort === 'lead') r = [...r].sort((a, b) => a.leadDays - b.leadDays);
    if (sort === 'reply') r = [...r].sort((a, b) => byId(SUPPLIERS, a.supplierId)!.replyHours - byId(SUPPLIERS, b.supplierId)!.replyHours);
    if (sort === 'price') r = [...r].sort((a, b) => a.currency.localeCompare(b.currency) || Math.min(...a.tiers.map((x) => x.price)) - Math.min(...b.tiers.map((x) => x.price)));
    // Verified direct suppliers come first; the chosen sort orders within each level.
    r = directFirst(r, (p) => byId(SUPPLIERS, p.supplierId)!.level);
    return r;
  }, [q, cats, countries, level, samples, sort]);

  const clear = () => { setCats(new Set()); setCountries(new Set()); setLevel(0); setSamples(false); setQ(''); };
  const chips = [
    ...[...cats].map((c) => ({ label: CATEGORIES.find((x) => x.id === c)!.name[lang], off: () => { const n = new Set(cats); n.delete(c); setCats(n); } })),
    ...[...countries].map((c) => ({ label: SUPPLIERS.find((s) => s.countryCode === c)!.country[lang], off: () => { const n = new Set(countries); n.delete(c); setCountries(n); } })),
    ...(samples ? [{ label: t('catalog.samples'), off: () => setSamples(false) }] : []),
  ];
  const filterProps = { cats, setCats, countries, setCountries, level, setLevel, samples, setSamples };

  return (
    <div>
      <PageHeader title={t('catalog.title')}><SampleBadge /></PageHeader>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="glass flex flex-1 items-center gap-2 !rounded-[14px] px-3">
          <Search className="h-5 w-5 text-lilac-400" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search.placeholder')} aria-label={t('search.placeholder')} className="h-12 flex-1 bg-transparent text-ink-1 outline-none placeholder:text-ink-3" />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="lg:hidden" onClick={() => setSheet(true)}><SlidersHorizontal className="h-4 w-4" />{t('catalog.filters')}</Button>
          <label className="sr-only" htmlFor="sort">{t('catalog.sort')}</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !w-auto">
            <option value="best">{t('sort.best')}</option>
            <option value="price">{t('sort.price')}</option>
            <option value="lead">{t('sort.lead')}</option>
            <option value="reply">{t('sort.reply')}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="glass sticky top-24 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl">{t('catalog.filters')}</h2>
              <button type="button" onClick={clear} className="text-xs text-lilac-400 hover:text-lilac-200">{t('catalog.clear')}</button>
            </div>
            <Filters {...filterProps} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-2" aria-live="polite"><bdi className="num">{t('catalog.count', { n: fmtNumber(list.length, lang) })}</bdi></span>
            {chips.map((c, i) => (
              <button key={i} type="button" onClick={c.off} className="chip hover:border-lilac-400">{c.label}<X className="h-3 w-3" aria-hidden="true" /></button>
            ))}
          </div>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="glass overflow-hidden"><div className="skeleton aspect-[4/3] !rounded-none" /><div className="space-y-3 p-4"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" /><div className="skeleton h-6 w-2/5" /></div></div>
              ))}
            </div>
          ) : list.length ? (
            <>
              <h2 className="mb-3 text-sm font-semibold text-lilac-400">{t('catalog.direct')}</h2>
              <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => <Rise key={p.id}><ProductCard p={p} /></Rise>)}
              </Stagger>
              <section aria-labelledby="price-ref" className="mt-10 rounded-[18px] border border-dashed border-lilac-400/30 p-5">
                <h2 id="price-ref" className="text-xl">{t('catalog.reference')}</h2>
                <p className="mt-1 text-sm text-ink-3">{t('catalog.reference.d')}</p>
                {PRICE_REFERENCE.length === 0 && <p className="mt-3 text-xs text-warning">{t('catalog.reference.none')}</p>}
              </section>
            </>
          ) : (
            <div className="glass mx-auto max-w-lg p-8 text-center">
              <div className="mx-auto w-24"><GlowLine nodes={[{ label: '', state: 'now' }]} compact /></div>
              <h2 className="mt-2 text-2xl">{t('empty.catalog')}</h2>
              <p className="mt-2 text-sm text-ink-2">{t('empty.catalog.d')}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="secondary" onClick={clear}>{t('catalog.clear')}</Button>
                <ButtonLink to="/rfq/new">{t('cta.requestQuote')}</ButtonLink>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-night-950/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div role="dialog" aria-modal="true" aria-label={t('catalog.filters')} className="glass fixed inset-x-0 bottom-0 z-40 flex max-h-[85dvh] flex-col !rounded-b-none !rounded-t-[24px]"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 420, damping: 36 }}>
              <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-lilac-400/40" />
              <div className="flex items-center justify-between px-5 py-3"><h2 className="text-xl">{t('catalog.filters')}</h2><button type="button" onClick={() => setSheet(false)} className="grid h-11 w-11 place-items-center" aria-label={t('assistant.close')}><X className="h-5 w-5" /></button></div>
              <div className="flex-1 overflow-y-auto px-5"><Filters {...filterProps} /></div>
              <div className="flex gap-3 border-t border-lilac-400/15 p-4"><Button variant="secondary" className="flex-1" onClick={clear}>{t('catalog.clear')}</Button><Button className="flex-1" onClick={() => setSheet(false)}>{t('catalog.apply')}</Button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
