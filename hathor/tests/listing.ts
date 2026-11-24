// Search order: verified direct suppliers first, Alibaba items kept apart.
import { directFirst, PRICE_REFERENCE } from '../src/lib/listing';
import { FOCUS_CATEGORIES } from '../src/data/sample';
import { check, done } from './harness';

const items = [{ id: 'a', l: 0 }, { id: 'b', l: 3 }, { id: 'c', l: 1 }, { id: 'd', l: 3 }];
check('higher verification first, stable within a level', directFirst(items, (x) => x.l).map((x) => x.id).join('') === 'bdca');
check('no Alibaba items mixed in until the feed is connected', PRICE_REFERENCE.length === 0);
check('focus categories are packaging and food', FOCUS_CATEGORIES.join() === 'packaging,dates');
done('listing');
