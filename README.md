# Medeniyet Takvimi — Web, PWA ve Android Mobil Sürümü (v2.0)

Kış Gündönümü (21 Aralık) yılbaşını, M.Ö. 3200 Yazının İcadı miladını ve 13 × 28 günlük sabit Ay evrelerini temel alan **masaüstü + mobil PWA + yerel Android APK** uygulaması.

- 🌐 **Canlı PWA (iOS & Android & Web):** [https://merakediyoruzcom.github.io/medeniyet-takvimi/](https://merakediyoruzcom.github.io/medeniyet-takvimi/)
- 📦 **Android APK & Tek Dosya HTML İndirme:** [Son Sürüm (Releases)](https://github.com/merakediyoruzcom/medeniyet-takvimi/releases/latest)

## Kurulum ve Çalıştırma Seçenekleri

### 1. Android APK (Doğrudan Telefona Kurulum)
- Derlenmiş kurulum paketi: [`release/MedeniyetTakvimi-v2.0.apk`](release/MedeniyetTakvimi-v2.0.apk)
- **Kablo ile kurulum (USB Hata Ayıklama açıksa):**
  ```bash
  adb install -r release/MedeniyetTakvimi-v2.0.apk
  ```
- **Manuel kurulum:** APK dosyasını telefonunuza aktarıp dosya yöneticisinden açın (*Bilinmeyen kaynaklardan uygulama yükleme* izni gerekebilir).
- **Yerel özellikler:** Çevrimdışı çalışma, donanım geri tuşu desteği, sistem/gündüz/gece durum çubuğu uyumu ve `.png` / `.ics` / `.json` dosyaları için yerel Android Paylaşım Menüsü.

### 2. iOS ve Android PWA (Tarayıcıdan Ana Ekrana Ekle)
`npm run build` ile üretilen [`dist/`](dist/) klasörü tam çevrimdışı önbellekli (Workbox Service Worker) bir Progressive Web App içerir:
- Yerel ağda önizleme için:
  ```bash
  npm run preview -- --host
  ```
- **iOS Safari:** `Paylaş → Ana Ekrana Ekle` adımıyla tam ekran uygulama gibi kurulur (`apple-touch-icon.png` ve çentik/safe-area destekli).
- **Android Chrome / Edge:** Sağ üstteki **Ayarlar ve Aktarım → Uygulamayı Cihaza Kur (PWA)** düğmesiyle veya tarayıcı menüsünden kurulur.

### 3. Masaüstü Tek Dosya (Taşınabilir HTML)
Sunucu veya kurulum gerektirmeden tek HTML dosyası üretmek için:
```bash
npm run build:portable
```
Çıktı: [`portable/index.html`](portable/index.html).

---

## Mobil Arayüz İyileştirmeleri
- **Tek Ay / 13 Ay Almanak Kipi:** Dar ekranlarda varsayılan olarak açılan **Tek Ay** görünümünde 13 ay yatay kaydırılabilir hap şeridiyle seçilebilir; parmakla sağa/sola kaydırarak (*swipe*) aylar arasında geçilebilir.
- **Alttan Açılan Gün Paneli (Bottom Sheet):** Mobilde herhangi bir güne dokunduğunuzda açılan native `<dialog>` penceresi alttan kayan sayfa olarak açılır; 28 günlük alışkanlıklar ve kişisel notlar `localStorage`’da saklanır.
- **Başparmak Bölgesi Gezinmesi:** Mobilde alt gezinti 5 ana sekmeye (`Çevirici`, `Almanak`, `Usturlap`, `Kimlik`, `Tarih`) düzenlenmiştir; `Rehber` kısayolu ve `Ayarlar` üst çubukta 44×44 px dokunma alanlarıyla yer alır.

---

## Geliştirme ve Derleme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Birim testlerini çalıştır (Vitest)
npm run test

# Tip kontrolü + PWA üretimi (dist/)
npm run build

# Tek dosyalık taşınabilir masaüstü derlemesi (portable/index.html)
npm run build:portable

# Uygulama ikonlarını yeniden üret
npm run mobile:icons

# Web çıktısını Android projesine eşitle
npm run cap:sync
```

### Android APK’yı Yeniden Derleme (Windows / JDK 17)
```powershell
$env:JAVA_HOME = "$env:LOCALAPPDATA\Programs\Microsoft\jdk-17.0.10.7-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_TOOL_OPTIONS = '-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT'

npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```
