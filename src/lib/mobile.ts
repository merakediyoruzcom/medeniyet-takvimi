import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';

export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isIosBrowser(): boolean {
  if (typeof navigator === 'undefined' || isNativePlatform()) return false;
  const ua = navigator.userAgent;
  const isAppleTouch =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return isAppleTouch && !standalone;
}

export function triggerHaptic(durationMs = 8): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    navigator.vibrate?.(durationMs);
  } catch {
    // Titreşim API'si desteklenmiyorsa yoksay
  }
}

export async function syncNativeStatusBar(isDark: boolean): Promise<void> {
  const color = isDark ? '#111317' : '#F6F1E7';

  if (typeof document !== 'undefined') {
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        meta.content = color;
      });
  }

  if (!isNativePlatform()) return;

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color });
  } catch {
    // WebView veya eklenti hazır değilse sessizce devam et
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result ?? '');
      const commaIdx = result.indexOf(',');
      if (commaIdx === -1) {
        reject(new Error('Dosya base64 biçimine dönüştürülemedi.'));
      } else {
        resolve(result.slice(commaIdx + 1));
      }
    };
    reader.onerror = () => reject(new Error('Dosya okuma hatası.'));
    reader.readAsDataURL(blob);
  });
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export interface ExportOrShareParams {
  readonly blob: Blob;
  readonly filename: string;
  readonly mimeType: string;
  readonly title: string;
  readonly text: string;
}

export type ExportOutcome = 'shared' | 'downloaded' | 'cancelled';

/**
 * Dosyayı Capacitor yerel paylaşım menüsü, mobil Web Share API veya tarayıcı indirmesiyle dışa aktarır.
 */
export async function exportOrShareBlob(
  params: ExportOrShareParams,
): Promise<ExportOutcome> {
  const { blob, filename, mimeType, title, text } = params;

  if (isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
      });
      const uriResult = await Filesystem.getUri({
        path: filename,
        directory: Directory.Cache,
      });
      await Share.share({
        title,
        text,
        url: uriResult.uri,
        dialogTitle: title,
      });
      return 'shared';
    } catch (err) {
      if (err instanceof Error && /cancel/i.test(err.message)) {
        return 'cancelled';
      }
      throw err;
    }
  }

  const isCoarsePointer =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches;

  if (
    isCoarsePointer &&
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        return 'shared';
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Paylaşım desteklenmezse standart indirmeye düş
    }
  }

  triggerBrowserDownload(blob, filename);
  return 'downloaded';
}
