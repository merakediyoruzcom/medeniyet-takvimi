import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import {
  calculateHierarchy,
  formatGregorianDate,
  getCivilizationDate,
  HISTORICAL_EVENTS,
  type HistoricalEvent,
  type HistoricalEventType,
} from '../lib/calendar';

interface HistoryExplorerViewProps {
  readonly headingRef: React.RefObject<HTMLHeadingElement | null>;
  readonly onInspectEventDate: (date: Date) => void;
}

const EVENT_TYPES: ReadonlyArray<'Tümü' | HistoricalEventType> = [
  'Tümü',
  'Başlangıç',
  'Miras',
  'Bilim',
  'Fetih',
  'Devrim',
  'Kuruluş',
  'Zafer',
];

function toEventLocalDate(evt: HistoricalEvent): Date {
  const d = new Date(evt.year, evt.month - 1, evt.day);
  if (evt.year >= 0 && evt.year < 100) d.setFullYear(evt.year);
  return d;
}

export function HistoryExplorerView({
  headingRef,
  onInspectEventDate,
}: HistoryExplorerViewProps) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'Tümü' | HistoricalEventType>('Tümü');

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return HISTORICAL_EVENTS.filter((evt) => {
      if (selectedType !== 'Tümü' && evt.type !== selectedType) return false;
      if (!q) return true;
      return (
        evt.title.toLocaleLowerCase('tr-TR').includes(q) ||
        evt.type.toLocaleLowerCase('tr-TR').includes(q) ||
        evt.summary.toLocaleLowerCase('tr-TR').includes(q) ||
        String(evt.year).includes(q)
      );
    });
  }, [query, selectedType]);

  return (
    <section aria-labelledby="history-heading" className="mx-auto w-full max-w-4xl space-y-6">
      <div className="border-b border-hairline pb-5">
        <p className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
          KRONOLOJİK KAYIT DEFTERİ
        </p>
        <h2
          id="history-heading"
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl font-bold tracking-tight text-ink outline-none sm:text-4xl"
        >
          Tarih Kaşifi
        </h2>
        <p className="mt-1 max-w-[65ch] text-sm text-muted">
          İnsanlık tarihindeki dönüm noktalarının M.Ö. 3200 Yazının İcadı miladına göre Medeniyet Takvimi karşılıkları.
        </p>
      </div>

      {/* Arama ve Tür Filtresi */}
      <div className="space-y-3">
        <div>
          <label htmlFor="history-search-input" className="sr-only">
            Tarihi olay adı, yıl veya kategori ara
          </label>
          <div className="relative">
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            />
            <input
              id="history-search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Olay adı, yıl veya kategori ara (örn. Fetih, Rasathane, 1923)..."
              className="min-h-[46px] w-full rounded-xl border border-hairline bg-surface-raised py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-muted/75 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Olay türü filtresi">
          {EVENT_TYPES.map((type) => {
            const active = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedType(type)}
                className={`min-h-[36px] rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-hairline bg-surface text-muted hover:border-accent hover:text-ink'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Olay Listesi */}
      {filteredEvents.length === 0 ? (
        <div className="observatory-plate rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-ink">
            Arama ölçütünüze uygun tarihsel kayıt bulunamadı.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedType('Tümü');
            }}
            className="mt-3 min-h-[40px] rounded-lg border border-hairline bg-surface-raised px-4 py-2 text-xs font-semibold text-accent transition-colors hover:border-accent"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <ol className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface">
          {filteredEvents.map((evt) => {
            const eventDate = toEventLocalDate(evt);
            const civ = getCivilizationDate(eventDate);
            const hier = calculateHierarchy(civ.civYear);

            return (
              <li
                key={`${evt.year}-${evt.title}`}
                className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-surface-raised md:flex-row md:items-center"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-hairline bg-surface-raised px-2 py-0.5 font-mono text-[11px] font-medium text-accent">
                      {evt.type}
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink">
                      {evt.title}
                    </h3>
                  </div>
                  <p className="max-w-[60ch] text-xs leading-relaxed text-muted">
                    {evt.summary}
                  </p>
                  <p className="font-mono text-[11px] text-muted">
                    Gregoryen: {formatGregorianDate(evt.year, evt.month, evt.day)} ·{' '}
                    {hier.age} Çağı / {hier.generation} Nesli
                  </p>
                </div>

                <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-hairline pt-3 md:flex-col md:items-end md:border-t-0 md:pt-0">
                  <div className="md:text-right">
                    <div className="font-display text-2xl font-bold tabular-nums text-accent">
                      {civ.civYear} Yılı
                    </div>
                    <div className="font-mono text-xs text-ink">
                      {civ.civDay === 0
                        ? civ.specialDay
                        : `${civ.civDay} ${civ.monthName} · ${civ.weekday}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspectEventDate(eventDate)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-hairline bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    <span>Çeviricide Aç</span>
                    <ArrowRight size={13} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
