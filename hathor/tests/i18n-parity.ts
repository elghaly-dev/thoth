// Every string has Arabic and English, with the same {placeholders}.
import { strings } from '../src/i18n/strings';
import { check, done } from './harness';

const ph = (s: string) => (s.match(/\{\w+\}/g) || []).sort().join(',');
for (const [key, v] of Object.entries(strings)) {
  check(`${key} has ar`, v.ar.trim().length > 0);
  check(`${key} has en`, v.en.trim().length > 0);
  check(`${key} placeholders match`, ph(v.ar) === ph(v.en), `${ph(v.ar)} vs ${ph(v.en)}`);
}
check('assistant is named الغالي in both languages', strings['assistant.name'].ar === 'الغالي' && strings['assistant.name'].en === 'الغالي');
check('no-fee line says 3 months', strings['fees.first3'].en.includes('3 months') && strings['fees.first3'].ar.includes('3 أشهر'));
done('i18n-parity');
