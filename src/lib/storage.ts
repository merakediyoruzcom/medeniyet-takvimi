export interface DayHabits {
  readonly water: boolean;
  readonly read: boolean;
  readonly meditate: boolean;
}

export interface DayEntry {
  readonly note: string;
  readonly habits: DayHabits;
}

export type NotesMap = Record<string, DayEntry>;

export type ColorSchemePreference = 'system' | 'light' | 'dark';

export const NOTES_STORAGE_KEY = 'civ_notes_data';
export const COLOR_SCHEME_STORAGE_KEY = 'color-scheme';

const RECORD_KEY_PATTERN = /^-?\d+_\d+_\d+$/;

export function makeDayKey(civYear: number, monthIndex: number, dayNum: number): string {
  return `${civYear}_${monthIndex}_${dayNum}`;
}

export function isEntryEmpty(entry: DayEntry): boolean {
  return (
    !entry.note.trim() &&
    !entry.habits.water &&
    !entry.habits.read &&
    !entry.habits.meditate
  );
}

export function loadNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return sanitizeNotesMap(parsed);
  } catch {
    return {};
  }
}

export function persistNotes(notes: NotesMap): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Depolama kotası veya gizli mod kısıtı
  }
}

export function sanitizeNotesMap(input: unknown): NotesMap {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }
  const clean: NotesMap = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!RECORD_KEY_PATTERN.test(key) || !value || typeof value !== 'object') continue;
    const rec = value as Record<string, unknown>;
    const rawHabits =
      rec.habits && typeof rec.habits === 'object'
        ? (rec.habits as Record<string, unknown>)
        : {};
    const entry: DayEntry = {
      note: typeof rec.note === 'string' ? rec.note : '',
      habits: {
        water: Boolean(rawHabits.water),
        read: Boolean(rawHabits.read),
        meditate: Boolean(rawHabits.meditate),
      },
    };
    if (!isEntryEmpty(entry)) {
      clean[key] = entry;
    }
  }
  return clean;
}

export function buildBackupJson(notes: NotesMap): string {
  return JSON.stringify(
    {
      app: 'medeniyet-takvimi',
      version: 2,
      exportedAt: new Date().toISOString(),
      notes,
    },
    null,
    2,
  );
}

export function parseAndValidateBackup(rawText: string): NotesMap {
  const parsed: unknown = JSON.parse(rawText);
  const candidate =
    parsed && typeof parsed === 'object' && 'notes' in parsed
      ? (parsed as { notes: unknown }).notes
      : parsed;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    throw new Error('Geçersiz yedek dosyası biçimi.');
  }
  const clean = sanitizeNotesMap(candidate);
  if (Object.keys(clean).length === 0) {
    throw new Error('Yedek dosyasında geçerli bir kayıt bulunamadı.');
  }
  return clean;
}

export function getStoredColorScheme(): ColorSchemePreference {
  try {
    const val = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark') return val;
    return 'system';
  } catch {
    return 'system';
  }
}

export function applyColorScheme(mode: ColorSchemePreference): void {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (mode === 'system') {
    if (meta) meta.content = 'light dark';
    try {
      localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
    } catch {
      // yoksay
    }
  } else {
    if (meta) meta.content = mode;
    try {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, mode);
    } catch {
      // yoksay
    }
  }
}
