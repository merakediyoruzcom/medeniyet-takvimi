import { describe, expect, it } from 'vitest';
import {
  calculateHierarchy,
  civilizationToGregorian,
  getCivilizationDate,
  getMoonPhase,
  isLeapYear,
} from './calendar';
import { generateCivilizationICS } from './ics';
import type { NotesMap } from './storage';

describe('Medeniyet Takvimi — Takvim Motoru', () => {
  it('Kış Gündönümü (21 Aralık) yılbaşı sınırını doğru hesaplar', () => {
    const eve = getCivilizationDate(new Date(2025, 11, 20));
    expect(eve.civYear).toBe(5225);
    expect(eve.specialKind).toBe('world');
    expect(eve.specialDay).toBe('Dünya Günü');
    expect(eve.civDay).toBe(0);

    const solstice = getCivilizationDate(new Date(2025, 11, 21));
    expect(solstice.civYear).toBe(5226);
    expect(solstice.civMonthIndex).toBe(0);
    expect(solstice.monthName).toBe('Ocak');
    expect(solstice.civDay).toBe(1);
    expect(solstice.weekday).toBe('Pazartesi');
  });

  it('Artık yılda (5224 / 2023-2024) Ay Günü yerleşimini ve normal yılda reddini doğru yönetir', () => {
    // 2023-12-21 -> civYear 5224 (2024 artık yıl olduğu için isLeapYear(2023) true)
    expect(isLeapYear(2023)).toBe(true);
    expect(isLeapYear(2024)).toBe(false);

    const leapDay = civilizationToGregorian(5224, 6, 0, 'leap');
    expect(leapDay.ok).toBe(true);
    if (leapDay.ok) {
      const roundTrip = getCivilizationDate(
        new Date(leapDay.year, leapDay.month - 1, leapDay.day),
      );
      expect(roundTrip.civYear).toBe(5224);
      expect(roundTrip.specialKind).toBe('leap');
      expect(roundTrip.specialDay).toBe('Ay Günü (Artık Gün)');
    }

    // Ay Günü ertesi günü 1 Sol 5224 olmalı
    const solOne = civilizationToGregorian(5224, 6, 1, null);
    expect(solOne.ok).toBe(true);
    if (solOne.ok && leapDay.ok) {
      expect(solOne.date.getTime() - leapDay.date.getTime()).toBe(86_400_000);
      const back = getCivilizationDate(
        new Date(solOne.year, solOne.month - 1, solOne.day),
      );
      expect(back.monthName).toBe('Sol');
      expect(back.civDay).toBe(1);
      expect(back.weekday).toBe('Pazartesi');
    }

    // Artık olmayan 5225 yılında Ay Günü hata döndürmeli
    const invalidLeap = civilizationToGregorian(5225, 6, 0, 'leap');
    expect(invalidLeap.ok).toBe(false);
  });

  it('365 günlük normal yıl ve 366 günlük artık yılın tüm günlerinde gidiş-dönüş tutarlıdır', () => {
    const verifyFullCivYear = (startGregYear: number, expectedDays: number) => {
      const start = new Date(startGregYear, 11, 21);
      for (let i = 0; i < expectedDays; i++) {
        const greg = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const civ = getCivilizationDate(greg);
        const rev = civilizationToGregorian(
          civ.civYear,
          civ.civMonthIndex,
          civ.civDay,
          civ.specialKind,
        );
        expect(rev.ok).toBe(true);
        if (rev.ok) {
          expect(rev.year).toBe(greg.getFullYear());
          expect(rev.month).toBe(greg.getMonth() + 1);
          expect(rev.day).toBe(greg.getDate());
        }
      }
    };

    verifyFullCivYear(2023, 366); // Artık Medeniyet Yılı 5224
    verifyFullCivYear(2024, 365); // Normal Medeniyet Yılı 5225
  });

  it('solsticeYear alanını Aralık ayındaki yılbaşı günleri için doğru döndürür', () => {
    const res = civilizationToGregorian(5226, 0, 1, null);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.year).toBe(2025);
      expect(res.month).toBe(12);
      expect(res.day).toBe(21);
      expect(res.solsticeYear).toBe(2025);
    }
  });

  it('M.Ö. (-3200), iki haneli (50) ve tarihi yılları hatasız işler', () => {
    const bc = new Date(-3200, 0, 1);
    const civBc = getCivilizationDate(bc);
    expect(civBc.civYear).toBe(0);
    const hierBc = calculateHierarchy(civBc.civYear);
    expect(hierBc.cycle).toBeDefined();
    expect(hierBc.generation).toBeDefined();
    expect(hierBc.age).toBeDefined();

    const year50 = new Date(50, 5, 15);
    year50.setFullYear(50);
    const civ50 = getCivilizationDate(year50);
    expect(civ50.civYear).toBe(3250);

    const conquest = getCivilizationDate(new Date(1453, 4, 29));
    expect(conquest.civYear).toBe(4653);

    const republic = getCivilizationDate(new Date(1923, 9, 29));
    expect(republic.civYear).toBe(5123);
  });

  it('Zaman hiyerarşisi sınır geçişlerini (4, 28, 196, 1372 yıl) doğru hesaplar', () => {
    expect(calculateHierarchy(1)).toMatchObject({
      eon: 1,
      age: 'Uyanış',
      generation: 'Kök',
      yearInCycle: 1,
    });
    expect(calculateHierarchy(4)).toMatchObject({
      yearInCycle: 4,
      generation: 'Kök',
    });
    expect(calculateHierarchy(5).cycle.name).toBe('Turuncu Döngü');
    expect(calculateHierarchy(28)).toMatchObject({
      generation: 'Kök',
      yearInGeneration: 28,
    });
    expect(calculateHierarchy(29)).toMatchObject({
      generation: 'Filiz',
      yearInGeneration: 1,
    });
    expect(calculateHierarchy(196).age).toBe('Uyanış');
    expect(calculateHierarchy(197).age).toBe('Yükseliş');
    expect(calculateHierarchy(1372)).toMatchObject({
      eon: 1,
      age: 'Sonsuzluk',
    });
    expect(calculateHierarchy(1373)).toMatchObject({
      eon: 2,
      age: 'Uyanış',
    });
  });

  it('28 günlük ay evrelerini tutarlı döner', () => {
    expect(getMoonPhase(1)).toMatchObject({ name: 'Yeni Ay', fraction: 0 });
    expect(getMoonPhase(7)).toMatchObject({ name: 'İlk Dördün', fraction: 0.5 });
    expect(getMoonPhase(14)).toMatchObject({ name: 'Dolunay', fraction: 1 });
    expect(getMoonPhase(21)).toMatchObject({ name: 'Son Dördün', fraction: 0.5 });
  });

  it('RFC 5545 uyumlu .ics dosyası üretir ve kullanıcı notlarını ekler', () => {
    const notes: NotesMap = {
      '5226_6_14': {
        note: 'Yaz ortası gözlemi',
        habits: { water: true, read: true, meditate: false },
      },
    };
    const icsNormal = generateCivilizationICS(5226, notes);
    expect(icsNormal.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(icsNormal).toContain('END:VCALENDAR');
    expect(icsNormal).toContain('Sol Ayı Başlangıcı');
    expect(icsNormal).toContain('Dünya Günü — 5226');
    expect(icsNormal).not.toContain('Ay Günü (Artık Gün)');
    expect(icsNormal).toContain('SUMMARY:Not: 14 Sol 5226');
    expect(icsNormal).toContain('Yaz ortası gözlemi');

    const icsLeap = generateCivilizationICS(5224, {});
    expect(icsLeap).toContain('Ay Günü (Artık Gün) — 5224');
  });
});
