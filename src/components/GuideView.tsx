import { Compass, HelpCircle, Moon, Star } from 'lucide-react';
import { AGES, CYCLES, GENERATIONS } from '../lib/calendar';

interface GuideViewProps {
  readonly headingRef: React.RefObject<HTMLHeadingElement | null>;
}

export function GuideView({ headingRef }: GuideViewProps) {
  return (
    <section aria-labelledby="guide-heading" className="mx-auto w-full max-w-4xl space-y-8">
      <div className="border-b border-hairline pb-5">
        <p className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase">
          TAKVİM MONOGRAFİSİ
        </p>
        <h2
          id="guide-heading"
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl font-bold tracking-tight text-ink outline-none sm:text-4xl"
        >
          Medeniyet Takvimi Rehberi
        </h2>
        <p className="mt-1 max-w-[65ch] text-sm text-muted">
          Güneş yılı ile Ay evrelerini 28 günlük sabit aylar içinde uzlaştıran ve insanlığın ortak yazılı tarihini milat alan zaman sistemi.
        </p>
      </div>

      {/* Bölüm 1: Temel Matematik ve Milat */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className="observatory-plate-raised rounded-2xl p-6">
          <h3 className="flex items-center gap-2 font-display text-2xl font-bold text-ink">
            <Compass size={20} className="text-accent" aria-hidden="true" />
            <span>Milat: Yazının İcadı (M.Ö. 3200)</span>
          </h3>
          <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted">
            Takvim, insanlık tarihinin ortak hafıza eşiği olan Mezopotamya’da yazının doğuşunu (M.Ö. 3200) sıfır noktası kabul eder. Tarih öncesi ve sonrası biçimindeki parçalı anlatım yerine kesintisiz bir medeniyet çizgisi kurulur.
          </p>
          <div className="mt-4 rounded-xl border border-hairline bg-surface px-4 py-3 font-mono text-xs tabular-nums text-ink">
            21 Aralık 2025 + 3201 = <strong className="text-accent">5226 Medeniyet Yılı</strong>
          </div>
        </article>

        <article className="observatory-plate-raised rounded-2xl p-6">
          <h3 className="font-display text-2xl font-bold text-ink">
            13 Ay × 28 Gün Sabit Sistemi
          </h3>
          <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted">
            28, 30 ve 31 günlük düzensiz aylar yerine her biri dört tam haftadan oluşan 13 eşit ay kullanılır. Böylece her ayın 1’i Pazartesi, 14’ü Dolunay ve 28’i Pazar olur.
          </p>
          <ul className="mt-4 space-y-1.5 font-mono text-xs text-ink">
            <li>13 Ay × 28 Gün = 364 Hafta İçi Günü</li>
            <li>+1 Dünya Günü (Yıl Sonu Eşiği) = 365 Gün</li>
            <li>+1 Ay Günü (Artık Yıllarda Sol Öncesi) = 366 Gün</li>
          </ul>
        </article>
      </div>

      {/* Bölüm 2: 4 Katmanlı Zaman Hiyerarşisi Tablosu */}
      <article className="observatory-plate overflow-hidden rounded-2xl">
        <div className="border-b border-hairline px-6 py-4">
          <h3 className="font-display text-2xl font-bold text-ink">
            Zaman Hiyerarşisi
          </h3>
          <p className="text-xs text-muted">
            Yıllar, her basamakta yedi kat artan dört eşmerkezli döngüde gruplanır.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-raised font-mono text-[11px] tracking-[0.06em] text-muted uppercase">
                <th className="px-6 py-3">Katman</th>
                <th className="px-6 py-3">Süre</th>
                <th className="px-6 py-3">Yapı</th>
                <th className="px-6 py-3">Sıralı Adlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              <tr>
                <td className="px-6 py-4 font-semibold text-ink">Döngü</td>
                <td className="px-6 py-4 font-mono tabular-nums text-accent">4 Yıl</td>
                <td className="px-6 py-4 text-muted">Temel renk periyodu</td>
                <td className="px-6 py-4 text-xs text-muted">
                  {CYCLES.map((c) => c.name.replace(' Döngü', '')).join(' · ')}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-ink">Nesil</td>
                <td className="px-6 py-4 font-mono tabular-nums text-accent">28 Yıl</td>
                <td className="px-6 py-4 text-muted">7 Döngü</td>
                <td className="px-6 py-4 text-xs text-muted">
                  {GENERATIONS.join(' → ')}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-ink">Çağ</td>
                <td className="px-6 py-4 font-mono tabular-nums text-accent">196 Yıl</td>
                <td className="px-6 py-4 text-muted">7 Nesil</td>
                <td className="px-6 py-4 text-xs text-muted">
                  {AGES.join(' · ')}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-ink">Büyük Devir (Eon)</td>
                <td className="px-6 py-4 font-mono tabular-nums text-accent">1372 Yıl</td>
                <td className="px-6 py-4 text-muted">7 Çağ</td>
                <td className="px-6 py-4 text-xs text-muted">
                  1. Eon, 2. Eon, 3. Eon …
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      {/* Bölüm 3: Üç Temel Kavram */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="observatory-plate rounded-2xl p-5">
          <Moon size={22} className="text-accent" aria-hidden="true" />
          <h4 className="mt-3 font-display text-xl font-bold text-ink">Sol Ayı (13. Ay)</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Haziran ile Temmuz arasına yerleşen yaz ortası ayıdır. Güneşin gökyüzünde en yüksek yörüngede olduğu dönemi işaretler.
          </p>
        </div>

        <div className="observatory-plate rounded-2xl p-5">
          <Star size={22} className="text-accent" aria-hidden="true" />
          <h4 className="mt-3 font-display text-xl font-bold text-ink">Dünya ve Ay Günü</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Hafta günlerini bozmadan Güneş yılına (365/366 gün) eşitlenmek için yıl sonuna Dünya Günü, artık yıllarda ise Sol öncesine Ay Günü eklenir.
          </p>
        </div>

        <div className="observatory-plate rounded-2xl p-5">
          <HelpCircle size={22} className="text-accent" aria-hidden="true" />
          <h4 className="mt-3 font-display text-xl font-bold text-ink">Neden 21 Aralık?</h4>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Kuzey yarımkürede en uzun gecenin ardından güneş ışığının yeniden artmaya başladığı Kış Gündönümü astronomik yılbaşıdır.
          </p>
        </div>
      </div>
    </section>
  );
}
