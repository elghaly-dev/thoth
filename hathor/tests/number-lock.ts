// Number lock: a translation that changes any number is hidden.
import { extractNumbers, numbersMatch } from '../src/lib/numberlock';
import { THREADS } from '../src/data/sample';
import { check, done } from './harness';

check('same numbers match', numbersMatch('6,000 kg at USD 9.2', '6,000 كغ بسعر 9.2 دولار'));
check('Arabic-Indic digits normalise', numbersMatch('٦٠٠٠ كغ', '6000 kg'));
check('changed number fails', !numbersMatch('385 riyal', '358 riyal'));
check('dropped number fails', !numbersMatch('20 tola, 12 ml', '20 tola'));
check('extract strips separators', extractNumbers('55,200').join() === '55200');

// The sample thread with a mismatched translation must be caught.
const bad = THREADS.flatMap((t) => t.messages).filter((m) => m.translation && !numbersMatch(m.text, m.translation));
check('sample data has exactly one mismatched translation (demo of the hidden state)', bad.length === 1, String(bad.length));

done('number-lock');
