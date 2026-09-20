# 🚀 Yapay Zeka Destekli CV Analiz Platformu (AI Resume Analyzer)

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tests-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**CV Analiz Platformu**, adayların özgeçmiş (CV) metinlerini veya görsel/PDF formatındaki belgelerini işverenlerin belirlediği kriterlere göre **Google Gemini Multimodal AI** altyapısıyla anında analiz eden, puanlayan ve kapsamlı değerlendirme raporları sunan kurumsal düzeyde tam yığın (full-stack) bir web uygulamasıdır.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🤖 Multimodal Yapay Zeka ile CV Analizi
- **Çoklu Format Desteği:** Düz metin girişi, PDF dokümanları (istemci taraflı `pdf.js` ile metin ayrıştırma) ve görsel CV yüklemeleri (PNG/JPG/WEBP).
- **Gemini 2.0 Flash Entegrasyonu:** İş ilanı kriterleri ile CV metnini karşılaştırarak 0-100 arası uygunluk skoru, güçlü yönler ve gelişim alanlarını çıkarır.
- **Akıllı Kural Motoru (Smart Rule Fallback):** API kotası sınırlarında veya internet kesintilerinde kesintisiz hizmet sunan yerel kural motoru yedek mekanizması.

### 2. 🧠 Açıklanabilir Yapay Zeka (XAI) & Skor Kırılımı
- **Skor Kırılımı:** Her adayın yapay zeka puanının **nasıl hesaplandığını** açıklayan 3 maddelik detaylı kırılım (Örn: `+ %40: Temel teknik yetkinlik uyumu`, `- %10: Yabancı dil eksikliği`).
- **Şeffaf Değerlendirme:** İşverenler, AI'ın neden o skoru verdiğini tam olarak görebilir ve güvenilirliği doğrulayabilir.

### 3. 🎤 Kişiselleştirilmiş Mülakat Asistanı
- **AI Tabanlı Soru Üretimi:** Her adayın CV'sindeki güçlü ve zayıf yönlerine özel olarak hazırlanmış **3 adet mülakat sorusu** otomatik oluşturulur.
- **Detay Modalında Görüntüleme:** Aday detayında mülakat soruları ayrı bir bölümde listelenir, tek tıkla kopyalanabilir.

### 4. ⚠️ Risk & Çelişki Dedektörü
- **Otomatik Risk Algılama:** CV'deki tutarsızlıklar, kariyer boşlukları veya aşırı abartılı ifadeler yapay zeka tarafından tespit edilir.
- **Sarı Uyarı Rozeti:** Riskli adayların kartlarında `⚠️ Dikkat Noktası` rozeti gösterilir ve detay modalında risk maddeleri listelenir.

### 5. ⚖️ İki Adayı Yan Yana Kıyaslama (Side-by-Side Compare)
- **Checkbox Seçimi:** Aday kartlarında "Kıyasla" checkbox'ı ile en fazla 2 aday seçilir.
- **Kıyaslama Modalı:** Seçilen iki adayın puanları, güçlü/zayıf yönleri, skor kırılımları ve riskleri yan yana iki sütunda karşılaştırılır.

### 6. 📧 Hızlı AI E-posta Şablonları
- **Otomatik Taslak Üretimi:** Aday detayından tek tıkla "Mülakat Daveti" veya "Red Bildirimi" e-posta taslağı oluşturulur.
- **SMTP E-posta Gönderimi:** Yapılandırılan SMTP sunucusu üzerinden analiz özetini HTML formatlı e-posta olarak doğrudan gönderebilme.

### 7. 📊 Aday İstatistik Dashboard'u & Grafikler
- **Özet Metrik Kartları:** Toplam Başvuru, Ortalama Uygunluk Skoru ve Mükemmel Aday Sayısı (80+ puan).
- **Dinamik Grafik Görselleştirmeleri (Chart.js):**
  - **Pasta Grafiği (Doughnut):** Başvuru skor dağılımı (Mükemmel, İyi, Gelişime Açık, Yetersiz).
  - **Çubuk Grafiği (Bar Chart):** Pozisyon / kriter bazlı başvuru yoğunluğu.

### 8. 📑 Aday Yönetim Paneli ve Gelişmiş Filtreleme
- **Canlı Arama & Filtreleme:** İsim ve kriter bazlı anlık arama, skor kategorisine göre filtreleme (Tüm Skorlar, 80+ Mükemmel, 50-79 Orta, 0-49 Düşük).
- **Sektör Kısayolları:** Yazılım/IT, Turizm/Otel, Restoran/Servis, Yönetim & İletişim filtre butonları ile aday listesini anında filtreleme.
- **Kısa Liste (Shortlist):** Yüksek puanlı (%80+) adayları tek tıkla listeleme.
- **Sayfalama (Pagination):** Büyük veri setlerinde hızlı ve akıcı gezinme.
- **Aday Detay Modalı:** Güçlü/zayıf yönler, skor kırılımı, mülakat soruları, riskler ve yüklenen görsel CV'ye hızlı erişim.

### 9. 📄 Profesyonel Raporlama (PDF & CSV Export)
- **Toplu PDF Özet Raporu:** Filtrelenmiş aday listesini kurumsal başlıklı, şık tablolu bir PDF olarak yazdırma/indirme.
- **Bireysel PDF Raporu:** `html2pdf.js` entegrasyonu ile aday detayını tek tıkla PDF dokümanı olarak indirme.
- **CSV / Excel Dışa Aktarma:** `\uFEFF` UTF-8 BOM desteği ile Türkçe karakterleri bozmadan tüm aday verilerini Excel uyumlu CSV formatında dışa aktarma.

### 10. 🔒 Güvenlik, Multi-Tenant İzolasyon & Performans
- **Multi-Tenant Şirket İzolasyonu:** Her şirket yalnızca kendi eklediği adayları görebilir; Admin tüm adayları listeler.
- **Şirket Kayıt Sistemi:** Yeni şirketler kendi hesaplarını oluşturabilir, Admin panelinden tüm şirketler yönetilebilir.
- **JWT Tabanlı Kimlik Doğrulama:** Güvenli token tabanlı oturum yönetimi (`authMiddleware`).
- **XSS & Input Sanitization:** Tüm kullanıcı girdileri backend ve frontend seviyesinde temizlenir.
- **In-Memory Rate Limiter:** Aşırı istekleri sınırlandıran hafıza içi hız sınırlayıcı middleware.
- **Bellek İçi Önbellekleme (In-Memory Cache):** 30 saniyelik TTL ile hızlı yanıt (`X-Cache: HIT / MISS` başlıkları) ve otomatik geçersiz kılma.
- **Soft-Delete & Geri Yükleme:** Silinen adaylar arşive taşınır ve istendiğinde geri getirilebilir.

### 11. 🎨 Modern & Akıcı Arayüz (60 FPS UI/UX)
- **Glassmorphism Tasarım:** Cam efektli kartlar, gradient başlıklar ve koyu tema.
- **Toast Bildirim Sistemi:** Animasyonlu ve otomatik kaybolan renk kodlu bildirimler.
- **Donanım Hızlandırma:** GPU optimizasyonu, akıcı kaydırma ve mobil uyumlu esnek düzenler.
- **Canlı Sağlık Durumu (Health Check):** Navigasyon barında sunucu ve veritabanı bağlantı durumunu anlık izleyen dinamik durum rozeti.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji / Kütüphane | Açıklama |
|---|---|---|
| **Backend** | **Node.js & Express.js (v5)** | RESTful API, Modüler Routing, Caching & Security Middleware |
| **Veritabanı** | **MongoDB & Mongoose (v9)** | NoSQL Veritabanı (MongoMemoryServer yedek desteği ile) |
| **Yapay Zeka** | **Google Generative AI** | Gemini 2.0 Flash Multimodal NLP + XAI Skor Kırılımı |
| **Frontend** | **Vanilla HTML5 & Saf JavaScript** | Hızlı, bağımlılıksız, modüler JS (ES6+ CommonJS) mimarisi |
| **Stil & Arayüz** | **Vanilla CSS & Glassmorphism** | Koyu Tema (Dark Mode), Cam Efektli Kartlar & Responsive Tasarım |
| **Grafik & Görselleştirme** | **Chart.js (v4)** | Skor ve Kriter İstatistik Grafikleri |
| **Doküman & PDF** | **PDF.js & html2pdf.js** | İstemci tarafı PDF okuma ve dışa aktarma |
| **E-posta** | **Nodemailer** | SMTP üzerinden HTML formatlı analiz özeti gönderimi |
| **Test Altyapısı** | **Playwright** | Chromium, Firefox ve WebKit çapraz tarayıcı E2E testleri |
| **Konteynerizasyon** | **Docker & Docker Compose** | Çoklu servis konteyner mimarisi (Node + MongoDB) |

---

## 🚀 Kurulum ve Çalıştırma Adımları

### Gereksinimler
- [Node.js](https://nodejs.org/) (v20 veya üzeri)
- [npm](https://www.npmjs.com/) (v10 veya üzeri)
- [Docker & Docker Compose](https://www.docker.com/) (İsteğe bağlı, konteyner çalıştırma için)

---

### Yöntem 1: Yerel Ortamda Çalıştırma (Local Development)

#### 1. Projeyi Klonlayın ve Bağımlılıkları Yükleyin:
```bash
git clone https://github.com/mustafabalci387-tech/cv-analiz.git
cd cv-analiz-platformu
npm install
```

#### 2. Ortam Değişkenlerini (`.env`) Yapılandırın:
Proje kök dizininde `.env` dosyası oluşturun:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cv_analiz_db
GEMINI_API_KEY=sizin_google_gemini_api_anahtariniz
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=sizin_jwt_gizli_anahtariniz
```

**İsteğe bağlı SMTP yapılandırması (E-posta gönderimi için):**
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kullanici@example.com
SMTP_PASS=sifre
```

> 💡 **Not:** `MONGODB_URI` tanımlanmadığında veya yerel MongoDB servisi kapalı olduğunda sistem otomatik olarak bellek içi `MongoMemoryServer` başlatır; harici veritabanı kurmadan da anında çalışır.

#### 3. Uygulamayı Başlatın:

**Geliştirici Modu (Otomatik Yeniden Başlatma):**
```bash
npm run dev
```

**Üretim / Standart Mod:**
```bash
npm start
```

Tarayıcınızdan **`http://localhost:3000`** adresine giderek uygulamayı kullanabilirsiniz.

---

### Yöntem 2: Docker & Docker Compose ile Tek Komutta Çalıştırma

Docker yüklü herhangi bir sistemde uygulamayı ve MongoDB veritabanını tek adımda ayağa kaldırabilirsiniz:

```bash
docker compose up -d --build
```

- **Uygulama:** `http://localhost:3000`
- **MongoDB:** `localhost:27017` (Kalıcı `mongodb_data` volume ile)

Konteynerleri durdurmak için:
```bash
docker compose down
```

---

## 📡 REST API Uç Noktaları (Endpoints)

### Kimlik Doğrulama (Auth)

| Yöntem | Uç Nokta | Açıklama |
|--------|----------|----------|
| `POST` | `/api/auth/register` | Yeni şirket/kullanıcı kaydı |
| `POST` | `/api/auth/login` | Kullanıcı ve yönetici girişi |
| `GET` | `/api/auth/me` | Aktif oturum bilgisi (JWT gerekli) |
| `GET` | `/api/auth/users` | Tüm kullanıcılar listesi (Yalnızca Admin) |

### CV Başvuru & Analiz

| Yöntem | Uç Nokta | Açıklama |
|--------|----------|----------|
| `POST` | `/api/basvuru` | Yeni CV başvurusu ve AI analizi |
| `GET` | `/api/basvurular` | Başvuruları filtreli, aramalı ve önbellekli listele |
| `GET` | `/api/basvurular/:id` | Tekil başvuru detayı |
| `DELETE` | `/api/basvurular/:id` | Tekil başvuru silme (soft-delete) |
| `POST` | `/api/basvurular/:id/restore` | Silinmiş başvuruyu geri yükleme |
| `DELETE` | `/api/basvurular` | Tüm başvuruları silme |

> 💡 **Geriye Dönük Uyumluluk:** `/api/adaylar` ve `/api/analizler` alias'ları da desteklenir.

### Araçlar

| Yöntem | Uç Nokta | Açıklama |
|--------|----------|----------|
| `POST` | `/api/mail-gonder` | Aday analiz özetini e-posta ile gönder |
| `GET` | `/api/health` | Sistem sağlık durumu (DB, uptime, env) |
| `GET` | `/api/test-results` | E2E test sonuçları raporu |

### Sorgu Parametreleri (Başvuru Listesi)

| Parametre | Varsayılan | Açıklama |
|-----------|-----------|----------|
| `page` | `1` | Sayfa numarası |
| `limit` | `6` | Sayfa başına kayıt |
| `search` | — | İsim veya kriter arama metni |
| `scoreFilter` | `all` | `all`, `high` (80+), `mid` (50-79), `low` (0-49) |

---

### Örnek API İstekleri

**Yeni Başvuru:**
```json
POST /api/basvuru
{
  "isim": "Ahmet Yılmaz",
  "eposta": "ahmet@example.com",
  "arananKriter": "Senior Frontend Developer",
  "cvMetni": "React, TypeScript, Next.js konularında 5 yıl deneyimli...",
  "gorselVerisi": "data:image/png;base64,..."
}
```

**Başarılı Yanıt (201 Created):**
```json
{
  "mesaj": "CV analizi başarıyla tamamlandı.",
  "veri": {
    "_id": "66bc...",
    "isim": "Ahmet Yılmaz",
    "uygunlukSkoru": 92,
    "gucluYonler": ["Kapsamlı React ekosistemi tecrübesi"],
    "zayifYonler": ["Test otomasyonu detaylandırılabilir"],
    "skorKirilimi": ["+ %40: Temel teknik yetkinlik uyumu", "+ %30: Modern framework deneyimi", "- %10: Eksik test kültürü"],
    "mulakatSorulari": ["React performans optimizasyonlarında hangi stratejileri uygularsınız?", "..."],
    "riskler": []
  }
}
```

**Şirket Kaydı:**
```json
POST /api/auth/register
{
  "kullaniciAdi": "teknosoft",
  "sifre": "guvenli_sifre_123",
  "sirketAdi": "TeknoSoft A.Ş.",
  "eposta": "hr@teknosoft.com"
}
```

---

## 🧪 Uçtan Uca (E2E) Test Paketi

Proje, **Playwright** test çatısı ile Chromium, Firefox ve WebKit tarayıcılarında çalışan 11 farklı test senaryosuna ve toplam **33 bağımsız doğrulamaya** sahiptir.

### Testleri Çalıştırma:
```bash
# Tüm testleri paralel çalıştır
npx playwright test
```

### Görsel Test Raporunu İnceleme:
```bash
# HTML test raporunu tarayıcıda aç
npx playwright show-report
```

### Kapsanan Test Senaryoları:
1. **Uçtan Uca CV Analizi ve Form Gönderimi:** Form doldurma, yapay zeka analiz sonucu ve skor doğrulaması.
2. **Geçmiş Analizler ve Arama:** Arama kutusu filtreleme ve sayfalama düğmeleri.
3. **Aday Detay Modalı:** Detay butonları, içerik doğrulaması ve modal kapatma.
4. **PDF Raporu İndirme Butonları:** Sonuç ekranı ve modal içi PDF indirme aksiyonları.
5. **Aday İstatistik Dashboard'u ve Grafikler:** Özet kartlar ve Canvas grafik elemanları.
6. **CSV Dışa Aktarma ve Skor Filtreleme:** Skor aralığı filtreleri ve CSV indirme tetikleyicisi.
7. **Canlı Ortam Sağlık Kontrolü (Health Check):** `/api/health` endpoint ve ön yüz durum rozeti.
8. **Bellek İçi Önbellekleme (In-Memory Caching):** `X-Cache: MISS` ve `X-Cache: HIT` başlık doğrulaması.
9. **Güvenlik ve Girdi Temizleme (XSS & Rate Limiter):** Script enjeksiyon güvenliği ve hız sınırı kontrolü.
10. **Yönetici Girişi (Admin Auth) ve Panel Kilitleme:** Oturum açma, panel görünürlüğü ve oturum kapatma.
11. **UI/UX Toast Bildirimleri ve Mobil Düzen:** Hata/başarı bildirimleri ve kapatma butonları.

---

## 📁 Proje Dizin Yapısı

```text
cv-analiz-platformu/
├── config/
│   └── db.js                    # MongoDB bağlantı yöneticisi (MongoMemoryServer yedekli)
├── controllers/
│   ├── authController.js        # Giriş, kayıt, profil ve kullanıcı listeleme
│   └── cvController.js          # Başvuru CRUD, multi-tenant filtreleme, istatistik, e-posta
├── middleware/
│   ├── authMiddleware.js        # JWT doğrulama ve admin yetki kontrolü
│   └── rateLimiter.js           # IP bazlı in-memory hız sınırlayıcı
├── models/
│   ├── Aday.js                  # Aday referans şeması
│   ├── Analysis.js              # Ana analiz veri modeli (skor, XAI, risk, mülakat)
│   └── User.js                  # Kullanıcı / Şirket modeli (JWT & rol yönetimi)
├── routes/
│   ├── authRoutes.js            # Auth API rotaları (/api/auth/*)
│   └── cvRoutes.js              # CV & Başvuru API rotaları (/api/*)
├── services/
│   ├── geminiService.js         # Gemini AI analiz, XAI skor kırılımı, mülakat & risk üretimi
│   └── mailService.js           # Nodemailer SMTP e-posta gönderim servisi
├── public/
│   ├── css/
│   │   └── style.css            # Glassmorphism, animasyonlar, rozet ve scrollbar stilleri
│   ├── js/
│   │   ├── app.js               # Ana uygulama orkestratörü (CV, analiz, modal, PDF, grafik)
│   │   ├── auth.js              # Oturum yönetimi (giriş, kayıt, sağlık kontrolü)
│   │   └── compare.js           # İki adayı yan yana kıyaslama modülü
│   ├── index.html               # SPA tek sayfa HTML iskeleti
│   └── test-results.json        # Otomatik test rapor çıktısı
├── tests/
│   └── app.spec.js              # 33 Playwright E2E test senaryosu (3 tarayıcı)
├── .dockerignore                # Docker imajı hariç tutma listesi
├── .env                         # Ortam değişkenleri yapılandırması
├── docker-compose.yml           # Docker Compose servis orkestrasyonu (Node + MongoDB)
├── Dockerfile                   # Node:20-Alpine tabanlı optimize Docker imajı
├── package.json                 # NPM bağımlılıkları ve script tanımları
├── playwright.config.js         # Playwright test yapılandırması (3 tarayıcı)
├── render.yaml                  # Render.com bulut dağıtım yapılandırması
├── server.js                    # Minimal Express giriş noktası (~36 satır)
└── README.md                    # Kapsamlı teknik proje dokümantasyonu
```

---

## 🏗️ Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────────┐
│                        İstemci (Browser)                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │ index.html│  │  app.js  │  │  auth.js  │  │  compare.js   │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼───────────────────────────────────────┐
│                     server.js (Express v5)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ authRoutes  │  │  cvRoutes    │  │  Middleware             │ │
│  │ /api/auth/* │  │  /api/*      │  │  (JWT, RateLimiter)     │ │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────────┘ │
│         │                │                                      │
│  ┌──────▼──────┐  ┌──────▼───────┐                             │
│  │   authCtrl  │  │   cvCtrl     │                             │
│  └─────────────┘  └──────┬───────┘                             │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────┐      │
│  │              Services                                 │      │
│  │  ┌──────────────────┐  ┌───────────────────────────┐ │      │
│  │  │  geminiService   │  │     mailService           │ │      │
│  │  │  (AI + XAI +     │  │     (SMTP E-posta)        │ │      │
│  │  │   Risk )│  │                           │ │      │
│  │  └──────────────────┘  └───────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────┐      │
│  │  MongoDB (Mongoose) / MongoMemoryServer (yedek)      │      │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────────────┐ │      │
│  │  │ Analysis │  │    User    │  │      Aday        │ │      │
│  │  └──────────┘  └────────────┘  └──────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 Lisans

Bu proje **MIT Lisansı** kapsamında açık kaynak olarak geliştirilmiştir.
