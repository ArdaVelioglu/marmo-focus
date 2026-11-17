# Marmo Focus — App Store yayın kontrol listesi (1.8.0)

Bu dosya, uygulamayı App Store'a göndermeden önce yapılması gerekenleri, App Store Connect'te verilecek cevapları ve hukuki/güvenlik değerlendirmesini içerir.

## 1. Göndermeden önce mutlaka yap

| # | Ne | Nerede |
|---|---|---|
| 1 | ~~Destek e-postası~~ ✔ `ardavelioglu.apps@gmail.com` olarak ayarlandı. Değiştirmek istersen: | `src/legal/content.js` → `CONTACT_EMAIL`, sonra `npm run legal` |
| 2 | Geliştirici adını (`DEVELOPER`) ve geçerli hukuku (`GOVERNING_LAW`, şu an Türkiye) kontrol et. | `src/legal/content.js` |
| 3 | Yasal sayfaları yeniden üret: `npm run legal` | `public/legal/*.html`, `legal/*.md` |
| 4 | Paket kimliğini (Bundle ID) onayla: `com.ardavelioglu.marmofocus`. Apple Developer hesabında aynısını oluştur. | `capacitor.config.json`, Xcode → Signing |
| 5 | App Store'da ve TÜRKPATENT/EUIPO/USPTO'da "Marmo Focus" adının boş olduğunu kontrol et. | — |

## 2. iOS derlemesi (Mac + Xcode 16 gerekir)

```bash
cd marmo-focus-src
npm ci
npm run ios:sync      # web uygulamasını derler ve iOS projesine kopyalar
npm run ios:open      # Xcode'u açar
```

Xcode'da **üç hedefin her birinde** (App, MarmoMonitor, MarmoShield) → *Signing & Capabilities* → **Automatically manage signing** açık → Team'i seç. Sonra gerçek iPhone'da dene → *Product → Archive* → *Distribute App → App Store Connect*.

### Uygulama engelleme (Screen Time) — 1.8.0'da var

| Parça | Dosya | Görevi |
|---|---|---|
| Eklenti (Swift) | `ios/App/App/AppBlockPlugin.swift` | İzin ister, Apple'ın uygulama seçicisini açar, seans boyunca kilitler |
| Kayıt | `ios/App/App/MainViewController.swift` | Eklentiyi Capacitor'a tanıtır (Main.storyboard bu sınıfı kullanır) |
| Monitor uzantısı | `ios/App/MarmoMonitor/` (`com.ardavelioglu.marmofocus.monitor`) | Seans bitince kilidi açar; uygulama kapalı olsa da çalışır |
| Shield uzantısı | `ios/App/MarmoShield/` (`com.ardavelioglu.marmofocus.shield`) | Engelli uygulamada "{pet} uyuyor 💤" ekranı |
| İzinler | `*.entitlements` | `com.apple.developer.family-controls` + App Group `group.com.ardavelioglu.marmofocus` |
| JS köprüsü | `src/lib/appBlock.js`, Ayarlar → *App Blocking* | Web'de gizli; iOS 16+ |

- Apple Developer'da: Family Controls (Distribution) izni ✔ onaylandı; üç App ID'de *Family Controls (Distribution)* + *App Groups* açık olmalı.
- **Simülatörde çalışmaz**, gerçek iPhone'da test et: Ayarlar → Block Distracting Apps → izin ver → uygulama seç → 15 dk seans başlat → seçili uygulamayı açmayı dene → seansı bitir/vazgeç → kilit kalkmalı.
- Uygulamanın en düşük iOS sürümü artık **16.0**.

Projede hazır olanlar: yalnızca iPhone, yalnızca dikey ekran, uygulama ikonu, açılış ekranı, `ITSAppUsesNonExemptEncryption = NO` (şifreleme beyanı), sürüm 1.8.0. Eklentiler Swift Package Manager ile gelir (CocoaPods gerekmez): bildirimler, kalıcı kayıt, titreşim.

## 3. App Store Connect cevapları

| Alan | Cevap |
|---|---|
| **Privacy Policy URL** | `https://github.com/ArdaVelioglu/marmo-focus/blob/main/marmo-focus-src/legal/PRIVACY.md` (ya da GitHub Pages ile `public/legal/privacy.html`) |
| **Support URL** | `https://github.com/ArdaVelioglu/marmo-focus` (ya da kendi destek sayfan) |
| **App Privacy (gizlilik etiketi)** | **"Data Not Collected"** — uygulama hiçbir veri toplamıyor, sunucusu yok, analiz/reklam/izleme SDK'sı yok. Engelleme seçimi Apple'ın anonim jetonlarıyla cihazda kalır. |
| **Age Rating** | Tüm sorulara "None" → **4+** |
| **Category** | Productivity (ikincil: Lifestyle) |
| **Price** | Free · In-App Purchase yok |
| **Content Rights** | Üçüncü taraf içerik yok (çizimler, sesler özgün; açık kaynak bileşenler lisanslı) |
| **Export Compliance** | Şifreleme yok (Info.plist'te beyan edildi) |
| **Sign-in required?** | Hayır — kullanıcı "Start as Guest" ile hemen başlar. |

**App Review Notes (önerilen metin):**

> Marmo Focus works fully offline and needs no account: tap "Start as Guest" to begin. "Create a Profile" only stores a display name on the device. The shortest focus session is 15 minutes; when it ends, the marmoset wakes up and the session is rewarded. If you leave the app during a session, a short grace period applies and a notification asks you to return.
>
> App blocking (Family Controls): when you tap "Start focusing" the first time, the app offers "Block distracting apps?" (it is also the "Block apps" switch on the Focus screen and Settings → App Blocking). Tap "Choose Apps", allow Screen Time access and pick apps in Apple's picker. While a focus session runs, those apps show a shield ("Mango is sleeping"); they unlock automatically when the session ends or is given up (a DeviceActivity monitor extension lifts the shield even if the app is closed). Authorization is individual (device owner only). The selection stays on the device as opaque tokens. The app collects no data: there is no server, analytics or advertising.

**Ekran görüntüleri:** 6.9" (1320×2868 veya 1290×2796) iPhone boyutu yeterli; `docs/screenshots/` ve tanıtım videosu (App Preview, 886×1920) hazır.

## 4. Apple inceleme riskleri

| Kural | Risk | Durum |
|---|---|---|
| 2.1 Tamamlanmışlık | Yer tutucu e-posta | **Senin yapman gereken:** 1. bölüm, madde 1 |
| 2.3 Doğru açıklama | Sahte kullanıcılar (Arkadaşlar sekmesi) | Yayın sürümünden kaldırıldı ✔ |
| 4.2 Minimum işlev | "Web sitesi sarmalayıcısı" sayılma riski | Azaltıldı: çevrimdışı çalışma, yerel bildirimler, Taptic titreşim, uygulama içi kalıcı kayıt. Tamamen sıfır değil; reddedilirse widget veya Live Activity eklemek en etkili çözüm. |
| 5.1.1 Gizlilik | Uygulama içinde ve mağazada gizlilik politikası | Var ✔ (Ayarlar → Hakkında, ilk açılış) |
| 5.1.1(v) Hesap silme | Hesap oluşturuluyorsa silinebilmeli | Sunucu hesabı yok; cihazdaki profil "Sign Out & Erase" ile siliniyor ✔ |
| 4.8 Apple ile Giriş | Üçüncü taraf girişi varsa zorunlu | Üçüncü taraf girişi yok, gerekmez ✔ |

## 5. Güvenlik değerlendirmesi

| Kontrol | Sonuç |
|---|---|
| Bağımlılık açıkları (`npm audit`) | 0 açık |
| Dış ağ istekleri | Yok — yazı tipi uygulamaya gömüldü, Google Fonts kaldırıldı (test edildi) |
| Content-Security-Policy | Yayın sürümünde: yalnızca uygulamanın kendi dosyaları; dış script yasak (test: 0 ihlal) |
| XSS | `innerHTML`/`eval` yok; React tüm kullanıcı metnini metin olarak basıyor (test edildi) |
| Girdi sınırları | Ad 24, maymun adı 20, görev 120, not 240 karakter; veri katmanında da sınırlı |
| Bozuk kayıt | Tür kontrolü ile varsayılana dönüyor; hata ekranında veri dışa aktarma + sıfırlama (test edildi) |
| Geliştirici araçları | Yayın sürümünde derlemeye girmiyor |
| Saat hilesi | Ödüller güvenilir zamana göre; saat geri alınırsa ödüller duraklıyor |
| Veri silme / taşıma | "Export My Data" (JSON) ve "Sign Out & Erase" (test edildi) |

## 6. Hukuki değerlendirme

| Konu | Değerlendirme |
|---|---|
| Kişisel veri (KVKK / GDPR) | Uygulama kişisel veri işlemiyor ve iletmiyor; veriler yalnızca kullanıcının cihazında. Gizlilik politikası bunu açıkça söylüyor. Risk düşük. |
| Çocuklar (COPPA) | Veri toplanmıyor; "Kids" kategorisi seçilmemeli (ek kurallar getirir). |
| Telif — görseller ve ses | Maymun, sahneler, 88 eşya, ikon ve ortam sesleri özgün; uygulamada hazır görsel/ses yok. |
| Telif — yazı tipi ve kütüphaneler | Nunito (SIL OFL 1.1), React (MIT), Lucide (ISC), Capacitor (MIT). Lisans metinleri uygulamaya gömülü (Ayarlar → Hakkında → Acknowledgements) ✔ |
| Marka | "Pomodoro" (tescilli marka) kaldırıldı ✔. Apple'ın adı yalnızca tanımlayıcı olarak geçiyor. "Marmo Focus" için resmi marka taraması yapılmadı (1. bölüm, madde 5). |
| Sanal para | Banana Coins satın alınamıyor, para değeri yok; kumar/ganimet kutusu kuralları uygulanmaz. Kullanım koşullarında belirtildi. |
| Sağlık iddiası | Yok; koşullarda "profesyonel tavsiye değildir" maddesi var. |
| Tanıtım videosu müziği | Benim bestem: serbest. "Momo Island" (Free To Use): kaynak gösterme şartı var; reklamda kullanmak için lisans gerekebilir. |
| Kullanım koşulları | Apple'ın standart EULA'sına atıf yapıyor; App Store Connect'te ayrıca özel EULA yüklemen gerekmiyor. |

Bu değerlendirme bir avukat görüşü değildir; ticari büyüme planlıyorsan bir hukukçuya göstermen iyi olur.
