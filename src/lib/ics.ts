import { CIV_MONTHS, civilizationToGregorian, isLeapYear } from './calendar';
import type { NotesMap } from './storage';

function formatIcsDateUtc(date: Date): string {
  const y = String(date.getUTCFullYear()).padStart(4, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function addDaysUtc(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function makeEventBlock(params: {
  uid: string;
  start: Date;
  summary: string;
  description: string;
  dtstamp: string;
}): string {
  const dtStart = formatIcsDateUtc(params.start);
  const dtEnd = formatIcsDateUtc(addDaysUtc(params.start, 1));
  return [
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${params.dtstamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeIcsText(params.summary)}`,
    `DESCRIPTION:${escapeIcsText(params.description)}`,
    'END:VEVENT',
  ].join('\r\n');
}

/**
 * Seçili Medeniyet Yılı için astronomik dönüm noktalarını ve kullanıcının kayıtlı notlarını
 * RFC 5545 uyumlu .ics takvim dosyası olarak üretir.
 */
export function generateCivilizationICS(civYear: number, notes: NotesMap): string {
  const now = new Date();
  const dtstamp =
    now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const startYear = civYear - 3201;
  const leap = isLeapYear(startYear);
  const events: string[] = [];

  // 13 ayın açılış günleri
  CIV_MONTHS.forEach((monthName, monthIndex) => {
    const conv = civilizationToGregorian(civYear, monthIndex, 1);
    if (!conv.ok) return;
    const isNewYear = monthIndex === 0;
    const isSol = monthIndex === 6;
    const summary = isNewYear
      ? `Medeniyet Yılbaşı — 1 Ocak ${civYear}`
      : isSol
        ? `Sol Ayı Başlangıcı (13. Ay) — ${civYear}`
        : `${monthIndex + 1}. Ay: ${monthName} Başlangıcı (${civYear})`;
    const description = isNewYear
      ? 'Kış Gündönümü ile yeni Medeniyet Yılı başlar.'
      : isSol
        ? 'Yaz ortası 13. Sol ayının ilk günü (Pazartesi).'
        : `28 günlük ${monthName} ayı başlar (1 ${monthName} ${civYear}, Pazartesi).`;
    events.push(
      makeEventBlock({
        uid: `civ-${civYear}-month-${monthIndex}@medeniyettakvimi`,
        start: conv.date,
        summary,
        description,
        dtstamp,
      }),
    );
  });

  // Artık yılda Ay Günü
  if (leap) {
    const leapConv = civilizationToGregorian(civYear, 6, 0, 'leap');
    if (leapConv.ok) {
      events.push(
        makeEventBlock({
          uid: `civ-${civYear}-aygunu@medeniyettakvimi`,
          start: leapConv.date,
          summary: `Ay Günü (Artık Gün) — ${civYear}`,
          description: 'Haziran ile Sol ayı arasında yer alan zaman dışı artık gün.',
          dtstamp,
        }),
      );
    }
  }

  // Yıl sonu Dünya Günü
  const worldConv = civilizationToGregorian(civYear, 12, 0, 'world');
  if (worldConv.ok) {
    events.push(
      makeEventBlock({
        uid: `civ-${civYear}-dunyagunu@medeniyettakvimi`,
        start: worldConv.date,
        summary: `Dünya Günü — ${civYear}`,
        description: '364 günlük döngüyü tamamlayan zaman dışı evrensel yıl sonu günü.',
        dtstamp,
      }),
    );
  }

  // Kullanıcının seçili Medeniyet Yılındaki not ve alışkanlık kayıtları
  const prefix = `${civYear}_`;
  for (const [key, entry] of Object.entries(notes)) {
    if (!key.startsWith(prefix)) continue;
    const parts = key.split('_');
    const monthIndex = Number(parts[1]);
    const dayNum = Number(parts[2]);
    if (!Number.isInteger(monthIndex) || !Number.isInteger(dayNum) || dayNum < 1 || dayNum > 28) {
      continue;
    }
    const conv = civilizationToGregorian(civYear, monthIndex, dayNum);
    if (!conv.ok) continue;

    const habitsList: string[] = [];
    if (entry.habits.water) habitsList.push('Su ve Beden');
    if (entry.habits.read) habitsList.push('Okuma');
    if (entry.habits.meditate) habitsList.push('İçsel Denge');

    const monthName = CIV_MONTHS[monthIndex] ?? 'Ocak';
    const descLines: string[] = [];
    if (entry.note.trim()) descLines.push(entry.note.trim());
    if (habitsList.length > 0) descLines.push(`Alışkanlıklar: ${habitsList.join(', ')}`);

    events.push(
      makeEventBlock({
        uid: `civ-${key}@medeniyettakvimi`,
        start: conv.date,
        summary: `Not: ${dayNum} ${monthName} ${civYear}`,
        description: descLines.join('\n') || 'Medeniyet Takvimi kaydı',
        dtstamp,
      }),
    );
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Medeniyet Takvimi//Almanak v2.0//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
