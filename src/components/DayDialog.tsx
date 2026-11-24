import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, Droplets, Wind, X } from 'lucide-react';
import {
  CIV_MONTHS,
  civilizationToGregorian,
  getMoonPhase,
  WEEKDAYS,
} from '../lib/calendar';
import { makeDayKey, type DayEntry, type DayHabits } from '../lib/storage';
import { MoonDisc } from './MoonDisc';

export interface DayDialogTarget {
  readonly civYear: number;
  readonly monthIndex: number;
  readonly dayNum: number;
}

interface DayDialogProps {
  readonly target: DayDialogTarget | null;
  readonly existingEntry?: DayEntry;
  readonly onSave: (key: string, entry: DayEntry) => void;
  readonly onClose: () => void;
}

export function DayDialog({
  target,
  existingEntry,
  onSave,
  onClose,
}: DayDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState('');
  const [habits, setHabits] = useState<DayHabits>({
    water: false,
    read: false,
    meditate: false,
  });

  useEffect(() => {
    if (target) {
      setNote(existingEntry?.note ?? '');
      setHabits(
        existingEntry?.habits ?? {
          water: false,
          read: false,
          meditate: false,
        },
      );
    }
  }, [target, existingEntry]);

  // Top-layer native modal lifecycle + closedby fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.setAttribute('closedby', 'any');

    if (target && !dialog.open) {
      dialog.showModal();
    } else if (!target && dialog.open) {
      dialog.close();
    }
  }, [target]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const outside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };

    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = outside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && outside(e) && dialog.open) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const handleDialogClose = () => {
    const dialog = dialogRef.current;
    if (dialog) dialog.returnValue = '';
    onClose();
  };

  const monthName = target ? (CIV_MONTHS[target.monthIndex] ?? 'Ocak') : '';
  const weekday = target ? (WEEKDAYS[(target.dayNum - 1) % 7] ?? 'Pazartesi') : '';
  const moon = target ? getMoonPhase(target.dayNum) : getMoonPhase(1);
  const greg = target
    ? civilizationToGregorian(target.civYear, target.monthIndex, target.dayNum)
    : null;

  const handleSave = () => {
    if (!target) return;
    const key = makeDayKey(target.civYear, target.monthIndex, target.dayNum);
    onSave(key, { note, habits });
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      aria-labelledby="day-dialog-title"
      className="observatory-dialog shadow-2xl"
    >
      {target && (
        <div className="p-6 pt-3 sm:pt-6">
          <div
            aria-hidden="true"
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-hairline sm:hidden"
          />
          <div className="mb-4 flex items-start justify-between border-b border-hairline pb-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
                GÜN KAYDI VE NOTLAR
              </p>
              <h2
                id="day-dialog-title"
                className="font-display text-2xl font-bold text-ink mt-0.5"
              >
                {target.dayNum} {monthName} {target.civYear}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {weekday}
                {greg && greg.ok
                  ? ` · Gregoryen: ${greg.day} ${greg.monthName} ${greg.year} (${greg.gregWeekday})`
                  : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Gün penceresini kapat"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Ay Evresi */}
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-hairline bg-surface p-3.5">
            <MoonDisc phase={moon} size={28} />
            <div>
              <span className="block font-mono text-[10px] tracking-[0.06em] text-muted uppercase">
                Ay Evresi
              </span>
              <span className="text-sm font-medium text-ink">
                {moon.name} · Aydınlanma {moon.illumination}
              </span>
            </div>
          </div>

          {/* 28 Günlük Alışkanlıklar */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium text-muted">
              Günlük Disiplinler (28 Günlük Döngü)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'water', label: 'Su ve Beden', icon: Droplets },
                  { id: 'read', label: 'Okuma', icon: BookOpen },
                  { id: 'meditate', label: 'İçsel Denge', icon: Wind },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const active = habits[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setHabits((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'border-accent bg-accent text-accent-contrast'
                        : 'border-hairline bg-surface text-ink hover:border-accent'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Icon size={14} aria-hidden="true" />
                      {active && <Check size={13} aria-hidden="true" />}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kişisel Not */}
          <div className="mb-5">
            <label
              htmlFor="day-note-input"
              className="mb-1.5 block text-xs font-medium text-muted"
            >
              Bu Güne Ait Not veya Gözlem
            </label>
            <textarea
              id="day-note-input"
              rows={3}
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Günün hedefleri, astronomik gözlem veya hatırlatıcı..."
              className="w-full resize-y rounded-xl border border-hairline bg-surface p-3 text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              className="min-h-[44px] flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="min-h-[44px] rounded-xl border border-hairline bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
