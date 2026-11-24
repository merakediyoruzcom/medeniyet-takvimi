import { Moon, Sun } from 'lucide-react';
import {
  AGES,
  CYCLES,
  GENERATIONS,
  type CivilizationDate,
  type HierarchyInfo,
} from '../lib/calendar';
import { AstrolabeInstrument } from './AstrolabeInstrument';

interface TimeWheelViewProps {
  readonly headingRef: React.RefObject<HTMLHeadingElement | null>;
  readonly civDate: CivilizationDate;
  readonly hierarchy: HierarchyInfo;
  readonly onShiftYear: (offset: number) => void;
  readonly onResetToday: () => void;
}

export function TimeWheelView({
  headingRef,
  civDate,
  hierarchy,
  onShiftYear,
  onResetToday,
}: TimeWheelViewProps) {
  return (
    <section aria-labelledby="timewheel-heading" className="w-full space-y-6">
      <div className="border-b border-hairline pb-5">
        <p className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
          DÖRT KATMANLI KOZMİK ÖLÇEK
        </p>
        <h2
          id="timewheel-heading"
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl font-bold tracking-tight text-ink outline-none sm:text-4xl"
        >
          Usturlap ve Zaman Çarkı
        </h2>
        <p className="mt-1 max-w-[65ch] text-sm text-muted">
          Döngü (4 yıl), Nesil (28 yıl), Çağ (196 yıl) ve Büyük Devir (1372 yıl) katmanlarının eşmerkezli astronomik konumu.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* SOL: Etkileşimli Usturlap Enstrümanı */}
        <div className="lg:col-span-6">
          <AstrolabeInstrument
            civYear={civDate.civYear}
            activeMonthIndex={civDate.civMonthIndex}
            hierarchy={hierarchy}
            onShiftYear={onShiftYear}
            onResetToday={onResetToday}
          />
        </div>

        {/* SAĞ: 4 Katmanlı Hiyerarşi Kütüğü */}
        <div className="space-y-4 lg:col-span-6">
          {/* Büyük Devir */}
          <div className="observatory-plate rounded-2xl p-5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-muted uppercase">
                Büyük Devir (1372 Yıl)
              </span>
              <span className="font-display text-2xl font-bold tabular-nums text-accent">
                {hierarchy.eon}. Eon
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Yedi çağın (7 × 196 yıl) tamamlanmasıyla oluşan en üst tarihsel dönem.
            </p>
          </div>

          {/* Çağ */}
          <div className="observatory-plate rounded-2xl p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-muted uppercase">
                Çağ (196 Yıl · 7 Nesil)
              </span>
              <span className="text-sm font-bold text-ink">
                {hierarchy.age} Çağı ({hierarchy.ageIndex + 1}/7)
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-label="Çağ içindeki yıl ilerlemesi"
              aria-valuenow={hierarchy.yearInAge}
              aria-valuemin={1}
              aria-valuemax={196}
            >
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${(hierarchy.yearInAge / 196) * 100}%` }}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap justify-between gap-1 font-mono text-[11px] text-muted">
              <span>{AGES.join(' · ')}</span>
              <span className="tabular-nums text-ink">{hierarchy.yearInAge} / 196. yıl</span>
            </div>
          </div>

          {/* Nesil */}
          <div className="observatory-plate rounded-2xl p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-muted uppercase">
                Nesil (28 Yıl · 7 Döngü)
              </span>
              <span className="text-sm font-bold text-ink">
                {hierarchy.generation} Nesli ({hierarchy.generationIndex + 1}/7)
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-label="Nesil içindeki yıl ilerlemesi"
              aria-valuenow={hierarchy.yearInGeneration}
              aria-valuemin={1}
              aria-valuemax={28}
            >
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${(hierarchy.yearInGeneration / 28) * 100}%` }}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap justify-between gap-1 font-mono text-[11px] text-muted">
              <span>{GENERATIONS.join(' → ')}</span>
              <span className="tabular-nums text-ink">
                {hierarchy.yearInGeneration} / 28. yıl
              </span>
            </div>
          </div>

          {/* Döngü */}
          <div className="observatory-plate rounded-2xl p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-muted uppercase">
                Döngü (4 Yıl)
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: hierarchy.cycle.colorVar }}
                />
                <span>{hierarchy.cycle.name}</span>
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {CYCLES.map((c, idx) => {
                const active = idx === hierarchy.cycleIndex;
                return (
                  <div key={c.id} className="text-center">
                    <div
                      className={`h-2.5 rounded-sm transition-opacity ${
                        active ? 'opacity-100 ring-1 ring-ink' : 'opacity-35'
                      }`}
                      style={{ backgroundColor: c.colorVar }}
                    />
                    <span
                      className={`mt-1 block truncate font-mono text-[10px] ${
                        active ? 'font-bold text-ink' : 'text-muted'
                      }`}
                    >
                      {c.name.replace(' Döngü', '')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-xs">
              <span className="text-muted">{hierarchy.cycle.desc}</span>
              <span className="font-mono font-semibold tabular-nums text-accent">
                {hierarchy.yearInCycle} / 4. yıl
              </span>
            </div>
          </div>

          {/* İki Temel Kural */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="observatory-plate rounded-xl p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Sun size={15} className="text-accent" aria-hidden="true" />
                <span>Gündönümü Başlangıcı</span>
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Yıl, kuzey yarımkürede günlerin yeniden uzamaya başladığı 21 Aralık Kış Gündönümünde başlar.
              </p>
            </div>
            <div className="observatory-plate rounded-xl p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Moon size={15} className="text-accent" aria-hidden="true" />
                <span>28 Günlük Sabit Ay</span>
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                On üç ayın her biri tam dört haftadır; ayın 1’i her zaman Pazartesi, 28’i Pazar günüdür.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
