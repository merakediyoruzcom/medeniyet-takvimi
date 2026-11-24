import type { MoonPhaseInfo } from '../lib/calendar';

interface MoonDiscProps {
  readonly phase: MoonPhaseInfo;
  readonly size?: number;
  readonly decorative?: boolean;
  readonly className?: string;
}

export function MoonDisc({
  phase,
  size = 20,
  decorative = true,
  className = '',
}: MoonDiscProps) {
  const r = 9.5;
  const cx = 12;
  const cy = 12;
  const { fraction, waxing } = phase;

  let litPath = '';
  if (fraction > 0.02 && fraction < 0.98) {
    const outerSweep = waxing ? 1 : 0;
    const innerSweep = (waxing ? fraction > 0.5 : fraction <= 0.5) ? 1 : 0;
    const rx = Math.max(0.05, Math.abs(1 - 2 * fraction) * r);
    const yTop = cy - r;
    const yBottom = cy + r;
    litPath = `M ${cx} ${yTop} A ${r} ${r} 0 0 ${outerSweep} ${cx} ${yBottom} A ${rx} ${r} 0 0 ${innerSweep} ${cx} ${yTop} Z`;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `${phase.name} (${phase.illumination})`}
      className={`shrink-0 text-accent ${className}`}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeOpacity="0.55"
      />
      {fraction >= 0.98 && <circle cx={cx} cy={cy} r={r - 0.4} fill="currentColor" />}
      {litPath && <path d={litPath} fill="currentColor" />}
    </svg>
  );
}
