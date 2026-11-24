import { useRef, type ChangeEvent } from 'react';
import {
  CalendarArrowDown,
  Download,
  Monitor,
  Moon,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Upload,
  X,
} from 'lucide-react';
import { isIosBrowser } from '../lib/mobile';
import type { ColorSchemePreference } from '../lib/storage';

interface SettingsPopoverProps {
  readonly colorScheme: ColorSchemePreference;
  readonly systemIsDark: boolean;
  readonly onChangeColorScheme: (next: ColorSchemePreference) => void;
  readonly activeCivYear: number;
  readonly savedCount: number;
  readonly onExportJson: () => void;
  readonly onImportJson: (file: File) => void;
  readonly onExportIcs: () => void;
  readonly canInstallPwa: boolean;
  readonly onInstallPwa: () => void;
}

export function SettingsPopover({
  colorScheme,
  systemIsDark,
  onChangeColorScheme,
  activeCivYear,
  savedCount,
  onExportJson,
  onImportJson,
  onExportIcs,
  canInstallPwa,
  onInstallPwa,
}: SettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      popoverRef.current?.hidePopover?.();
    }
    e.target.value = '';
  };

  const closePopover = () => {
    popoverRef.current?.hidePopover?.();
  };

  const systemLabel = systemIsDark ? 'Sistem (Gece)' : 'Sistem (Gündüz)';
  const showIosHint = !canInstallPwa && isIosBrowser();

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        popoverTarget="observatory-settings"
        aria-label="Görünüm, yedekleme ve takvim dışa aktarma ayarları"
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-hairline bg-surface px-2.5 py-2 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent sm:px-3"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Ayarlar ve Aktarım</span>
      </button>

      <div
        ref={popoverRef}
        id="observatory-settings"
        popover="auto"
        aria-labelledby="settings-popover-title"
        className="observatory-popover fixed inset-auto top-16 right-4 z-50 m-0 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-hairline bg-surface-raised p-5 text-ink shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between border-b border-hairline pb-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
              RASATHANE KONTROLÜ
            </p>
            <h2 id="settings-popover-title" className="font-display text-lg font-semibold text-ink">
              Görünüm ve Veri Yönetimi
            </h2>
          </div>
          <button
            type="button"
            onClick={closePopover}
            aria-label="Ayarlar panelini kapat"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* 3-State Color Scheme Control */}
        <fieldset className="mb-5">
          <legend className="mb-2 text-xs font-medium text-muted">
            Renk Düzeni
          </legend>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-hairline bg-surface p-1">
            {(
              [
                { id: 'system', label: systemLabel, icon: Monitor },
                { id: 'light', label: 'Gündüz', icon: Sun },
                { id: 'dark', label: 'Gece', icon: Moon },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = colorScheme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChangeColorScheme(opt.id)}
                  className={`flex min-h-[40px] flex-col items-center justify-center gap-0.5 rounded-md px-1.5 py-1.5 text-[11px] font-medium transition-colors ${
                    active
                      ? 'bg-accent text-accent-contrast'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span className="max-w-full truncate">
                    {opt.id === 'system' ? 'Sistem' : opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 font-mono text-[11px] text-muted">
            Etkin kip:{' '}
            {colorScheme === 'system'
              ? systemLabel
              : colorScheme === 'light'
                ? 'Gündüz (Ahar Kâğıt)'
                : 'Gece (Obsidiyen)'}
          </p>
        </fieldset>

        {/* PWA Cihaza Kurulum */}
        {(canInstallPwa || showIosHint) && (
          <div className="mb-4 border-t border-hairline pt-4">
            {canInstallPwa ? (
              <button
                type="button"
                onClick={() => {
                  onInstallPwa();
                  closePopover();
                }}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-contrast transition-opacity hover:opacity-90"
              >
                <Smartphone size={15} aria-hidden="true" />
                <span>Uygulamayı Cihaza Kur (PWA)</span>
              </button>
            ) : (
              <p className="rounded-lg border border-hairline bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted">
                iPhone / iPad’de uygulama gibi kurmak için Safari’de{' '}
                <strong className="text-ink">Paylaş → Ana Ekrana Ekle</strong> adımını kullanın.
              </p>
            )}
          </div>
        )}

        {/* Calendar & Backup Exports */}
        <div className="space-y-2 border-t border-hairline pt-4">
          <p className="text-xs font-medium text-muted">
            Takvim Dışa Aktarımı ve Yedek ({savedCount} kayıt)
          </p>

          <button
            type="button"
            onClick={() => {
              onExportIcs();
              closePopover();
            }}
            className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-hairline bg-surface px-3 py-2 text-left text-xs font-medium text-ink transition-colors hover:border-accent"
          >
            <span className="flex items-center gap-2">
              <CalendarArrowDown size={16} className="text-accent" aria-hidden="true" />
              <span>{activeCivYear} Yılı .ics Takvimi İndir</span>
            </span>
            <span className="font-mono text-[10px] text-muted">RFC 5545</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onExportJson();
                closePopover();
              }}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-accent"
            >
              <Download size={14} className="text-accent" aria-hidden="true" />
              <span>Yedek Al</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-accent"
            >
              <Upload size={14} className="text-accent" aria-hidden="true" />
              <span>Yedek Yükle</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="JSON yedek dosyası seç"
          />
        </div>
      </div>
    </div>
  );
}
