import { useEffect, useRef, useState, type TouchEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Grid2x2,
  LayoutList,
  RotateCcw,
} from 'lucide-react';
import {
  CIV_MONTHS,
  getMoonPhase,
  isLeapYear,
  WEEKDAY_SHORT,
  type CivilizationDate,
} from '../lib/calendar';
import { isEntryEmpty, makeDayKey, type NotesMap } from '../lib/storage';
import type { DayDialogTarget } from './DayDialog';
import { MoonDisc } from './MoonDisc';

interface YearAlmanacViewProps {
  readonly headingRef: React.RefObject<HTMLHeadingElement | null>;
  readonly civDate: CivilizationDate;
  readonly notes: NotesMap;
  readonly onShiftYear: (offset: number) => void;
  readonly onResetToday: () => void;
  readonly onOpenDay: (target: DayDialogTarget) => void;
}

export function YearAlmanacView({
  headingRef,
  civDate,
  notes,
  onShiftYear,
  onResetToday,
  onOpenDay,
}: YearAlmanacViewProps) {
  const [viewMode, setViewMode] = useState<'month' | 'year'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'month' : 'year',
  );
  const [focusedMonthIndex, setFocusedMonthIndex] = useState<number>(
    civDate.civMonthIndex,
  );

  const touchOriginRef = useRef<{ x: number; y: number } | null>(null);
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    setFocusedMonthIndex(civDate.civMonthIndex);
  }, [civDate.civMonthIndex, civDate.civYear]);

  useEffect(() => {
    if (viewMode !== 'month') return;
    const pill = pillRefs.current[focusedMonthIndex];
    if (!pill) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pill.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [focusedMonthIndex, viewMode]);

  const leap = isLeapYear(civDate.solsticeYear);
  const yearPrefix = `${civDate.civYear}_`;
  const yearSavedCount = Object.entries(notes).filter(
    ([key, entry]) => key.startsWith(yearPrefix) && !isEntryEmpty(entry),
  ).length;

  const shiftMonth = (delta: number) => {
    const next = focusedMonthIndex + delta;
    if (next < 0) {
      onShiftYear(-1);
      setFocusedMonthIndex(12);
    } else if (next > 12) {
      onShiftYear(1);
      setFocusedMonthIndex(0);
    } else {
      setFocusedMonthIndex(next);
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchOriginRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchOriginRef.current;
    const touch = e.changedTouches[0];
    touchOriginRef.current = null;
    if (!start || !touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      shiftMonth(dx < 0 ? 1 : -1);
    }
  };

  const focusedMonthName = CIV_MONTHS[focusedMonthIndex] ?? 'Ocak';
  const focusedMonthPrefix = `${civDate.civYear}_${focusedMonthIndex}_`;
  const focusedMonthNotes = Array.from({ length: 28 }, (_, i) => i + 1)
    .map((dayNum) => {
      const key = `${focusedMonthPrefix}${dayNum}`;
      const entry = notes[key];
      if (!entry || isEntryEmpty(entry)) return null;
      return { dayNum, entry };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <section aria-labelledby="year-view-heading" className="w-full space-y-5">
      <div className="flex flex-col gap-4 border-b border-hairline pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onShiftYear(-1)}
              aria-label="Önceki Medeniyet yılı"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-surface text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <h2
              id="year-view-heading"
              ref={headingRef}
              tabIndex={-1}
              className="font-display px-2 text-3xl font-bold tabular-nums text-accent outline-none sm:text-4xl"
            >
              {civDate.civYear} Yılı
            </h2>
            <button
              type="button"
              onClick={() => onShiftYear(1)}
              aria-label="Sonraki Medeniyet yılı"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-surface text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={onResetToday}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Bugün</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-lg border border-hairline bg-surface px-2.5 py-1.5 font-mono">
              {leap ? '366 Gün (Artık)' : '365 Gün'}
            </span>
            <span className="rounded-lg border border-hairline bg-surface px-2.5 py-1.5 font-mono">
              {yearSavedCount} kayıt
            </span>
          </div>

          {/* Tek Ay / Tüm Yıl Görünüm Seçici */}
          <div
            role="group"
            aria-label="Almanak görünüm kipi"
            className="inline-flex rounded-xl border border-hairline bg-surface p-1"
          >
            <button
              type="button"
              aria-pressed={viewMode === 'month'}
              onClick={() => setViewMode('month')}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-accent text-accent-contrast'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <LayoutList size={14} aria-hidden="true" />
              <span>Tek Ay</span>
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'year'}
              onClick={() => setViewMode('year')}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'year'
                  ? 'bg-accent text-accent-contrast'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Grid2x2 size={14} aria-hidden="true" />
              <span>13 Ay</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="mx-auto max-w-xl space-y-5">
          {/* Yatay Kaydırılabilir 13 Ay Seçici Şerit */}
          <div
            role="tablist"
            aria-label="13 Ay Seçici"
            className="no-scrollbar flex snap-x snap-proximity gap-1.5 overflow-x-auto pb-1"
          >
            {CIV_MONTHS.map((m, idx) => {
              const active = idx === focusedMonthIndex;
              return (
                <button
                  key={m}
                  ref={(el) => {
                    pillRefs.current[idx] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFocusedMonthIndex(idx)}
                  className={`min-h-[42px] shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-accent bg-accent text-accent-contrast font-semibold'
                      : 'border-hairline bg-surface text-muted hover:border-accent hover:text-ink'
                  }`}
                >
                  <span className="font-mono mr-1 opacity-75">{idx + 1}.</span>
                  {m}
                </button>
              );
            })}
          </div>

          {/* Tek Ay Dokunmatik Kaydırmalı Izgara */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="observatory-plate-raised rounded-2xl p-4 sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between border-b border-hairline pb-3">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Önceki ay"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-surface text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>

              <div className="text-center">
                <span className="block font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
                  {focusedMonthIndex + 1} / 13. AY · KAYDIRARAK GEZİNİN
                </span>
                <h3 className="font-display text-2xl font-bold text-ink">
                  {focusedMonthName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Sonraki ay"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-hairline bg-surface text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>

            <div
              aria-hidden="true"
              className="mb-2 grid grid-cols-7 gap-1.5 text-center font-mono text-[11px] font-semibold text-muted"
            >
              {WEEKDAY_SHORT.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 28 }).map((_, dayIdx) => {
                const dayNum = dayIdx + 1;
                const isSelected =
                  civDate.civDay !== 0 &&
                  focusedMonthIndex === civDate.civMonthIndex &&
                  dayNum === civDate.civDay;
                const key = makeDayKey(civDate.civYear, focusedMonthIndex, dayNum);
                const entry = notes[key];
                const hasData = entry ? !isEntryEmpty(entry) : false;
                const moon = getMoonPhase(dayNum);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() =>
                      onOpenDay({
                        civYear: civDate.civYear,
                        monthIndex: focusedMonthIndex,
                        dayNum,
                      })
                    }
                    aria-label={`${dayNum} ${focusedMonthName} ${civDate.civYear}, ${moon.name}${hasData ? ', kayıtlı not var' : ''}`}
                    aria-current={isSelected ? 'date' : undefined}
                    className={`relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl font-mono text-sm tabular-nums transition-colors ${
                      isSelected
                        ? 'bg-accent font-bold text-accent-contrast'
                        : 'border border-hairline bg-surface text-ink hover:border-accent hover:text-accent'
                    }`}
                  >
                    <span>{dayNum}</span>
                    <MoonDisc
                      phase={moon}
                      size={11}
                      className={
                        isSelected
                          ? 'text-accent-contrast'
                          : dayNum === 1 || dayNum === 14
                            ? 'text-accent'
                            : 'text-muted opacity-55'
                      }
                    />
                    {hasData && (
                      <span
                        aria-hidden="true"
                        className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full ${
                          isSelected ? 'bg-accent-contrast' : 'bg-success'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {focusedMonthIndex === 5 && leap && (
              <div
                className={`mt-4 rounded-xl border px-3 py-2.5 text-center font-mono text-xs font-medium ${
                  civDate.specialKind === 'leap'
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-hairline bg-surface text-accent'
                }`}
              >
                + Ay Günü (Artık Gün · Haziran sonrası zaman dışı)
              </div>
            )}

            {focusedMonthIndex === 12 && (
              <div
                className={`mt-4 flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-center font-mono text-xs font-medium ${
                  civDate.specialKind === 'world'
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-hairline bg-surface text-accent'
                }`}
              >
                <Compass size={15} aria-hidden="true" />
                <span>+ Dünya Günü (365. Gün · Yılın Kapanışı ∞)</span>
              </div>
            )}
          </div>

          {/* Bu Aya Ait Kayıtlı Notlar Özeti */}
          <div className="observatory-plate rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-mono text-xs font-semibold text-muted uppercase">
                {focusedMonthName} Ayı Kayıtları ({focusedMonthNotes.length})
              </h4>
              <span className="text-[11px] text-muted">Düzenlemek için güne dokunun</span>
            </div>

            {focusedMonthNotes.length === 0 ? (
              <p className="py-2 text-xs text-muted">
                Bu ay için henüz not veya alışkanlık kaydı bulunmuyor. Yukarıdan bir gün seçip ekleyebilirsiniz.
              </p>
            ) : (
              <ul className="divide-y divide-hairline">
                {focusedMonthNotes.map(({ dayNum, entry }) => {
                  const activeHabits = [
                    entry.habits.water ? 'Su' : null,
                    entry.habits.read ? 'Okuma' : null,
                    entry.habits.meditate ? 'Denge' : null,
                  ].filter(Boolean);

                  return (
                    <li key={dayNum}>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenDay({
                            civYear: civDate.civYear,
                            monthIndex: focusedMonthIndex,
                            dayNum,
                          })
                        }
                        className="flex min-h-[44px] w-full items-start justify-between gap-3 py-2.5 text-left transition-colors hover:text-accent"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs font-semibold text-ink">
                            {dayNum} {focusedMonthName}
                          </span>
                          {entry.note.trim() && (
                            <p className="mt-0.5 truncate text-xs text-muted">
                              {entry.note.trim()}
                            </p>
                          )}
                        </div>
                        {activeHabits.length > 0 && (
                          <span className="shrink-0 rounded-md border border-hairline bg-surface-raised px-2 py-0.5 font-mono text-[10px] text-success">
                            {activeHabits.join(' · ')}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : (
        /* 13 AY + DÜNYA GÜNÜ TAM YIL IZGARASI */
        <div className="space-y-4">
          <p className="text-xs text-muted">
            Herhangi bir güne tıklayarak Ay evresi aydınlanmasını inceleyebilir, günlük alışkanlıklarınızı işaretleyip not bırakabilirsiniz.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CIV_MONTHS.map((month, monthIdx) => {
              const isCurrentMonth =
                civDate.civDay !== 0 && monthIdx === civDate.civMonthIndex;
              const monthPrefix = `${civDate.civYear}_${monthIdx}_`;
              const monthSaved = Object.entries(notes).filter(
                ([key, entry]) => key.startsWith(monthPrefix) && !isEntryEmpty(entry),
              ).length;

              return (
                <div
                  key={month}
                  className={`month-card-container rounded-2xl border p-4 transition-colors ${
                    isCurrentMonth
                      ? 'border-accent bg-surface-raised'
                      : 'border-hairline bg-surface'
                  }`}
                >
                  <div className="mb-3 flex items-baseline justify-between border-b border-hairline pb-2">
                    <h3 className="font-display text-lg font-bold text-ink">
                      <span className="font-mono mr-1.5 text-xs font-normal text-muted tabular-nums">
                        {String(monthIdx + 1).padStart(2, '0')}
                      </span>
                      {month}
                    </h3>
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        monthSaved > 0 ? 'font-semibold text-success' : 'text-muted'
                      }`}
                    >
                      {monthSaved > 0 ? `${monthSaved}/28 kayıt` : '28 gün'}
                    </span>
                  </div>

                  <div
                    aria-hidden="true"
                    className="mb-1.5 grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-semibold text-muted"
                  >
                    {WEEKDAY_SHORT.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 28 }).map((_, dayIdx) => {
                      const dayNum = dayIdx + 1;
                      const isSelected = isCurrentMonth && dayNum === civDate.civDay;
                      const key = makeDayKey(civDate.civYear, monthIdx, dayNum);
                      const entry = notes[key];
                      const hasData = entry ? !isEntryEmpty(entry) : false;
                      const moon = getMoonPhase(dayNum);

                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() =>
                            onOpenDay({
                              civYear: civDate.civYear,
                              monthIndex: monthIdx,
                              dayNum,
                            })
                          }
                          aria-label={`${dayNum} ${month} ${civDate.civYear}, ${moon.name}${hasData ? ', kayıtlı not var' : ''}`}
                          aria-current={isSelected ? 'date' : undefined}
                          className={`relative flex min-h-[34px] flex-col items-center justify-center rounded-lg font-mono text-xs tabular-nums transition-colors ${
                            isSelected
                              ? 'bg-accent font-bold text-accent-contrast'
                              : 'border border-transparent bg-surface-raised text-ink hover:border-accent hover:text-accent'
                          }`}
                        >
                          <span>{dayNum}</span>
                          {(dayNum === 1 || dayNum === 14) && (
                            <MoonDisc
                              phase={moon}
                              size={9}
                              className={isSelected ? 'text-accent-contrast' : 'text-accent'}
                            />
                          )}
                          {hasData && (
                            <span
                              aria-hidden="true"
                              className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${
                                isSelected ? 'bg-accent-contrast' : 'bg-success'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {monthIdx === 5 && leap && (
                    <div
                      className={`mt-3 rounded-lg border px-3 py-2 text-center font-mono text-xs font-medium ${
                        civDate.specialKind === 'leap'
                          ? 'border-accent bg-accent text-accent-contrast'
                          : 'border-hairline bg-surface-raised text-accent'
                      }`}
                    >
                      + Ay Günü (Artık Gün · Zaman Dışı)
                    </div>
                  )}
                </div>
              );
            })}

            {/* Dünya Günü Levhası */}
            <div
              className={`flex flex-col items-center justify-center rounded-2xl border p-6 text-center ${
                civDate.specialKind === 'world'
                  ? 'border-accent bg-surface-raised'
                  : 'border-hairline bg-surface'
              }`}
            >
              <Compass size={28} className="text-accent" aria-hidden="true" />
              <h3 className="font-display mt-3 text-2xl font-bold text-ink">
                Dünya Günü
              </h3>
              <p className="mt-1 text-xs text-muted">
                365. Gün · Yılın Kapanışı
              </p>
              <div
                className={`mt-4 flex h-12 w-12 items-center justify-center rounded-full border font-display text-2xl font-bold ${
                  civDate.specialKind === 'world'
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-hairline bg-surface-raised text-accent'
                }`}
              >
                ∞
              </div>
              <p className="mt-3 font-mono text-[11px] text-muted">
                Haftadan Bağımsız Evrensel Gün
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
