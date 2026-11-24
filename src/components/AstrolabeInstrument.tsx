import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { AGES, CIV_MONTHS, CYCLES, GENERATIONS, type HierarchyInfo } from '../lib/calendar';

interface AstrolabeInstrumentProps {
  readonly civYear: number;
  readonly activeMonthIndex: number;
  readonly hierarchy: HierarchyInfo;
  readonly onShiftYear: (delta: number) => void;
  readonly onResetToday: () => void;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function AstrolabeInstrument({
  civYear,
  activeMonthIndex,
  hierarchy,
  onShiftYear,
  onResetToday,
}: AstrolabeInstrumentProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragAngleRef = useRef<number | null>(null);
  const accumDegRef = useRef<number>(0);

  const [isSpinning, setIsSpinning] = useState(false);
  const [orbitDeg, setOrbitDeg] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Respect prefers-reduced-motion when animating orbit
  useEffect(() => {
    if (!isSpinning) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setIsSpinning(false);
      return;
    }

    let rafId = 0;
    let lastTs = performance.now();
    let accum = 0;

    const tick = (now: number) => {
      const dt = Math.min(64, now - lastTs);
      lastTs = now;
      setOrbitDeg((prev) => (prev + dt * 0.03) % 360);
      accum += dt;
      if (accum >= 750) {
        accum = 0;
        onShiftYear(1);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSpinning, onShiftYear]);

  const computePointerAngle = (clientX: number, clientY: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

  const handlePointerDown = (e: PointerEvent<SVGSVGElement>) => {
    const angle = computePointerAngle(e.clientX, e.clientY);
    if (angle === null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragAngleRef.current = angle;
    accumDegRef.current = 0;
    setIsDragging(true);
    setIsSpinning(false);
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (dragAngleRef.current === null) return;
    const angle = computePointerAngle(e.clientX, e.clientY);
    if (angle === null) return;

    let delta = angle - dragAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    dragAngleRef.current = angle;

    setOrbitDeg((prev) => (prev + delta + 360) % 360);
    accumDegRef.current += delta;

    const stepThreshold = 15;
    if (Math.abs(accumDegRef.current) >= stepThreshold) {
      const yearSteps = Math.trunc(accumDegRef.current / stepThreshold);
      accumDegRef.current -= yearSteps * stepThreshold;
      onShiftYear(yearSteps);
    }
  };

  const handlePointerUp = (e: PointerEvent<SVGSVGElement>) => {
    if (dragAngleRef.current !== null) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      dragAngleRef.current = null;
      accumDegRef.current = 0;
      setIsDragging(false);
    }
  };

  const ageStepAngle = 360 / 7;
  const monthStepAngle = 360 / 13;

  // Compute deterministic ring orientations tied to current coordinates + drag/orbit offset
  const ageRingRotation = -hierarchy.ageIndex * ageStepAngle + orbitDeg * 0.25;
  const genRingRotation = -hierarchy.generationIndex * ageStepAngle + orbitDeg * 0.5;
  const cycleRingRotation = -hierarchy.cycleIndex * ageStepAngle + orbitDeg * 0.75;
  const monthRingRotation = -activeMonthIndex * monthStepAngle;

  return (
    <div className="observatory-plate-raised flex flex-col items-center rounded-2xl p-6">
      <div className="mb-3 flex w-full items-center justify-between border-b border-hairline pb-3">
        <div>
          <span className="block font-mono text-[10px] tracking-[0.08em] text-accent uppercase">
            USTURLAP ENSTRÜMANI
          </span>
          <p className="text-xs text-muted">
            Çarkı sürükleyerek veya aşağıdaki adımlarla yıllar arasında gezinin.
          </p>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted">
          {hierarchy.eon}. Eon
        </span>
      </div>

      <div className="relative flex w-full max-w-[440px] aspect-square items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 520 520"
          role="img"
          aria-label={`${civYear} yılı için etkileşimli Medeniyet Usturlabı`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
          className={`h-full w-full select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {/* Outer celestial degree scale */}
          <g>
            <circle
              cx="260"
              cy="260"
              r="242"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1.25"
            />
            <circle
              cx="260"
              cy="260"
              r="228"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
            {Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const major = i % 6 === 0;
              const p1 = polarToCartesian(260, 260, major ? 228 : 234, deg);
              const p2 = polarToCartesian(260, 260, 242, deg);
              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={major ? 'var(--accent)' : 'var(--muted)'}
                  strokeWidth={major ? '1.5' : '0.8'}
                  strokeOpacity={major ? '0.9' : '0.45'}
                />
              );
            })}
          </g>

          {/* Ring 1: 7 Ages (196 years each) */}
          <g transform={`rotate(${ageRingRotation} 260 260)`}>
            <circle
              cx="260"
              cy="260"
              r="204"
              fill="none"
              stroke="var(--surface)"
              strokeWidth="30"
            />
            <circle
              cx="260"
              cy="260"
              r="189"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
            {AGES.map((ageName, i) => {
              const angle = i * ageStepAngle;
              const pos = polarToCartesian(260, 260, 204, angle);
              const active = i === hierarchy.ageIndex;
              return (
                <g key={ageName}>
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${angle} ${pos.x} ${pos.y})`}
                    fill={active ? 'var(--accent)' : 'var(--muted)'}
                    fontSize="10"
                    fontWeight={active ? '700' : '500'}
                    fontFamily="var(--font-mono)"
                  >
                    {ageName.toLocaleUpperCase('tr-TR')}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Ring 2: 7 Generations (28 years each) */}
          <g transform={`rotate(${genRingRotation} 260 260)`}>
            <circle
              cx="260"
              cy="260"
              r="166"
              fill="none"
              stroke="var(--surface-raised)"
              strokeWidth="26"
            />
            <circle
              cx="260"
              cy="260"
              r="153"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
            {GENERATIONS.map((genName, i) => {
              const angle = i * ageStepAngle;
              const pos = polarToCartesian(260, 260, 166, angle);
              const active = i === hierarchy.generationIndex;
              return (
                <text
                  key={genName}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${angle} ${pos.x} ${pos.y})`}
                  fill={active ? 'var(--ink)' : 'var(--muted)'}
                  fontSize="10"
                  fontWeight={active ? '700' : '400'}
                  fontFamily="var(--font-sans)"
                >
                  {genName}
                </text>
              );
            })}
          </g>

          {/* Ring 3: 7 Mineral Cycle Arcs (4 years each) */}
          <g transform={`rotate(${cycleRingRotation} 260 260)`}>
            {CYCLES.map((cycle, i) => {
              const startA = i * ageStepAngle - ageStepAngle / 2 + 2;
              const endA = (i + 1) * ageStepAngle - ageStepAngle / 2 - 2;
              const active = i === hierarchy.cycleIndex;
              return (
                <path
                  key={cycle.id}
                  d={describeArc(260, 260, 134, startA, endA)}
                  fill="none"
                  stroke={cycle.colorVar}
                  strokeWidth={active ? '14' : '8'}
                  strokeOpacity={active ? '1' : '0.4'}
                  strokeLinecap="butt"
                />
              );
            })}
          </g>

          {/* Ring 4: 13 Months Ring */}
          <g transform={`rotate(${monthRingRotation} 260 260)`}>
            <circle
              cx="260"
              cy="260"
              r="104"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
            {CIV_MONTHS.map((m, i) => {
              const angle = i * monthStepAngle;
              const pos = polarToCartesian(260, 260, 104, angle);
              const active = i === activeMonthIndex;
              return (
                <g key={m}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={active ? 4.5 : 2}
                    fill={active ? 'var(--accent)' : 'var(--muted)'}
                    fillOpacity={active ? '1' : '0.45'}
                  />
                  {active && (
                    <text
                      x={polarToCartesian(260, 260, 86, angle).x}
                      y={polarToCartesian(260, 260, 86, angle).y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="var(--accent)"
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {m.slice(0, 3).toLocaleUpperCase('tr-TR')}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Stationary top alignment index marker */}
          <polygon points="260,26 254,14 266,14" fill="var(--accent)" />

          {/* Solar Core & Alidade */}
          <circle
            cx="260"
            cy="260"
            r="64"
            fill="var(--surface)"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          <circle
            cx="260"
            cy="260"
            r="56"
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
          />
          <line
            x1="260"
            y1="204"
            x2="260"
            y2="188"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        </svg>

        {/* Center Readout */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
            Medeniyet Yılı
          </span>
          <span className="font-display text-3xl font-bold tabular-nums text-accent">
            {civYear}
          </span>
          <span className="font-mono text-[10px] text-muted">
            {hierarchy.cycle.name.replace(' Döngü', '')} · {hierarchy.yearInCycle}/4
          </span>
        </div>
      </div>

      {/* Single-Pointer Accessible Controls */}
      <div className="mt-5 flex w-full flex-col gap-3 border-t border-hairline pt-4">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {[-196, -28, -4, -1].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onShiftYear(step)}
              className="min-h-[38px] min-w-[44px] rounded-lg border border-hairline bg-surface px-2.5 py-1.5 font-mono text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {step}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setIsSpinning(false);
              setOrbitDeg(0);
              onResetToday();
            }}
            aria-label="Bugüne sıfırla"
            className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-accent bg-surface px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-contrast"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Bugün</span>
          </button>
          {[1, 4, 28, 196].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onShiftYear(step)}
              className="min-h-[38px] min-w-[44px] rounded-lg border border-hairline bg-surface px-2.5 py-1.5 font-mono text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            >
              +{step}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsSpinning((s) => !s)}
          aria-pressed={isSpinning}
          className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-colors ${
            isSpinning
              ? 'border-accent bg-accent text-accent-contrast'
              : 'border-hairline bg-surface text-ink hover:border-accent'
          }`}
        >
          {isSpinning ? (
            <>
              <Pause size={15} aria-hidden="true" />
              <span>Yörünge Akışını Durdur</span>
            </>
          ) : (
            <>
              <Play size={15} aria-hidden="true" />
              <span>Zaman Çarkını Canlandır</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
