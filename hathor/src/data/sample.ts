// Sample data for the preview. Every record carries sample: true and the UI
// shows a «Sample data» badge wherever it appears. None of it is real.
export type L10n = { ar: string; en: string };

export type CategoryId = 'dates' | 'polymers' | 'metals' | 'fertilisers' | 'building' | 'perfume' | 'packaging' | 'recycled';

export type Category = { id: CategoryId; name: L10n; icon: string; hue: number };

export const CATEGORIES: Category[] = [
  { id: 'dates', name: { ar: 'التمور والأغذية', en: 'Dates and food' }, icon: 'Wheat', hue: 32 },
  { id: 'polymers', name: { ar: 'البوليمرات والكيماويات', en: 'Polymers and chemicals' }, icon: 'FlaskConical', hue: 200 },
  { id: 'metals', name: { ar: 'المعادن', en: 'Metals' }, icon: 'Cylinder', hue: 220 },
  { id: 'fertilisers', name: { ar: 'الأسمدة', en: 'Fertilisers' }, icon: 'Sprout', hue: 140 },
  { id: 'building', name: { ar: 'مواد البناء', en: 'Building materials' }, icon: 'BrickWall', hue: 12 },
  { id: 'perfume', name: { ar: 'العطور والعود', en: 'Perfume and oud' }, icon: 'Flower2', hue: 300 },
  { id: 'packaging', name: { ar: 'التعبئة والتغليف', en: 'Packaging' }, icon: 'Package', hue: 260 },
  { id: 'recycled', name: { ar: 'المواد المعاد تدويرها', en: 'Recycled materials' }, icon: 'Recycle', hue: 170 },
];

// Focus categories for the start: packaging, and food and agri.
export const FOCUS_CATEGORIES: CategoryId[] = ['packaging', 'dates'];

export type VerifyLevel = 0 | 1 | 2 | 3;

export type Supplier = {
  id: string;
  sample: true;
  name: L10n;
  city: L10n;
  country: L10n;
  countryCode: string;
  since: string;
  languages: string[];
  level: VerifyLevel;
  verifiedOn: string;
  premium: boolean;
  deals: number;
  onTime: [number, number];
  disputes: number;
  replyHours: number;
  categories: CategoryId[];
  about: L10n;
};

export const SUPPLIERS: Supplier[] = [
  {
    id: 'nakheel-alwaha', sample: true,
    name: { ar: 'نخيل الواحة للتمور', en: 'Nakheel Al Waha Dates' },
    city: { ar: 'الأحساء', en: 'Al Ahsa' }, country: { ar: 'السعودية', en: 'Saudi Arabia' }, countryCode: 'SA',
    since: '2026-03-01', languages: ['العربية', 'English'], level: 3, verifiedOn: '2026-09-14', premium: true,
    deals: 18, onTime: [17, 18], disputes: 0, replyHours: 4, categories: ['dates'],
    about: { ar: 'مزارع ومصنع تعبئة للتمور الفاخرة، بخطوط فرز وتبريد.', en: 'Farms and a packing plant for premium dates, with sorting and cold lines.' },
  },
  {
    id: 'gulf-polymer', sample: true,
    name: { ar: 'الخليج للبوليمرات', en: 'Gulf Polymer Trading' },
    city: { ar: 'جبل علي', en: 'Jebel Ali' }, country: { ar: 'الإمارات', en: 'UAE' }, countryCode: 'AE',
    since: '2026-02-10', languages: ['العربية', 'English', 'हिन्दी'], level: 2, verifiedOn: '2026-08-02', premium: true,
    deals: 31, onTime: [29, 31], disputes: 1, replyHours: 2, categories: ['polymers', 'packaging'],
    about: { ar: 'توزيع حبيبات البولي إيثيلين والبولي بروبيلين من مستودعات جمركية في جبل علي.', en: 'Polyethylene and polypropylene granules from bonded warehouses in Jebel Ali.' },
  },
  {
    id: 'nile-steel', sample: true,
    name: { ar: 'النيل للصلب', en: 'Nile Steel Works' },
    city: { ar: 'العين السخنة', en: 'Ain Sokhna' }, country: { ar: 'مصر', en: 'Egypt' }, countryCode: 'EG',
    since: '2026-05-20', languages: ['العربية', 'English'], level: 1, verifiedOn: '2026-10-05', premium: false,
    deals: 6, onTime: [6, 6], disputes: 0, replyHours: 8, categories: ['metals', 'building'],
    about: { ar: 'حديد تسليح ولفائف مدرفلة على الساخن قرب ميناء السخنة.', en: 'Rebar and hot-rolled coil near Sokhna port.' },
  },
  {
    id: 'oman-agri', sample: true,
    name: { ar: 'عُمان للأسمدة', en: 'Oman Agri Nutrients' },
    city: { ar: 'صحار', en: 'Sohar' }, country: { ar: 'عُمان', en: 'Oman' }, countryCode: 'OM',
    since: '2026-04-11', languages: ['العربية', 'English'], level: 2, verifiedOn: '2026-07-21', premium: false,
    deals: 12, onTime: [11, 12], disputes: 0, replyHours: 6, categories: ['fertilisers'],
    about: { ar: 'يوريا حبيبية وأسمدة مركّبة من ميناء صحار.', en: 'Granular urea and compound fertilisers from Sohar port.' },
  },
  {
    id: 'dar-al-oud', sample: true,
    name: { ar: 'دار العود', en: 'Dar Al Oud' },
    city: { ar: 'الدوحة', en: 'Doha' }, country: { ar: 'قطر', en: 'Qatar' }, countryCode: 'QA',
    since: '2026-06-02', languages: ['العربية', 'English'], level: 3, verifiedOn: '2026-10-28', premium: true,
    deals: 9, onTime: [9, 9], disputes: 0, replyHours: 3, categories: ['perfume'],
    about: { ar: 'دهن العود والبخور والعطور الشرقية بتعبئة خاصة.', en: 'Oud oil, bakhoor and oriental perfume with private label.' },
  },
  {
    id: 'liwa-dates', sample: true,
    name: { ar: 'ليوا للتمور', en: 'Liwa Date Co.' },
    city: { ar: 'العين', en: 'Al Ain' }, country: { ar: 'الإمارات', en: 'UAE' }, countryCode: 'AE',
    since: '2026-01-18', languages: ['العربية', 'English', 'हिन्दी'], level: 2, verifiedOn: '2026-06-30', premium: false,
    deals: 24, onTime: [22, 24], disputes: 1, replyHours: 5, categories: ['dates'],
    about: { ar: 'تمور إماراتية بتعبئة للتصدير وغرف تبريد.', en: 'Emirati dates with export packing and cold rooms.' },
  },
  {
    id: 'siwa-farms', sample: true,
    name: { ar: 'مزارع سيوة', en: 'Siwa Farms' },
    city: { ar: 'سيوة', en: 'Siwa' }, country: { ar: 'مصر', en: 'Egypt' }, countryCode: 'EG',
    since: '2026-08-09', languages: ['العربية', 'English'], level: 1, verifiedOn: '2026-10-19', premium: false,
    deals: 3, onTime: [3, 3], disputes: 0, replyHours: 12, categories: ['dates'],
    about: { ar: 'تمور سيوي ومجدول من واحة سيوة.', en: 'Siwi and Medjool dates from the Siwa oasis.' },
  },
  {
    id: 'cycle-arabia', sample: true,
    name: { ar: 'سايكل أرابيا', en: 'Cycle Arabia' },
    city: { ar: 'الدمام', en: 'Dammam' }, country: { ar: 'السعودية', en: 'Saudi Arabia' }, countryCode: 'SA',
    since: '2026-07-15', languages: ['العربية', 'English'], level: 1, verifiedOn: '2026-11-02', premium: false,
    deals: 4, onTime: [4, 4], disputes: 0, replyHours: 10, categories: ['recycled', 'packaging'],
    about: { ar: 'رقائق PET معاد تدويرها وكرتون مضغوط.', en: 'Recycled PET flakes and baled cardboard.' },
  },
];

export type Tier = { minQty: number; price: number };

export type Product = {
  id: string;
  sample: true;
  title: L10n;
  category: CategoryId;
  supplierId: string;
  currency: string;
  unit: L10n;
  tiers: Tier[];
  // Retail: price for a single unit, when the supplier sells retail. Wholesale is the tiers from the MOQ.
  retailPrice?: number;
  incoterm: string;
  port: L10n;
  hs: string;
  origin: L10n;
  moq: number;
  leadDays: number;
  sampleAvailable: boolean;
  specs: { k: L10n; v: L10n }[];
  certs: string[];
  featured?: boolean;
  art: { icon: string; hue: number; pattern: 'dots' | 'waves' | 'grid' | 'rings' };
};

const kg = { ar: 'كغ', en: 'kg' };
const mt = { ar: 'طن', en: 'MT' };
const pc = { ar: 'قطعة', en: 'pc' };

export const PRODUCTS: Product[] = [
  {
    id: 'medjool-premium', sample: true, featured: true,
    title: { ar: 'تمر مجدول فاخر، حجم جامبو', en: 'Premium Medjool dates, jumbo' },
    category: 'dates', supplierId: 'nakheel-alwaha', currency: 'SAR', unit: kg,
    tiers: [{ minQty: 500, price: 38 }, { minQty: 2000, price: 34.5 }, { minQty: 10000, price: 31 }],
    incoterm: 'FOB', port: { ar: 'الدمام', en: 'Dammam' }, hs: '0804.10', origin: { ar: 'السعودية', en: 'Saudi Arabia' },
    moq: 500, leadDays: 12, sampleAvailable: true,
    specs: [
      { k: { ar: 'الحجم', en: 'Size' }, v: { ar: 'جامبو، 18 إلى 22 حبة لكل 500 غ', en: 'Jumbo, 18 to 22 pieces per 500 g' } },
      { k: { ar: 'التعبئة', en: 'Packing' }, v: { ar: 'كراتين 5 كغ مبرّدة', en: '5 kg chilled cartons' } },
      { k: { ar: 'الرطوبة', en: 'Moisture' }, v: { ar: 'حسب شهادة المختبر', en: 'Per lab certificate' } },
    ],
    certs: ['ISO 22000', 'HACCP', 'Halal'],
    art: { icon: 'Wheat', hue: 32, pattern: 'dots' },
  },
  {
    id: 'hdpe-film', sample: true, featured: true,
    title: { ar: 'حبيبات HDPE درجة أفلام', en: 'HDPE granules, film grade' },
    category: 'polymers', supplierId: 'gulf-polymer', currency: 'USD', unit: mt,
    tiers: [{ minQty: 25, price: 1080 }, { minQty: 100, price: 1045 }, { minQty: 500, price: 1010 }],
    incoterm: 'FOB', port: { ar: 'جبل علي', en: 'Jebel Ali' }, hs: '3901.20', origin: { ar: 'الإمارات', en: 'UAE' },
    moq: 25, leadDays: 7, sampleAvailable: true,
    specs: [
      { k: { ar: 'مؤشر الانصهار', en: 'Melt index' }, v: { ar: 'حسب ورقة البيانات', en: 'Per data sheet' } },
      { k: { ar: 'التعبئة', en: 'Packing' }, v: { ar: 'أكياس 25 كغ على منصّات', en: '25 kg bags on pallets' } },
    ],
    certs: ['REACH', 'ISO 9001'],
    art: { icon: 'FlaskConical', hue: 200, pattern: 'rings' },
  },
  {
    id: 'rebar-b500', sample: true, featured: true,
    title: { ar: 'حديد تسليح B500B، 12 مم', en: 'Rebar B500B, 12 mm' },
    category: 'metals', supplierId: 'nile-steel', currency: 'USD', unit: mt,
    tiers: [{ minQty: 50, price: 640 }, { minQty: 250, price: 620 }],
    incoterm: 'FOB', port: { ar: 'السخنة', en: 'Sokhna' }, hs: '7214.20', origin: { ar: 'مصر', en: 'Egypt' },
    moq: 50, leadDays: 21, sampleAvailable: false,
    specs: [
      { k: { ar: 'الطول', en: 'Length' }, v: { ar: '12 م', en: '12 m' } },
      { k: { ar: 'المعيار', en: 'Standard' }, v: { ar: 'BS 4449', en: 'BS 4449' } },
    ],
    certs: ['BS 4449', 'ISO 9001'],
    art: { icon: 'Cylinder', hue: 220, pattern: 'grid' },
  },
  {
    id: 'urea-46', sample: true, featured: true,
    title: { ar: 'يوريا حبيبية N46', en: 'Granular urea N46' },
    category: 'fertilisers', supplierId: 'oman-agri', currency: 'USD', unit: mt,
    tiers: [{ minQty: 500, price: 365 }, { minQty: 5000, price: 352 }],
    incoterm: 'FOB', port: { ar: 'صحار', en: 'Sohar' }, hs: '3102.10', origin: { ar: 'عُمان', en: 'Oman' },
    moq: 500, leadDays: 14, sampleAvailable: true,
    specs: [{ k: { ar: 'النيتروجين', en: 'Nitrogen' }, v: { ar: '46 جزءًا من كل 100', en: '46 parts in every 100' } }],
    certs: ['SGS inspection'],
    art: { icon: 'Sprout', hue: 140, pattern: 'waves' },
  },
  {
    id: 'oud-oil-cambodi', sample: true, featured: true,
    title: { ar: 'دهن عود كمبودي، تولة', en: 'Cambodian oud oil, tola' },
    category: 'perfume', supplierId: 'dar-al-oud', currency: 'QAR', unit: pc,
    tiers: [{ minQty: 20, price: 420 }, { minQty: 100, price: 385 }],
    incoterm: 'CFR', port: { ar: 'حمد', en: 'Hamad' }, hs: '3301.29', origin: { ar: 'قطر', en: 'Qatar' },
    moq: 20, leadDays: 10, sampleAvailable: true,
    specs: [{ k: { ar: 'الحجم', en: 'Volume' }, v: { ar: '12 مل', en: '12 ml' } }],
    certs: ['IFRA'],
    art: { icon: 'Flower2', hue: 300, pattern: 'rings' },
  },
  {
    id: 'pet-flakes', sample: true, featured: true,
    title: { ar: 'رقائق PET شفافة معاد تدويرها', en: 'Clear recycled PET flakes' },
    category: 'recycled', supplierId: 'cycle-arabia', currency: 'SAR', unit: mt,
    tiers: [{ minQty: 20, price: 2350 }, { minQty: 100, price: 2210 }],
    incoterm: 'FOB', port: { ar: 'الدمام', en: 'Dammam' }, hs: '3915.90', origin: { ar: 'السعودية', en: 'Saudi Arabia' },
    moq: 20, leadDays: 9, sampleAvailable: true,
    specs: [{ k: { ar: 'الحجم', en: 'Flake size' }, v: { ar: '8 إلى 12 مم', en: '8 to 12 mm' } }],
    certs: ['GRS'],
    art: { icon: 'Recycle', hue: 170, pattern: 'dots' },
  },
  {
    id: 'sukkari-dates', sample: true,
    title: { ar: 'تمر سكري مفتل', en: 'Sukkari dates, mufattal' },
    category: 'dates', supplierId: 'nakheel-alwaha', currency: 'SAR', unit: kg,
    tiers: [{ minQty: 1000, price: 22 }, { minQty: 5000, price: 19.5 }],
    incoterm: 'FOB', port: { ar: 'الدمام', en: 'Dammam' }, hs: '0804.10', origin: { ar: 'السعودية', en: 'Saudi Arabia' },
    moq: 1000, leadDays: 10, sampleAvailable: true,
    specs: [{ k: { ar: 'التعبئة', en: 'Packing' }, v: { ar: 'علب 1 كغ', en: '1 kg boxes' } }],
    certs: ['HACCP', 'Halal'],
    art: { icon: 'Wheat', hue: 38, pattern: 'waves' },
  },
  {
    id: 'pp-raffia', sample: true,
    title: { ar: 'بولي بروبيلين درجة رافيا', en: 'Polypropylene, raffia grade' },
    category: 'polymers', supplierId: 'gulf-polymer', currency: 'USD', unit: mt,
    tiers: [{ minQty: 25, price: 1020 }, { minQty: 200, price: 985 }],
    incoterm: 'CFR', port: { ar: 'جبل علي', en: 'Jebel Ali' }, hs: '3902.10', origin: { ar: 'الإمارات', en: 'UAE' },
    moq: 25, leadDays: 8, sampleAvailable: false,
    specs: [{ k: { ar: 'الاستخدام', en: 'Use' }, v: { ar: 'أكياس منسوجة', en: 'Woven sacks' } }],
    certs: ['ISO 9001'],
    art: { icon: 'FlaskConical', hue: 210, pattern: 'grid' },
  },
  {
    id: 'hr-coil', sample: true,
    title: { ar: 'لفائف مدرفلة على الساخن', en: 'Hot-rolled steel coil' },
    category: 'metals', supplierId: 'nile-steel', currency: 'USD', unit: mt,
    tiers: [{ minQty: 100, price: 610 }],
    incoterm: 'FOB', port: { ar: 'السخنة', en: 'Sokhna' }, hs: '7208.39', origin: { ar: 'مصر', en: 'Egypt' },
    moq: 100, leadDays: 25, sampleAvailable: false,
    specs: [{ k: { ar: 'السماكة', en: 'Thickness' }, v: { ar: '2 إلى 6 مم', en: '2 to 6 mm' } }],
    certs: ['EN 10025'],
    art: { icon: 'Disc3', hue: 230, pattern: 'rings' },
  },
  {
    id: 'kraft-boxes', sample: true,
    title: { ar: 'صناديق كرتون مموّج مطبوعة', en: 'Printed corrugated boxes' },
    category: 'packaging', supplierId: 'cycle-arabia', currency: 'SAR', unit: pc,
    tiers: [{ minQty: 5000, price: 1.8 }, { minQty: 20000, price: 1.45 }],
    incoterm: 'EXW', port: { ar: 'الدمام', en: 'Dammam' }, hs: '4819.10', origin: { ar: 'السعودية', en: 'Saudi Arabia' },
    moq: 5000, leadDays: 15, sampleAvailable: true,
    specs: [{ k: { ar: 'الطبقات', en: 'Layers' }, v: { ar: '5 طبقات', en: '5-ply' } }],
    certs: ['FSC'],
    art: { icon: 'Package', hue: 265, pattern: 'grid' },
  },
  {
    id: 'npk-compound', sample: true,
    title: { ar: 'سماد مركّب NPK 20-20-20', en: 'NPK 20-20-20 compound' },
    category: 'fertilisers', supplierId: 'oman-agri', currency: 'OMR', unit: mt,
    tiers: [{ minQty: 100, price: 238 }],
    incoterm: 'FOB', port: { ar: 'صحار', en: 'Sohar' }, hs: '3105.20', origin: { ar: 'عُمان', en: 'Oman' },
    moq: 100, leadDays: 18, sampleAvailable: true,
    specs: [{ k: { ar: 'الذوبان', en: 'Solubility' }, v: { ar: 'قابل للذوبان في الماء', en: 'Water soluble' } }],
    certs: ['SGS inspection'],
    art: { icon: 'Sprout', hue: 120, pattern: 'dots' },
  },
  {
    id: 'bakhoor-blend', sample: true,
    title: { ar: 'بخور معمول، علب هدايا', en: 'Bakhoor blend, gift boxes' },
    category: 'perfume', supplierId: 'dar-al-oud', currency: 'QAR', unit: pc,
    tiers: [{ minQty: 200, price: 46 }, { minQty: 1000, price: 39 }],
    incoterm: 'CFR', port: { ar: 'حمد', en: 'Hamad' }, hs: '3307.41', origin: { ar: 'قطر', en: 'Qatar' },
    moq: 200, leadDays: 12, sampleAvailable: true,
    specs: [{ k: { ar: 'الوزن', en: 'Weight' }, v: { ar: '60 غ لكل علبة', en: '60 g per box' } }],
    certs: ['IFRA'],
    art: { icon: 'Flame', hue: 320, pattern: 'waves' },
  },
];

export const PORTS: L10n[] = [
  { ar: 'نافا شيفا', en: 'Nhava Sheva' },
  { ar: 'موندرا', en: 'Mundra' },
  { ar: 'تشيناي', en: 'Chennai' },
  { ar: 'كوتشي', en: 'Kochi' },
  { ar: 'كولكاتا', en: 'Kolkata' },
];

export type Quote = {
  id: string;
  sample: true;
  supplierId: string;
  unitPrice: number;
  currency: string;
  incoterm: string;
  port: L10n;
  moq: number;
  leadDays: number;
  payment: L10n | null;
  validUntil: string | null;
};

export type Rfq = {
  id: string;
  sample: true;
  title: L10n;
  category: CategoryId;
  quantity: number;
  unit: L10n;
  incoterm: string;
  port: L10n;
  deliverBy: string;
  status: 'draft' | 'open' | 'quotes' | 'closed';
  newQuotes: number;
  quotes: Quote[];
};

export const RFQS: Rfq[] = [
  {
    id: 'R-2041', sample: true,
    title: { ar: 'تمر مجدول، كراتين 5 كغ', en: 'Medjool dates, 5 kg cartons' },
    category: 'dates', quantity: 6000, unit: kg, incoterm: 'CFR', port: PORTS[0], deliverBy: '2027-01-20',
    status: 'quotes', newQuotes: 3,
    quotes: [
      { id: 'Q-A', sample: true, supplierId: 'nakheel-alwaha', unitPrice: 9.2, currency: 'USD', incoterm: 'CFR', port: PORTS[0], moq: 2000, leadDays: 12, payment: { ar: '30 من كل 100 مقدمًا، والباقي عند الشحن', en: '30 in every 100 upfront, balance at shipment' }, validUntil: '2026-12-15' },
      { id: 'Q-B', sample: true, supplierId: 'liwa-dates', unitPrice: 8.75, currency: 'USD', incoterm: 'CFR', port: PORTS[0], moq: 5000, leadDays: 20, payment: { ar: 'اعتماد مستندي', en: 'Letter of credit' }, validUntil: '2026-12-08' },
      { id: 'Q-C', sample: true, supplierId: 'siwa-farms', unitPrice: 9.6, currency: 'USD', incoterm: 'CFR', port: PORTS[0], moq: 1000, leadDays: 8, payment: null, validUntil: null },
    ],
  },
  {
    id: 'R-2038', sample: true,
    title: { ar: 'حبيبات HDPE درجة أفلام', en: 'HDPE film grade granules' },
    category: 'polymers', quantity: 100, unit: mt, incoterm: 'FOB', port: PORTS[1], deliverBy: '2027-02-05',
    status: 'open', newQuotes: 0, quotes: [],
  },
  {
    id: 'R-2033', sample: true,
    title: { ar: 'صناديق كرتون مطبوعة', en: 'Printed cartons' },
    category: 'packaging', quantity: 20000, unit: pc, incoterm: 'EXW', port: PORTS[2], deliverBy: '2027-01-05',
    status: 'draft', newQuotes: 0, quotes: [],
  },
];

export type DealNode = { key: string; state: 'done' | 'now' | 'next'; date?: string; who?: L10n; doc?: { name: string; hash: string } };

export const DEAL = {
  id: 'D-1042', sample: true as const,
  productId: 'medjool-premium',
  title: { ar: 'تمر مجدول فاخر، جامبو', en: 'Premium Medjool dates, jumbo' },
  quantity: 6000, unit: kg, unitPrice: 9.2, currency: 'USD', incoterm: 'CFR',
  from: { ar: 'الدمام', en: 'Dammam' }, to: PORTS[0],
  buyer: { ar: 'شركة مومباي للأغذية', en: 'Mumbai Fine Foods' },
  supplierId: 'nakheel-alwaha',
  nodes: [
    { key: 'deal.n1', state: 'done', date: '2026-11-10', who: { ar: 'المشتري', en: 'Buyer' } },
    { key: 'deal.n2', state: 'done', date: '2026-11-12', who: { ar: 'المورّد', en: 'Supplier' }, doc: { name: 'proforma-D-1042.pdf', hash: 'a3f1…9c2e' } },
    { key: 'deal.n3', state: 'now' },
    { key: 'deal.n4', state: 'next' },
    { key: 'deal.n5', state: 'next' },
    { key: 'deal.n6', state: 'next' },
    { key: 'deal.n7', state: 'next' },
    { key: 'deal.n8', state: 'next' },
    { key: 'deal.n9', state: 'next' },
    { key: 'deal.n10', state: 'next' },
    { key: 'deal.n11', state: 'next' },
  ] as DealNode[],
};

export type Msg = {
  id: string;
  from: 'me' | 'them';
  text: string;
  lang: 'ar' | 'en';
  translation?: string;
  at: string;
  check?: 'clear' | 'unknown' | 'dangerous';
};

export type Thread = {
  id: string;
  sample: true;
  supplierId: string;
  context: { kind: 'deal' | 'rfq' | 'product'; ref: string; label: L10n; to: string };
  unread: number;
  flagged?: 'unknown' | 'dangerous';
  messages: Msg[];
};

export const THREADS: Thread[] = [
  {
    id: 't1', sample: true, supplierId: 'nakheel-alwaha',
    context: { kind: 'deal', ref: 'D-1042', label: { ar: 'صفقة D-1042 · تمر مجدول', en: 'Deal D-1042 · Medjool dates' }, to: '/deal/D-1042' },
    unread: 2,
    messages: [
      { id: 'm1', from: 'me', lang: 'en', text: 'Hello, can you confirm 6,000 kg in 5 kg cartons, CFR Nhava Sheva?', at: '2026-11-22T09:10:00', translation: 'مرحبًا، هل تؤكّدون 6,000 كغ في كراتين 5 كغ، CFR نافا شيفا؟' },
      { id: 'm2', from: 'them', lang: 'ar', text: 'وعليكم السلام. نعم، 6,000 كغ جاهزة خلال 12 يومًا، والسعر 9.2 دولار للكغ.', at: '2026-11-22T09:42:00', check: 'clear', translation: 'Peace be upon you. Yes, 6,000 kg ready within 12 days, and the price is 9.2 dollars per kg.' },
      { id: 'm3', from: 'them', lang: 'ar', text: 'للتواصل أسرع كلمني واتساب على 0501234567', at: '2026-11-22T09:44:00', check: 'unknown', translation: 'For faster contact message me on WhatsApp at 0501234567' },
      { id: 'm4', from: 'them', lang: 'ar', text: 'رفعت الفاتورة المبدئية في غرفة الصفقة، الإجمالي 55,200 دولار.', at: '2026-11-23T11:05:00', check: 'clear', translation: 'I uploaded the proforma invoice to the deal room, the total is 55,200 dollars.' },
    ],
  },
  {
    id: 't2', sample: true, supplierId: 'siwa-farms',
    context: { kind: 'rfq', ref: 'R-2041', label: { ar: 'طلب R-2041', en: 'Request R-2041' }, to: '/rfq/R-2041' },
    unread: 0, flagged: 'dangerous',
    messages: [
      { id: 'm5', from: 'them', lang: 'en', text: 'We can do 8.75 USD per kg if you pay to our new account IBAN AE07 0331 2345 6789 0123 456 today.', at: '2026-11-21T15:20:00', check: 'dangerous', translation: 'يمكننا تقديم 8.75 دولار للكغ إذا دفعت اليوم إلى حسابنا الجديد IBAN AE07 0331 2345 6789 0123 456.' },
      { id: 'm6', from: 'me', lang: 'en', text: 'All payments stay inside the deal room, thanks.', at: '2026-11-21T15:31:00', translation: 'كل المدفوعات تبقى داخل غرفة الصفقة، شكرًا.' },
    ],
  },
  {
    id: 't3', sample: true, supplierId: 'dar-al-oud',
    context: { kind: 'product', ref: 'oud-oil-cambodi', label: { ar: 'دهن عود كمبودي', en: 'Cambodian oud oil' }, to: '/product/oud-oil-cambodi' },
    unread: 1,
    messages: [
      { id: 'm7', from: 'them', lang: 'ar', text: 'العيّنة جاهزة، ونشحن 20 تولة كحد أدنى.', at: '2026-11-20T18:02:00', check: 'clear', translation: 'The sample is ready, and we ship 20 tola minimum.' },
      { id: 'm8', from: 'them', lang: 'ar', text: 'السعر للكمية الكبيرة 385 ريال للتولة.', at: '2026-11-20T18:04:00', check: 'clear', translation: 'The price for large quantity is 358 riyals per tola.' },
    ],
  },
];

// Account used for fee display in the preview.
export const ME = { name: { ar: 'أحمد', en: 'Ahmed' }, company: { ar: 'شركة مومباي للأغذية', en: 'Mumbai Fine Foods' }, created: '2026-10-01' };

export const byId = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id);
