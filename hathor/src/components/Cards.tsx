import { motion } from 'motion/react';
import { BadgeCheck, Clock, Heart, MapPin, Package2, Star } from 'lucide-react';
import { useI18n } from '../i18n';
import { Link } from '../lib/router';
import { useStore } from '../lib/store';
import { SUPPLIERS, byId, type Product, type Supplier } from '../data/sample';
import { fmtMoney, fmtNumber } from '../lib/format';
import { ProductArt } from './ProductArt';
import { PremiumBadge, VerifiedBadge } from './ui';

export function ProductCard({ p }: { p: Product }) {
  const { t, lang } = useI18n();
  const { saved, toggleSaved, toast } = useStore();
  const s = byId(SUPPLIERS, p.supplierId)!;
  const isSaved = saved.has(p.id);
  const minPrice = Math.min(...p.tiers.map((x) => x.price));
  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="glass glass-hover group relative flex flex-col overflow-hidden">
      <Link to={`/product/${p.id}`} className="absolute inset-0 z-10" aria-label={p.title[lang]} />
      <div className="relative">
        <ProductArt icon={p.art.icon} hue={p.art.hue} pattern={p.art.pattern} label={p.title[lang]} className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {s.premium && <PremiumBadge short />}
            {p.sampleAvailable && <span className="rounded-full bg-night-900/80 px-2 py-0.5 text-[0.7rem] text-lilac-200 backdrop-blur">{t('product.sample')}</span>}
          </div>
          <motion.button
            type="button" whileTap={{ scale: 0.85 }}
            onClick={() => { toggleSaved(p.id); toast(isSaved ? t('product.save') : t('product.saved')); }}
            className="relative z-20 grid h-10 w-10 place-items-center rounded-full bg-night-900/70 text-lilac-200 backdrop-blur hover:bg-night-900"
            aria-pressed={isSaved} aria-label={isSaved ? t('product.saved') : t('product.save')}
          >
            <Heart className={`h-[18px] w-[18px] ${isSaved ? 'fill-lilac-400 text-lilac-400' : ''}`} />
          </motion.button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-[1.02rem] font-semibold leading-snug text-ink-1" style={{ fontFamily: 'inherit' }}><bdi>{p.title[lang]}</bdi></h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">
          {p.ownFactory ? (
            <span className="inline-flex items-center gap-1 font-semibold text-lilac-200"><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />{t('seller.hathor')}</span>
          ) : (<>
            <span className="truncate"><bdi>{s.name[lang]}</bdi></span>
            <VerifiedBadge level={s.level} short />
          </>)}
        </div>
        <div className="mt-auto pt-2">
          <div className="text-xs text-ink-3">{t('product.from')}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-xl font-semibold text-lilac-200" dir="ltr">{fmtMoney(minPrice, p.currency, lang)}</span>
            <span className="text-xs text-ink-3">/ {p.unit[lang]} · <bdi dir="ltr">{p.incoterm}</bdi> <bdi>{p.port[lang]}</bdi></span>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-lilac-400/10 pt-3 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1"><Package2 className="h-3.5 w-3.5 text-lilac-400" aria-hidden="true" />{t('product.moq')} <bdi dir="ltr" className="num">{fmtNumber(p.moq, lang)}</bdi> {p.unit[lang]}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-lilac-400" aria-hidden="true" />{t('product.days', { n: p.leadDays })}</span>
        </div>
      </div>
    </motion.article>
  );
}

export function SupplierCard({ s }: { s: Supplier }) {
  const { t, lang } = useI18n();
  const initials = s.name.en.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <Link to={`/supplier/${s.id}`} className="glass glass-hover block w-[280px] shrink-0 p-5 sm:w-auto">
      <div className="flex items-start gap-3">
        <div className="wordmark grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-lilac-400/40 bg-gradient-to-br from-night-700 to-night-900 text-sm font-bold text-lilac-200" dir="ltr" aria-hidden="true">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-ink-1"><bdi>{s.name[lang]}</bdi></div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-ink-3"><MapPin className="h-3 w-3" aria-hidden="true" /><bdi>{s.city[lang]}</bdi>، <bdi>{s.country[lang]}</bdi></div>
        </div>
        {s.premium && <PremiumBadge short />}
      </div>
      <div className="mt-4"><VerifiedBadge level={s.level} date={s.verifiedOn} /></div>
      <div className="mt-3 flex items-center gap-4 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-lilac-400" aria-hidden="true" />{t('supplier.deals', { n: s.deals })}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-lilac-400" aria-hidden="true" />{t('supplier.reply', { n: s.replyHours })}</span>
      </div>
    </Link>
  );
}
