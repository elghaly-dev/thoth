import { useI18n } from '../i18n';
import { ButtonLink } from '../components/ui';
import { GlowLine } from '../components/GlowLine';

export function NotFound() {
  const { t } = useI18n();
  return (
    <div className="glass mx-auto mt-10 max-w-lg p-10 text-center">
      <div className="mx-auto w-24"><GlowLine nodes={[{ label: '', state: 'now' }]} compact /></div>
      <h1 className="title-gradient mt-4 text-3xl">{t('notfound.t')}</h1>
      <ButtonLink to="/" className="mt-6">{t('notfound.back')}</ButtonLink>
    </div>
  );
}
