import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { App as CapApp } from '@capacitor/app';
import {
  BookOpen,
  Calendar,
  Clock,
  Compass,
  CreditCard,
  Orbit,
  Scroll,
} from 'lucide-react';
import {
  calculateHierarchy,
  getCivilizationDate,
} from './lib/calendar';
import { generateCivilizationICS } from './lib/ics';
import {
  exportOrShareBlob,
  isNativePlatform,
  syncNativeStatusBar,
  triggerHaptic,
} from './lib/mobile';
import {
  applyColorScheme,
  buildBackupJson,
  COLOR_SCHEME_STORAGE_KEY,
  getStoredColorScheme,
  isEntryEmpty,
  loadNotes,
  parseAndValidateBackup,
  persistNotes,
  type ColorSchemePreference,
  type DayEntry,
  type NotesMap,
} from './lib/storage';
import { ConverterView } from './components/ConverterView';
import { DayDialog, type DayDialogTarget } from './components/DayDialog';
import { GuideView } from './components/GuideView';
import { HistoryExplorerView } from './components/HistoryExplorerView';
import { IdentityCardView } from './components/IdentityCardView';
import { SettingsPopover } from './components/SettingsPopover';
import { TimeWheelView } from './components/TimeWheelView';
import { YearAlmanacView } from './components/YearAlmanacView';

type ViewId =
  | 'converter'
  | 'birthcard'
  | 'yearview'
  | 'timewheel'
  | 'history'
  | 'guide';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const NAV_ITEMS: ReadonlyArray<{
  readonly id: ViewId;
  readonly label: string;
  readonly shortLabel: string;
  readonly icon: typeof Clock;
}> = [
  { id: 'converter', label: 'Çevirici', shortLabel: 'Çevirici', icon: Clock },
  { id: 'birthcard', label: 'Medeniyet Kimliği', shortLabel: 'Kimlik', icon: CreditCard },
  { id: 'yearview', label: 'Yıl Görünümü', shortLabel: 'Almanak', icon: Calendar },
  { id: 'timewheel', label: 'Zaman Çarkı', shortLabel: 'Usturlap', icon: Orbit },
  { id: 'history', label: 'Tarih Kaşifi', shortLabel: 'Tarih', icon: Scroll },
  { id: 'guide', label: 'Rehber', shortLabel: 'Rehber', icon: BookOpen },
];

// Mobilde alt çubuk 5 ana hedefe sığdırılır; Rehber üst başlıkta 44px düğme olarak kalır
const MOBILE_PRIMARY_TABS: ReadonlyArray<(typeof NAV_ITEMS)[number]> = [
  NAV_ITEMS[0]!,
  NAV_ITEMS[2]!,
  NAV_ITEMS[3]!,
  NAV_ITEMS[1]!,
  NAV_ITEMS[4]!,
];

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('converter');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState<NotesMap>(() => loadNotes());
  const [dayDialogTarget, setDayDialogTarget] = useState<DayDialogTarget | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [colorScheme, setColorScheme] = useState<ColorSchemePreference>(() =>
    getStoredColorScheme(),
  );
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );

  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const civDate = useMemo(() => getCivilizationDate(selectedDate), [selectedDate]);
  const hierarchy = useMemo(
    () => calculateHierarchy(civDate.civYear),
    [civDate.civYear],
  );

  const resolvedIsDark =
    colorScheme === 'dark' || (colorScheme === 'system' && systemIsDark);

  useEffect(() => {
    void syncNativeStatusBar(resolvedIsDark);
  }, [resolvedIsDark]);

  // System preference, PWA install prompt & cross-tab sync
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMqChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', onMqChange);

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => setInstallPromptEvent(null);
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    const onStorage = (e: StorageEvent) => {
      if (e.key === COLOR_SCHEME_STORAGE_KEY) {
        const next = getStoredColorScheme();
        setColorScheme(next);
        applyColorScheme(next);
      } else if (e.key === 'civ_notes_data') {
        setNotes(loadNotes());
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mq.removeEventListener('change', onMqChange);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Android donanım geri tuşu yönetimi (Capacitor)
  useEffect(() => {
    if (!isNativePlatform()) return;

    let handle: { remove: () => Promise<void> } | null = null;
    void CapApp.addListener('backButton', () => {
      if (dayDialogTarget !== null) {
        setDayDialogTarget(null);
      } else if (activeView !== 'converter') {
        setActiveView('converter');
      } else {
        void CapApp.exitApp();
      }
    }).then((listener) => {
      handle = listener;
    });

    return () => {
      void handle?.remove();
    };
  }, [activeView, dayDialogTarget]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const handleChangeColorScheme = useCallback((next: ColorSchemePreference) => {
    setColorScheme(next);
    applyColorScheme(next);
  }, []);

  const navigateTo = useCallback((nextView: ViewId) => {
    triggerHaptic(8);
    const applyUpdate = () => {
      flushSync(() => {
        setActiveView(nextView);
      });
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startVT = (
      document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      }
    ).startViewTransition;

    if (!startVT || reducedMotion) {
      applyUpdate();
      headingRef.current?.focus({ preventScroll: false });
      return;
    }

    const transition = startVT.call(document, applyUpdate);
    transition.finished.finally(() => {
      headingRef.current?.focus({ preventScroll: false });
    });
  }, []);

  const shiftYear = useCallback((offset: number) => {
    setSelectedDate((prev) => {
      const next = new Date(
        prev.getFullYear() + offset,
        prev.getMonth(),
        prev.getDate(),
      );
      if (prev.getFullYear() + offset >= 0 && prev.getFullYear() + offset < 100) {
        next.setFullYear(prev.getFullYear() + offset);
      }
      return next;
    });
  }, []);

  const resetToday = useCallback(() => {
    triggerHaptic(8);
    setSelectedDate(new Date());
  }, []);

  const handleSaveDayEntry = useCallback((key: string, entry: DayEntry) => {
    triggerHaptic(12);
    setNotes((prev) => {
      const next = { ...prev };
      if (isEntryEmpty(entry)) {
        delete next[key];
      } else {
        next[key] = entry;
      }
      persistNotes(next);
      return next;
    });
    setStatusMessage('Günlük kayıt yerel belleğe kaydedildi.');
  }, []);

  const handleExportJson = useCallback(async () => {
    try {
      const json = buildBackupJson(notes);
      const blob = new Blob([json], { type: 'application/json' });
      const outcome = await exportOrShareBlob({
        blob,
        filename: `medeniyet-takvimi-yedek-${new Date().toISOString().slice(0, 10)}.json`,
        mimeType: 'application/json',
        title: 'Medeniyet Takvimi Yedeği',
        text: `${Object.keys(notes).length} günlük kayıt yedeği`,
      });
      if (outcome !== 'cancelled') {
        setStatusMessage(
          `${Object.keys(notes).length} günlük kayıt ${outcome === 'shared' ? 'paylaşıldı' : 'JSON olarak yedeklendi'}.`,
        );
      }
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Yedek dosyası dışa aktarılamadı.',
      );
    }
  }, [notes]);

  const handleImportJson = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const clean = parseAndValidateBackup(String(reader.result));
        setNotes((prev) => {
          const merged = { ...prev, ...clean };
          persistNotes(merged);
          return merged;
        });
        setStatusMessage(
          `${Object.keys(clean).length} günlük kayıt yedekten başarıyla yüklendi.`,
        );
      } catch (err) {
        setStatusMessage(
          err instanceof Error ? err.message : 'Yedek dosyası okunamadı.',
        );
      }
    };
    reader.readAsText(file);
  }, []);

  const handleExportIcs = useCallback(async () => {
    try {
      const ics = generateCivilizationICS(civDate.civYear, notes);
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const outcome = await exportOrShareBlob({
        blob,
        filename: `medeniyet-takvimi-${civDate.civYear}.ics`,
        mimeType: 'text/calendar',
        title: `Medeniyet Takvimi ${civDate.civYear}`,
        text: `${civDate.civYear} yılı 13 aylık takvim ve notlar (.ics)`,
      });
      if (outcome !== 'cancelled') {
        setStatusMessage(
          `${civDate.civYear} yılı .ics takvimi ${outcome === 'shared' ? 'paylaşıldı' : 'indirildi'}.`,
        );
      }
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Takvim dosyası dışa aktarılamadı.',
      );
    }
  }, [civDate.civYear, notes]);

  const handleInstallPwa = useCallback(async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') {
      setStatusMessage('Medeniyet Takvimi cihazınıza kuruldu.');
    }
    setInstallPromptEvent(null);
  }, [installPromptEvent]);

  const handleInspectEventDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      navigateTo('converter');
    },
    [navigateTo],
  );

  const savedCount = useMemo(
    () => Object.values(notes).filter((e) => !isEntryEmpty(e)).length,
    [notes],
  );

  const activeDialogKey = dayDialogTarget
    ? `${dayDialogTarget.civYear}_${dayDialogTarget.monthIndex}_${dayDialogTarget.dayNum}`
    : '';

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <a href="#main-content" className="skip-link">
        İçeriğe atla
      </a>

      {/* Üst Rasathane Başlığı ve Gezinti */}
      <header className="safe-top sticky top-0 z-40 border-b border-hairline bg-bg/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <button
            type="button"
            onClick={() => navigateTo('converter')}
            className="flex min-h-[44px] items-center gap-2.5 text-left"
          >
            <Compass size={26} className="text-accent" aria-hidden="true" />
            <div>
              <span className="font-display block text-xl font-bold leading-none tracking-tight text-ink">
                Medeniyet Takvimi
              </span>
              <span className="font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
                {civDate.civYear} · {civDate.monthName}
              </span>
            </div>
          </button>

          <nav
            aria-label="Ana gezinme"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isCurrent = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => navigateTo(item.id)}
                  className={`relative inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'font-semibold text-accent after:absolute after:inset-x-2 after:bottom-0 after:border-b-2 after:border-accent'
                      : 'text-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Mobilde 5 ana sekmenin dışında kalan Rehber kısayolu */}
            <button
              type="button"
              onClick={() => navigateTo('guide')}
              aria-label="Takvim Rehberi"
              aria-current={activeView === 'guide' ? 'page' : undefined}
              className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border transition-colors lg:hidden ${
                activeView === 'guide'
                  ? 'border-accent bg-accent text-accent-contrast'
                  : 'border-hairline bg-surface text-ink hover:border-accent hover:text-accent'
              }`}
            >
              <BookOpen size={17} aria-hidden="true" />
            </button>

            <SettingsPopover
              colorScheme={colorScheme}
              systemIsDark={systemIsDark}
              onChangeColorScheme={handleChangeColorScheme}
              activeCivYear={civDate.civYear}
              savedCount={savedCount}
              onExportJson={() => void handleExportJson()}
              onImportJson={handleImportJson}
              onExportIcs={() => void handleExportIcs()}
              canInstallPwa={Boolean(installPromptEvent)}
              onInstallPwa={() => void handleInstallPwa()}
            />
          </div>
        </div>
      </header>

      {/* Durum Bildirim Çubuğu */}
      <div
        role="status"
        aria-live="polite"
        className="mx-auto max-w-7xl px-4"
      >
        {statusMessage && (
          <div className="mt-4 rounded-xl border border-accent bg-surface-raised px-4 py-2.5 text-xs font-medium text-ink">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Ana İçerik */}
      <main
        id="main-content"
        className="safe-main-bottom mx-auto flex w-full max-w-7xl flex-col px-4 pt-6 lg:pt-8 lg:pb-14"
      >
        {activeView === 'converter' && (
          <ConverterView
            headingRef={headingRef}
            selectedDate={selectedDate}
            civDate={civDate}
            hierarchy={hierarchy}
            onSelectDate={setSelectedDate}
            onResetToday={resetToday}
            onNavigateYearView={() => navigateTo('yearview')}
          />
        )}

        {activeView === 'birthcard' && (
          <IdentityCardView headingRef={headingRef} onNotify={setStatusMessage} />
        )}

        {activeView === 'yearview' && (
          <YearAlmanacView
            headingRef={headingRef}
            civDate={civDate}
            notes={notes}
            onShiftYear={shiftYear}
            onResetToday={resetToday}
            onOpenDay={setDayDialogTarget}
          />
        )}

        {activeView === 'timewheel' && (
          <TimeWheelView
            headingRef={headingRef}
            civDate={civDate}
            hierarchy={hierarchy}
            onShiftYear={shiftYear}
            onResetToday={resetToday}
          />
        )}

        {activeView === 'history' && (
          <HistoryExplorerView
            headingRef={headingRef}
            onInspectEventDate={handleInspectEventDate}
          />
        )}

        {activeView === 'guide' && <GuideView headingRef={headingRef} />}
      </main>

      {/* Mobil Alt Gezinme Şeridi (5 ana sekme + güvenli alt boşluk) */}
      <nav
        aria-label="Mobil gezinme"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface-raised/95 backdrop-blur-md lg:hidden"
      >
        <div className="grid grid-cols-5">
          {MOBILE_PRIMARY_TABS.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => navigateTo(item.id)}
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium transition-colors ${
                  isCurrent
                    ? 'font-semibold text-accent after:absolute after:inset-x-3 after:top-0 after:border-t-2 after:border-accent'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="max-w-full truncate">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Gün Kayıt ve Alışkanlık Modalı / Mobil Bottom Sheet */}
      <DayDialog
        target={dayDialogTarget}
        existingEntry={activeDialogKey ? notes[activeDialogKey] : undefined}
        onSave={handleSaveDayEntry}
        onClose={() => setDayDialogTarget(null)}
      />
    </div>
  );
}
