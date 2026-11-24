export interface CycleInfo {
  readonly id: string;
  readonly name: string;
  readonly colorVar: string;
  readonly hex: string;
  readonly desc: string;
}

export interface MoonPhaseInfo {
  readonly day: number;
  readonly name: string;
  readonly illumination: string;
  readonly fraction: number;
  readonly waxing: boolean;
}

export interface CivilizationDate {
  readonly civYear: number;
  readonly solsticeYear: number;
  readonly civMonthIndex: number;
  readonly civDay: number;
  readonly specialDay: string | null;
  readonly specialKind: 'leap' | 'world' | null;
  readonly weekday: string;
  readonly monthName: string;
  readonly moonPhase: MoonPhaseInfo;
  readonly isLeapCivYear: boolean;
}

export type ReverseConversionResult =
  | {
      readonly ok: true;
      readonly date: Date;
      readonly day: number;
      readonly month: number;
      readonly monthName: string;
      readonly year: number;
      readonly solsticeYear: number;
      readonly weekday: string;
      readonly gregWeekday: string;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export interface HierarchyInfo {
  readonly cycle: CycleInfo;
  readonly cycleIndex: number;
  readonly generation: string;
  readonly generationIndex: number;
  readonly age: string;
  readonly ageIndex: number;
  readonly eon: number;
  readonly yearInCycle: number;
  readonly yearInGeneration: number;
  readonly yearInAge: number;
}

export type HistoricalEventType =
  | 'Başlangıç'
  | 'Bilim'
  | 'Fetih'
  | 'Devrim'
  | 'Kuruluş'
  | 'Zafer'
  | 'Miras';

export interface HistoricalEvent {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly title: string;
  readonly type: HistoricalEventType;
  readonly summary: string;
}

export const GREGORIAN_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

export const CIV_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Sol',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

export const WEEKDAYS = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
] as const;

export const WEEKDAY_SHORT = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'] as const;

export const GREG_WEEKDAYS = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
] as const;

export const CYCLES: readonly CycleInfo[] = [
  { id: 'red', name: 'Kızıl Döngü', colorVar: 'var(--cycle-red)', hex: '#C94A4A', desc: 'Başlangıç ve ateş enerjisi.' },
  { id: 'orange', name: 'Turuncu Döngü', colorVar: 'var(--cycle-orange)', hex: '#D47A3A', desc: 'Yaratıcılık ve hareket.' },
  { id: 'yellow', name: 'Sarı Döngü', colorVar: 'var(--cycle-yellow)', hex: '#C9A236', desc: 'İrade ve güç.' },
  { id: 'green', name: 'Yeşil Döngü', colorVar: 'var(--cycle-green)', hex: '#3E8E63', desc: 'Büyüme ve şifa.' },
  { id: 'blue', name: 'Mavi Döngü', colorVar: 'var(--cycle-blue)', hex: '#3B7AA8', desc: 'İletişim ve akış.' },
  { id: 'indigo', name: 'Çivit Döngü', colorVar: 'var(--cycle-indigo)', hex: '#4E5DA8', desc: 'Sezgi ve derinlik.' },
  { id: 'purple', name: 'Mor Döngü', colorVar: 'var(--cycle-purple)', hex: '#7F5AA6', desc: 'Bilgelik ve ruh.' },
] as const;

export const GENERATIONS = ['Kök', 'Filiz', 'Gövde', 'Dal', 'Yaprak', 'Çiçek', 'Tohum'] as const;
export const AGES = ['Uyanış', 'Yükseliş', 'Denge', 'Altın', 'Bilgelik', 'Ahenk', 'Sonsuzluk'] as const;

export const HISTORICAL_EVENTS: readonly HistoricalEvent[] = [
  {
    year: -3200,
    month: 1,
    day: 1,
    title: 'Yazının İcadı (Milat)',
    type: 'Başlangıç',
    summary: 'Çivi yazısının doğuşuyla tarih öncesi kapanıp yazılı medeniyet çağı başladı.',
  },
  {
    year: 1071,
    month: 8,
    day: 26,
    title: 'Malazgirt Zaferi',
    type: 'Zafer',
    summary: 'Anadolu coğrafyasında yeni bir medeniyet sentezinin kapısı aralandı.',
  },
  {
    year: 1299,
    month: 1,
    day: 27,
    title: 'Osmanlı Devleti’nin Kuruluşu',
    type: 'Kuruluş',
    summary: 'Söğüt ve Domaniç ekseninde yüzyıllara yayılan devlet geleneğinin temeli atıldı.',
  },
  {
    year: 1453,
    month: 5,
    day: 29,
    title: 'İstanbul’un Fethi',
    type: 'Fetih',
    summary: 'Orta Çağ kapanırken Akdeniz ve Karadeniz havzasında yeni bir dönem başladı.',
  },
  {
    year: 1577,
    month: 11,
    day: 11,
    title: 'İstanbul Rasathanesi’nin Kuruluşu',
    type: 'Miras',
    summary: 'Takiyüddin tarafından Tophane sırtlarında çağının en ileri gök gözlemevi kuruldu.',
  },
  {
    year: 1905,
    month: 9,
    day: 27,
    title: 'Özel Görelilik Kuramı',
    type: 'Bilim',
    summary: 'Zaman ve uzayın mutlak olmadığı, gözlemciye bağlı bütünsel bir dokuda aktığı kanıtlandı.',
  },
  {
    year: 1923,
    month: 10,
    day: 29,
    title: 'Cumhuriyetin İlanı',
    type: 'Devrim',
    summary: 'Anadolu’da egemenliğin millete devredildiği çağdaş cumhuriyet dönemi başladı.',
  },
  {
    year: 1969,
    month: 7,
    day: 20,
    title: 'Ay’a İlk Adım',
    type: 'Bilim',
    summary: 'İnsanlık ilk kez Dünya’nın dışındaki bir gök cismine ayak basarak ufkunu göğe taşıdı.',
  },
] as const;

const MS_PER_DAY = 86_400_000;

/**
 * Date.UTC 0-99 arası yılları 1900'lere kaydırdığı için güvenli UTC zaman damgası üretir.
 */
export function utcTimestamp(year: number, monthIndex: number, day: number): number {
  const d = new Date(Date.UTC(year, monthIndex, day));
  if (year >= 0 && year < 100) {
    d.setUTCFullYear(year);
  }
  return d.getTime();
}

/**
 * Kış Gündönümü (21 Aralık) ile başlayan Medeniyet yılı bir sonraki Gregoryen yılın Şubatını kapsar.
 */
export function isLeapYear(gregorianStartYear: number): boolean {
  const targetYear = gregorianStartYear + 1;
  return (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
}

/**
 * 28 günlük sabit ay içindeki gün numarasına göre Ay evresini hesaplar.
 */
export function getMoonPhase(day: number): MoonPhaseInfo {
  if (day === 0) {
    return { day: 0, name: 'Zamansız Işık', illumination: '%100', fraction: 1, waxing: true };
  }
  if (day === 1) {
    return { day: 1, name: 'Yeni Ay', illumination: '%0', fraction: 0, waxing: true };
  }
  if (day >= 2 && day <= 6) {
    const fraction = (day - 1) / 13;
    return {
      day,
      name: 'Hilal',
      illumination: `%${Math.round(fraction * 100)}`,
      fraction,
      waxing: true,
    };
  }
  if (day >= 7 && day <= 8) {
    return { day, name: 'İlk Dördün', illumination: '%50', fraction: 0.5, waxing: true };
  }
  if (day >= 9 && day <= 13) {
    const fraction = (day - 1) / 13;
    return {
      day,
      name: 'Büyüyen Ay',
      illumination: `%${Math.round(fraction * 100)}`,
      fraction,
      waxing: true,
    };
  }
  if (day >= 14 && day <= 15) {
    return { day, name: 'Dolunay', illumination: '%100', fraction: 1, waxing: true };
  }
  if (day >= 16 && day <= 20) {
    const fraction = 1 - (day - 15) / 13;
    return {
      day,
      name: 'Küçülen Ay',
      illumination: `%${Math.round(fraction * 100)}`,
      fraction,
      waxing: false,
    };
  }
  if (day >= 21 && day <= 22) {
    return { day, name: 'Son Dördün', illumination: '%50', fraction: 0.5, waxing: false };
  }
  const fraction = Math.max(0.06, 1 - (day - 15) / 13);
  return {
    day,
    name: 'Balzamik Hilal',
    illumination: `%${Math.round(fraction * 100)}`,
    fraction,
    waxing: false,
  };
}

/**
 * Yerel Date nesnesini Medeniyet Takvimi tarihine dönüştürür.
 */
export function getCivilizationDate(date: Date): CivilizationDate {
  const gregYear = date.getFullYear();
  const gregMonth = date.getMonth();
  const gregDay = date.getDate();

  let startYear = gregYear;
  if (gregMonth < 11 || (gregMonth === 11 && gregDay < 21)) {
    startYear = gregYear - 1;
  }

  const currentUtc = utcTimestamp(gregYear, gregMonth, gregDay);
  const winterSolsticeUtc = utcTimestamp(startYear, 11, 21);
  const dayOfYear = Math.round((currentUtc - winterSolsticeUtc) / MS_PER_DAY);

  const civYear = startYear + 3201;
  const leap = isLeapYear(startYear);

  let currentDay = dayOfYear + 1;
  const daysInSixMonths = 6 * 28;

  if (leap) {
    if (currentDay === daysInSixMonths + 1) {
      return {
        civYear,
        solsticeYear: startYear,
        civMonthIndex: 6,
        civDay: 0,
        specialDay: 'Ay Günü (Artık Gün)',
        specialKind: 'leap',
        weekday: 'Zaman Dışı',
        monthName: 'Sol Öncesi',
        moonPhase: getMoonPhase(0),
        isLeapCivYear: true,
      };
    }
    if (currentDay > daysInSixMonths + 1) {
      currentDay -= 1;
    }
  }

  if (currentDay > 364) {
    return {
      civYear,
      solsticeYear: startYear,
      civMonthIndex: 12,
      civDay: 0,
      specialDay: 'Dünya Günü',
      specialKind: 'world',
      weekday: 'Zaman Dışı',
      monthName: 'Aralık Sonu',
      moonPhase: getMoonPhase(0),
      isLeapCivYear: leap,
    };
  }

  const civMonthIndex = Math.floor((currentDay - 1) / 28);
  const civDay = ((currentDay - 1) % 28) + 1;
  const weekday = WEEKDAYS[(civDay - 1) % 7] ?? 'Pazartesi';
  const monthName = CIV_MONTHS[civMonthIndex] ?? 'Ocak';

  return {
    civYear,
    solsticeYear: startYear,
    civMonthIndex,
    civDay,
    specialDay: null,
    specialKind: null,
    weekday,
    monthName,
    moonPhase: getMoonPhase(civDay),
    isLeapCivYear: leap,
  };
}

/**
 * Medeniyet Takvimi koordinatlarını kesin Gregoryen karşılığına çevirir.
 */
export function civilizationToGregorian(
  civYear: number,
  civMonthIndex: number,
  civDay: number,
  special: 'world' | 'leap' | null = null,
): ReverseConversionResult {
  if (!Number.isFinite(civYear)) {
    return { ok: false, error: 'Geçerli bir Medeniyet yılı giriniz.' };
  }

  const normalizedYear = Math.trunc(civYear);
  const startYear = normalizedYear - 3201;
  const leap = isLeapYear(startYear);

  let daysOffset = 0;

  if (special === 'world') {
    daysOffset = 364 + (leap ? 1 : 0);
  } else if (special === 'leap') {
    if (!leap) {
      return {
        ok: false,
        error: `${normalizedYear} yılı artık yıl değildir; bu yılda Ay Günü bulunmaz.`,
      };
    }
    daysOffset = 6 * 28;
  } else {
    const clampedMonth = Math.min(12, Math.max(0, Math.trunc(civMonthIndex)));
    const clampedDay = Math.min(28, Math.max(1, Math.trunc(civDay)));
    daysOffset = clampedMonth * 28 + (clampedDay - 1);
    if (leap && clampedMonth >= 6) {
      daysOffset += 1;
    }
  }

  const winterSolsticeUtc = utcTimestamp(startYear, 11, 21);
  const targetDate = new Date(winterSolsticeUtc + daysOffset * MS_PER_DAY);

  const monthIdx = targetDate.getUTCMonth();
  const dayOfWeekIdx = targetDate.getUTCDay();

  return {
    ok: true,
    date: targetDate,
    day: targetDate.getUTCDate(),
    month: monthIdx + 1,
    monthName: GREGORIAN_MONTHS[monthIdx] ?? 'Ocak',
    year: targetDate.getUTCFullYear(),
    solsticeYear: startYear,
    weekday: special ? 'Zaman Dışı' : (WEEKDAYS[(Math.trunc(civDay) - 1) % 7] ?? 'Pazartesi'),
    gregWeekday: GREG_WEEKDAYS[dayOfWeekIdx] ?? 'Pazar',
  };
}

function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

/**
 * Verilen Medeniyet Yılı için Döngü (4y), Nesil (28y), Çağ (196y) ve Büyük Devir (1372y) hesaplar.
 */
export function calculateHierarchy(civYear: number): HierarchyInfo {
  const safeYear = Number.isFinite(civYear) ? Math.trunc(civYear) : 1;
  const adjustedYear = safeYear - 1;

  const yearInGenerationIdx = positiveModulo(adjustedYear, 28);
  const cycleIndex = Math.floor(yearInGenerationIdx / 4);
  const generationIndex = positiveModulo(Math.floor(adjustedYear / 28), 7);
  const ageIndex = positiveModulo(Math.floor(adjustedYear / 196), 7);
  const yearInAge = positiveModulo(adjustedYear, 196) + 1;
  const eon = adjustedYear < 0 ? 0 : Math.floor(adjustedYear / 1372) + 1;

  return {
    cycle: CYCLES[cycleIndex] ?? CYCLES[0]!,
    cycleIndex,
    generation: GENERATIONS[generationIndex] ?? GENERATIONS[0]!,
    generationIndex,
    age: AGES[ageIndex] ?? AGES[0]!,
    ageIndex,
    eon,
    yearInCycle: (yearInGenerationIdx % 4) + 1,
    yearInGeneration: yearInGenerationIdx + 1,
    yearInAge,
  };
}

/**
 * Tarihin astronomik evresine, mevsimine ve döngüsüne göre deterministik gözlem notu üretir.
 */
export function getDayReflection(civDate: CivilizationDate, hierarchy: HierarchyInfo): string {
  if (civDate.specialKind === 'world') {
    return `${civDate.civYear} yılının 364 günlük döngüsü tamamlandı. Bugün haftanın günlerinden bağımsız Dünya Günü: geçmiş yılı muhasebe etme ve yeni gündönümüne dinginlikle hazırlanma eşiği.`;
  }
  if (civDate.specialKind === 'leap') {
    return `Haziran ile Sol arasında yer alan Ay Günü’ndesiniz. Güneşin doruğa yaklaştığı bu artık gün, takvimi gök mekaniğiyle yeniden hizalar.`;
  }

  const monthNote =
    civDate.civMonthIndex === 6
      ? 'Yılın kalbi olan 13. Sol ayındasınız; güneş en yüksek kemerinden süzülüyor.'
      : civDate.civMonthIndex <= 2
        ? 'Kış Gündönümü sonrası günlerin uzamaya başladığı hazırlık ve kök salma mevsimi.'
        : civDate.civMonthIndex <= 5
          ? 'Bahar ekinoksuyla uyanan doğanın Sol eşiğine doğru yükseldiği dönem.'
          : civDate.civMonthIndex <= 9
            ? 'Yaz hasadından güz dinginliğine geçiş; emeğin biçim kazandığı aylar.'
            : 'Yılın son çeyreğinde içe çekilme ve bir sonraki Kış Gündönümüne birikim taşıma zamanı.';

  const lunarNote =
    civDate.civDay === 1
      ? 'Yeni Ay başlangıcı yeni niyetler ve temiz sayfalar için berrak bir zemin sunar.'
      : civDate.civDay === 14 || civDate.civDay === 15
        ? 'Dolunay evresinde aydınlanma %100; başlatılan işlerin görünürlüğü en yüksek düzeyde.'
        : civDate.moonPhase.waxing
          ? `Büyüyen ay evresi (${civDate.moonPhase.illumination}) adım adım inşa etmeyi ve ilerlemeyi destekler.`
          : `Küçülen ay evresi (${civDate.moonPhase.illumination}) fazlalıkları ayıklamak ve sadeleşmek için elverişlidir.`;

  return `${monthNote} ${lunarNote} ${hierarchy.age} Çağı’nın ${hierarchy.generation} Nesli ve ${hierarchy.cycle.name} (${hierarchy.yearInCycle}/4) ritmi içindesiniz.`;
}

const CYCLE_ARCHETYPES: readonly string[] = [
  'Ateşin Öncüsü: Kendi çağında ilk kıvılcımı yakan, kararlı ve yön belirleyen kurucu mizaç.',
  'Yaratıcı Mimar: Dağınık unsurları uyumlu bir yapıya dönüştüren üretken ve hareketli zihin.',
  'İrade Dağı: Uzun soluklu sorumlulukları sarsılmadan taşıyan, odaklanmış ve koruyucu karakter.',
  'Şifa Pınarı: Çevresini besleyen, büyümeyi sabırla gözeten ve denge kuran doğal arabulucu.',
  'Akışın Elçisi: Bilgiyi berrak biçimde aktaran, dönemler arasında köprü kuran açık sözlü gezgin.',
  'Sezgi Gözcüsü: Yüzeyin altındaki örüntüleri erken fark eden, derinlikli ve düşünsel gözlemci.',
  'Bilgelik Aynası: Deneyimi sükûnete damıtan, karmaşa içinde bütünü görebilen berrak bilinç.',
];

export function getBirthArchetype(civDate: CivilizationDate, hierarchy: HierarchyInfo): string {
  const base = CYCLE_ARCHETYPES[hierarchy.cycleIndex] ?? CYCLE_ARCHETYPES[0]!;
  if (civDate.specialKind === 'world') {
    return `${base} Dünya Günü’nde doğanlar, yılın iki ucu arasındaki zamansız eşikte yer alır.`;
  }
  if (civDate.specialKind === 'leap') {
    return `${base} Dört yılda bir beliren Ay Günü’nde doğmak, nadir bir göksel hizalanma işaretidir.`;
  }
  return `${base} ${civDate.monthName} ayının ${civDate.civDay}. günü (${civDate.moonPhase.name}) doğanlar ritmini doğanın 28 günlük döngüsüyle uyumlu kurar.`;
}

/**
 * Date nesnesini local YYYY-MM-DD dizesine çevirir.
 */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  if (y < 0 || y > 9999) return '';
  const yyyy = String(y).padStart(4, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * YYYY-MM-DD değerini yerel saat dilimi kayması olmadan Date nesnesine çevirir.
 */
export function parseDateInputValue(value: string): Date | null {
  const match = /^(\d{1,4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const d = new Date(year, month, day);
  if (year >= 0 && year < 100) d.setFullYear(year);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Tarihi Türkçe formatla okur (M.Ö. yılları destekler).
 */
export function formatGregorianDate(year: number, month1Based: number, day: number): string {
  const monthName = GREGORIAN_MONTHS[month1Based - 1] ?? 'Ocak';
  const yearLabel = year < 0 ? `M.Ö. ${Math.abs(year)}` : String(year);
  return `${day} ${monthName} ${yearLabel}`;
}
