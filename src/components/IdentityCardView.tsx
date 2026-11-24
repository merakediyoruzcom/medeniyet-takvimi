import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import {
  calculateHierarchy,
  getBirthArchetype,
  getCivilizationDate,
  parseDateInputValue,
} from '../lib/calendar';
import { exportIdentityCardPng } from '../lib/cardExport';
import { MoonDisc } from './MoonDisc';

interface IdentityCardViewProps {
  readonly headingRef: React.RefObject<HTMLHeadingElement | null>;
  readonly onNotify: (msg: string) => void;
}

export function IdentityCardView({ headingRef, onNotify }: IdentityCardViewProps) {
  const [name, setName] = useState('Bilge Gezgin');
  const [birthInput, setBirthInput] = useState('1998-07-15');
  const [isExporting, setIsExporting] = useState(false);

  const parsedDate = parseDateInputValue(birthInput) ?? new Date(1998, 6, 15);
  const civDate = getCivilizationDate(parsedDate);
  const hierarchy = calculateHierarchy(civDate.civYear);
  const archetype = getBirthArchetype(civDate, hierarchy);

  const dateHeadline =
    civDate.civDay === 0
      ? (civDate.specialDay ?? civDate.monthName)
      : `${civDate.civDay} ${civDate.monthName}`;

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const outcome = await exportIdentityCardPng({
        name,
        birthDate: parsedDate,
        civDate,
        hierarchy,
        archetype,
      });
      if (outcome !== 'cancelled') {
        onNotify(
          outcome === 'shared'
            ? 'Medeniyet kimlik belgesi paylaşıldı.'
            : 'Medeniyet kimlik belgesi PNG olarak indirildi.',
        );
      }
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : 'PNG dosyası oluşturulamadı.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section aria-labelledby="identity-heading" className="mx-auto w-full max-w-3xl space-y-6">
      <div className="border-b border-hairline pb-5">
        <p className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
          ARŞİV BELGESİ VE ROZET
        </p>
        <h2
          id="identity-heading"
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl font-bold tracking-tight text-ink outline-none sm:text-4xl"
        >
          Medeniyet Nüfus Kütüğü
        </h2>
        <p className="mt-1 max-w-[65ch] text-sm text-muted">
          Doğum tarihinizi girerek 13 aylık sabit takvimdeki koordinatlarınızı ve indirilebilir kimlik levhanızı oluşturun.
        </p>
      </div>

      {/* Form Alanı */}
      <div className="observatory-plate grid grid-cols-1 gap-4 rounded-2xl p-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="identity-name-input"
            className="mb-1.5 block text-xs font-medium text-muted"
          >
            Ad ve Ünvan
          </label>
          <input
            id="identity-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız veya unvanınız"
            className="min-h-[44px] w-full rounded-xl border border-hairline bg-surface-raised px-3.5 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="identity-birthdate-input"
            className="mb-1.5 block text-xs font-medium text-muted"
          >
            Gregoryen Doğum Tarihi
          </label>
          <input
            id="identity-birthdate-input"
            type="date"
            value={birthInput}
            onChange={(e) => setBirthInput(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-hairline bg-surface-raised px-3.5 py-2 font-mono text-sm tabular-nums text-ink focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* ARŞİV KİMLİK LEVHASI */}
      <article
        id="birth-card-element"
        className="double-archival-frame observatory-plate-raised relative rounded-2xl p-7 sm:p-10"
      >
        {/* Köşe rasathane nişangâh işaretleri */}
        <span aria-hidden="true" className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-accent" />
        <span aria-hidden="true" className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-accent" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-accent" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-accent" />

        <div className="flex items-start justify-between gap-4 border-b border-hairline pb-5">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-accent uppercase">
              MEDENİYET TAKVİMİ RESMİ KÜTÜK KAYDI
            </p>
            <h3 className="font-display mt-1 text-3xl font-bold text-ink">
              {name.trim() || 'İsimsiz Yolcu'}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Gregoryen Doğum:{' '}
              {parsedDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Geometrik 8-köşeli Rasathane Mührü */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="shrink-0 text-accent"
          >
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="32" cy="32" r="22" fill="none" stroke="var(--border)" strokeWidth="1" />
            {[0, 45, 90, 135].map((deg) => (
              <line
                key={deg}
                x1="32"
                y1="10"
                x2="32"
                y2="54"
                stroke="currentColor"
                strokeWidth="1.2"
                transform={`rotate(${deg} 32 32)`}
              />
            ))}
            <circle cx="32" cy="32" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* Merkez Doğum Tarihi Bandı */}
        <div className="my-6 rounded-xl border border-hairline bg-surface px-4 py-6 text-center">
          <p className="font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
            MEDENİYET DOĞUM KOORDİNATI
          </p>
          <p className="font-display mt-1 text-5xl font-bold tracking-tight text-accent sm:text-6xl">
            {dateHeadline}
          </p>
          <p className="mt-1 text-lg font-medium tabular-nums text-ink">
            {civDate.civYear} Yılı · {civDate.weekday}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-raised px-3.5 py-1 text-xs text-ink">
            <MoonDisc phase={civDate.moonPhase} size={16} />
            <span>
              Doğum Ay Evresi: {civDate.moonPhase.name} ({civDate.moonPhase.illumination})
            </span>
          </div>
        </div>

        {/* 4 Kozmik Koordinat */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-4">
          <div className="bg-surface p-3 text-center">
            <dt className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
              Döngü
            </dt>
            <dd className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: hierarchy.cycle.colorVar }}
              />
              <span>{hierarchy.cycle.name}</span>
            </dd>
          </div>
          <div className="bg-surface p-3 text-center">
            <dt className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
              Nesil
            </dt>
            <dd className="mt-1 text-xs font-semibold text-ink">
              {hierarchy.generation} Nesli
            </dd>
          </div>
          <div className="bg-surface p-3 text-center">
            <dt className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
              Çağ
            </dt>
            <dd className="mt-1 text-xs font-semibold text-ink">
              {hierarchy.age} Çağı
            </dd>
          </div>
          <div className="bg-surface p-3 text-center">
            <dt className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
              Büyük Devir
            </dt>
            <dd className="mt-1 font-mono text-xs font-semibold tabular-nums text-ink">
              {hierarchy.eon}. Eon
            </dd>
          </div>
        </dl>

        {/* Arketip Metni */}
        <div className="mt-6 border-l-2 border-accent pl-4">
          <p className="font-mono text-[10px] tracking-[0.08em] text-accent uppercase">
            Doğum Enerjisi ve Arketip
          </p>
          <p className="font-display mt-1 text-lg italic leading-relaxed text-ink">
            “{archetype}”
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4 font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
          <span>Milat: M.Ö. 3200 Yazının İcadı</span>
          <span>13 Ay × 28 Gün Astronomik Almanak</span>
        </div>
      </article>

      {/* Dışa Aktarım Düğmeleri */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={isExporting}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Download size={16} aria-hidden="true" />
          <span>{isExporting ? 'Belge Hazırlanıyor...' : 'PNG Olarak İndir'}</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-hairline bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <Printer size={16} aria-hidden="true" />
          <span>Yazdır / PDF Kaydet</span>
        </button>
      </div>
    </section>
  );
}
