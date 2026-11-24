import { useEffect, useState } from 'react';
import { ArrowLeftRight, ArrowUpRight, Compass, RotateCcw } from 'lucide-react';
import {
  CIV_MONTHS,
  civilizationToGregorian,
  getDayReflection,
  parseDateInputValue,
  toDateInputValue,
  type CivilizationDate,
  type HierarchyInfo,
} from '../lib/calendar';
import { MoonDisc } from './MoonDisc';

interface ConverterViewProps {
  readonly headingRef: React.RefObject<HTMLHeadingElement | null>;
  readonly selectedDate: Date;
  readonly civDate: CivilizationDate;
  readonly hierarchy: HierarchyInfo;
  readonly onSelectDate: (date: Date) => void;
  readonly onResetToday: () => void;
  readonly onNavigateYearView: () => void;
}

export function ConverterView({
  headingRef,
  selectedDate,
  civDate,
  hierarchy,
  onSelectDate,
  onResetToday,
  onNavigateYearView,
}: ConverterViewProps) {
  const [showReflection, setShowReflection] = useState(false);

  // Tersine çevirici yerel durumu (ilk yüklemede aktif Medeniyet tarihine eşitlenir)
  const [revYear, setRevYear] = useState<string>(String(civDate.civYear));
  const [revMonthIndex, setRevMonthIndex] = useState<number>(civDate.civMonthIndex);
  const [revDay, setRevDay] = useState<number>(civDate.civDay === 0 ? 1 : civDate.civDay);
  const [revSpecial, setRevSpecial] = useState<'none' | 'world' | 'leap'>(
    civDate.specialKind ?? 'none',
  );

  useEffect(() => {
    setShowReflection(false);
  }, [selectedDate]);

  const parsedYear = Number(revYear);
  const revResult = civilizationToGregorian(
    Number.isFinite(parsedYear) && revYear.trim() !== '' ? parsedYear : NaN,
    revMonthIndex,
    revDay,
    revSpecial === 'none' ? null : revSpecial,
  );

  const reflection = getDayReflection(civDate, hierarchy);
  const inputVal = toDateInputValue(selectedDate);

  const handleGregorianChange = (raw: string) => {
    const parsed = parseDateInputValue(raw);
    if (parsed) onSelectDate(parsed);
  };

  const applyReverseToMain = () => {
    if (!revResult.ok) return;
    const localDate = new Date(revResult.year, revResult.month - 1, revResult.day);
    if (revResult.year >= 0 && revResult.year < 100) {
      localDate.setFullYear(revResult.year);
    }
    onSelectDate(localDate);
  };

  return (
    <section aria-labelledby="converter-heading" className="w-full space-y-6">
      <div className="flex flex-col gap-2 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
            ASTRONOMİK DÖNÜŞÜM MASASI
          </p>
          <h2
            id="converter-heading"
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-3xl font-bold tracking-tight text-ink outline-none sm:text-4xl"
          >
            Çift Yönlü Takvim Çevirici
          </h2>
        </div>
        <button
          type="button"
          onClick={onNavigateYearView}
          className="inline-flex min-h-[40px] items-center gap-1.5 self-start rounded-lg border border-hairline bg-surface px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent sm:self-auto"
        >
          <span>{civDate.civYear} Yılını Aç</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SOL SÜTUN (7/12): Gregoryen -> Medeniyet Ana Gösterge Plakası */}
        <div className="observatory-plate-raised rounded-2xl p-6 sm:p-8 lg:col-span-7">
          <div className="mb-6 flex flex-col gap-3 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <label
                htmlFor="gregorian-date-input"
                className="mb-1.5 block font-mono text-[11px] tracking-[0.06em] text-muted uppercase"
              >
                Gregoryen Tarih Seçimi
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="gregorian-date-input"
                  type="date"
                  value={inputVal}
                  onChange={(e) => handleGregorianChange(e.target.value)}
                  className="min-h-[44px] rounded-xl border border-hairline bg-surface px-3.5 py-2 font-mono text-sm tabular-nums text-ink focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onResetToday}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  <span>Bugüne Dön</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface px-3 py-2">
              <MoonDisc phase={civDate.moonPhase} size={20} />
              <div className="text-xs">
                <span className="block font-medium text-ink">{civDate.moonPhase.name}</span>
                <span className="font-mono text-[11px] text-muted">
                  Aydınlık {civDate.moonPhase.illumination}
                </span>
              </div>
            </div>
          </div>

          {/* Anıtsal Tarih Gösterimi */}
          <div className="py-4">
            {civDate.specialDay && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent bg-surface px-3.5 py-1 font-mono text-xs font-semibold text-accent">
                <Compass size={13} aria-hidden="true" />
                <span>{civDate.specialDay}</span>
              </div>
            )}

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-display text-7xl font-bold leading-none tracking-tight tabular-nums text-ink sm:text-8xl">
                {civDate.civDay === 0 ? '∞' : civDate.civDay}
              </span>
              <div className="flex flex-col">
                <span className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                  {civDate.monthName}
                </span>
                <span className="text-sm font-medium text-muted">
                  {civDate.weekday} · {civDate.isLeapCivYear ? 'Artık Medeniyet Yılı (366 Gün)' : 'Standart Medeniyet Yılı (365 Gün)'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold tabular-nums text-accent sm:text-5xl">
                {civDate.civYear}
              </span>
              <span className="font-mono text-xs tracking-[0.06em] text-muted uppercase">
                Medeniyet Yılı (Milat M.Ö. 3200)
              </span>
            </div>
          </div>

          {/* 4-Sütunlu Kozmik Koordinat Şeridi */}
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-4">
            <div className="bg-surface p-3.5">
              <dt className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
                Döngü (4 Yıl)
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: hierarchy.cycle.colorVar }}
                />
                <span>{hierarchy.cycle.name}</span>
              </dd>
            </div>
            <div className="bg-surface p-3.5">
              <dt className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
                Nesil (28 Yıl)
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {hierarchy.generation} Nesli
              </dd>
            </div>
            <div className="bg-surface p-3.5">
              <dt className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
                Çağ (196 Yıl)
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {hierarchy.age} Çağı
              </dd>
            </div>
            <div className="bg-surface p-3.5">
              <dt className="font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
                Büyük Devir
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-ink">
                {hierarchy.eon}. Eon
              </dd>
            </div>
          </dl>

          {/* Günün Gözlemi (Anlık deterministik yorum) */}
          <div className="mt-6 border-t border-hairline pt-5">
            <button
              type="button"
              aria-expanded={showReflection}
              onClick={() => setShowReflection((v) => !v)}
              className="inline-flex min-h-[44px] w-full items-center justify-between rounded-xl border border-hairline bg-surface px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              <span>Günün Astronomik Gözlemi</span>
              <span className="font-mono text-xs text-accent">
                {showReflection ? 'Gizle' : 'Oku'}
              </span>
            </button>

            {showReflection && (
              <p className="mt-3 max-w-[65ch] border-l-2 border-accent pl-4 text-sm leading-relaxed text-ink">
                {reflection}
              </p>
            )}
          </div>
        </div>

        {/* SAĞ SÜTUN (5/12): Tersine Çevirici (Medeniyet -> Gregoryen) */}
        <div className="observatory-plate rounded-2xl p-6 lg:col-span-5">
          <div className="mb-5 flex items-center gap-2 border-b border-hairline pb-4">
            <ArrowLeftRight size={18} className="text-accent" aria-hidden="true" />
            <div>
              <h3 className="font-display text-xl font-bold text-ink">
                Tersine Çevirici
              </h3>
              <p className="text-xs text-muted">Medeniyet Tarihinden Gregoryen Takvime</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="rev-year-input"
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Medeniyet Yılı
              </label>
              <input
                id="rev-year-input"
                type="number"
                inputMode="numeric"
                value={revYear}
                onChange={(e) => setRevYear(e.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-hairline bg-surface-raised px-3.5 py-2 font-mono text-sm tabular-nums text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="rev-month-select"
                  className="mb-1.5 block text-xs font-medium text-muted"
                >
                  Ay (13 Sabit Ay)
                </label>
                <select
                  id="rev-month-select"
                  value={revMonthIndex}
                  disabled={revSpecial !== 'none'}
                  onChange={(e) => setRevMonthIndex(Number(e.target.value))}
                  className="min-h-[44px] w-full rounded-xl border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-45"
                >
                  {CIV_MONTHS.map((m, i) => (
                    <option key={m} value={i}>
                      {i + 1}. {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="rev-day-input"
                  className="mb-1.5 block text-xs font-medium text-muted"
                >
                  Gün (1–28)
                </label>
                <input
                  id="rev-day-input"
                  type="number"
                  min={1}
                  max={28}
                  inputMode="numeric"
                  value={revDay}
                  disabled={revSpecial !== 'none'}
                  onChange={(e) =>
                    setRevDay(Math.min(28, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="min-h-[44px] w-full rounded-xl border border-hairline bg-surface-raised px-3.5 py-2 font-mono text-sm tabular-nums text-ink focus:border-accent focus:outline-none disabled:opacity-45"
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-xs font-medium text-muted">
                Gün Türü
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'none', label: 'Standart' },
                    { id: 'world', label: 'Dünya Günü' },
                    { id: 'leap', label: 'Ay Günü' },
                  ] as const
                ).map((item) => {
                  const active = revSpecial === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setRevSpecial(item.id)}
                      className={`min-h-[40px] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-accent bg-accent text-accent-contrast'
                          : 'border-hairline bg-surface-raised text-ink hover:border-accent'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Tersine Çevirici Sonuç Plakası */}
          <div className="mt-6 rounded-xl border border-hairline bg-surface-raised p-5">
            <span className="block font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
              GREGORYEN KARŞILIĞI
            </span>
            {!revResult.ok ? (
              <p role="alert" className="mt-2 text-sm font-medium text-danger">
                {revResult.error}
              </p>
            ) : (
              <div>
                <p className="mt-1 font-display text-3xl font-bold tabular-nums text-accent">
                  {revResult.day} {revResult.monthName}{' '}
                  {revResult.year < 0 ? `M.Ö. ${Math.abs(revResult.year)}` : revResult.year}
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {revResult.gregWeekday}
                </p>
                <p className="mt-2 font-mono text-[11px] text-muted">
                  Baz Gündönümü: 21 Aralık{' '}
                  {revResult.solsticeYear < 0
                    ? `M.Ö. ${Math.abs(revResult.solsticeYear)}`
                    : revResult.solsticeYear}
                </p>

                <button
                  type="button"
                  onClick={applyReverseToMain}
                  className="mt-4 min-h-[42px] w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  Bu Tarihi Ana Göstergeye Aktar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
