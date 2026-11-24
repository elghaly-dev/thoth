// Search order: verified direct suppliers first, Alibaba items kept apart.
import { directFirst, dutyOrigin, PRICE_REFERENCE, sellerRank } from '../src/lib/listing';
import { DEFAULT_RATES, estimate } from '../src/lib/landed';
import { FOCUS_CATEGORIES } from '../src/data/sample';
import { retailLabel } from '../src/lib/format';
import { check, done } from './harness';

const items = [{ id: 'a', l: 0 }, { id: 'b', l: 3 }, { id: 'c', l: 1 }, { id: 'd', l: 3 }];
check('higher verification first, stable within a level', directFirst(items, (x) => x.l).map((x) => x.id).join('') === 'bdca');
check('no Alibaba items mixed in until the feed is connected', PRICE_REFERENCE.length === 0);
check('focus categories are packaging and food', FOCUS_CATEGORIES.join() === 'packaging,dates');
check('own factory ranks above every verified supplier', sellerRank({ ownFactory: true }, 0) > sellerRank({}, 3));
const prods = [{ id: 'v3', l: 3 }, { id: 'own', l: 0, ownFactory: true }];
check('own factory listed first', directFirst(prods, (p) => sellerRank(p, p.l))[0].id === 'own');
check('duty origin follows the true origin', dutyOrigin('UAE') === 'AE' && dutyOrigin('Saudi Arabia') === 'SA' && dutyOrigin('China') === 'OTHER' && dutyOrigin('Egypt') === 'OTHER');
const r = { ...DEFAULT_RATES[0], bcdMfn: 10, bcdCepa: 2, igst: 10, sws: 10 };
check('non-UAE origin never gets the CEPA rate', estimate({ goodsValue: 100, incoterm: 'CIF', origin: 'OTHER', rate: r }).bcdRate === 10);
check('retail price shows when set', retailLabel(12, 'USD', 'en') === 'USD 12');
check('no retail price means not sold retail', retailLabel(undefined, 'USD', 'en') === null && retailLabel(0, 'USD', 'en') === null);
done('listing');
