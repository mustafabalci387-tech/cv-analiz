# 🚀 Yapay Zeka Destekli CV Analiz Platformu (AI Resume Analyzer)

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tests-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**CV Analiz Platformu**, adayların özgeçmiş (CV) metinlerini veya görsel/PDF formatındaki belgelerini işverenlerin belirlediği kriterlere göre **Google Gemini Multimodal AI** altyapısıyla anında analiz eden, puanlayan ve kapsamlı değerlendirme raporları sunan kurumsal düzeyde tam yığın (full-stack) bir web uygulamasıdır.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🤖 Multimodal Yapay Zeka ile CV Analizi
- **Çoklu Format Desteği:** Düz metin girişi, PDF dokümanları (istemci taraflı `pdf.js` ile metin ayrıştırma) ve görsel CV yüklemeleri (PNG/JPG/WEBP).
- **Gemini 2.0 Flash Entegrasyonu:** İş ilanı kriterleri ile CV metnini karşılaştırarak 0-100 arası uygunluk skoru, güçlü yönler ve gelişim alanlarını çıkarır.
- **Akıllı Kural Motoru (Smart Rule Fallback):** API kotası sınırlarında veya internet kesintilerinde kesintisiz hizmet sunan yerel kural motoru yedek mekanizması.

### 2. 📊 Aday İstatistik Dashboard'u & Grafikler
- **Özet Metrik Kartları:** Toplam Başvuru, Ortalama Uygunluk Skoru ve Mükemmel Aday Sayısı (80+ puan).
- **Dinamik Grafik Görselleştirmeleri (Chart.js):**
  - **Pasta Grafiği (Doughnut):** Başvuru skor dağılımı (Mükemmel, İyi, Gelişime Açık, Yetersiz).
  - **Çubuk Grafiği (Bar Chart):** Pozisyon / kriter bazlı başvuru yoğunluğu.

### 3. 📑 Aday Yönetim Paneli ve Gelişmiş Filtreleme
- **Canlı Arama & Filtreleme:** İsim ve kriter bazlı anlık arama, skor kategorisine göre filtreleme (Tüm Skorlar, 80+ Mükemmel, 50-79 Orta, 0-49 Düşük).
- **Sayfalama (Pagination):** Büyük veri setlerinde hızlı ve akıcı gezinme.
- **Aday Detay Modalı:** Güçlü/zayıf yönler, yüklenen görsel CV ve tam başvuru detaylarına hızlı erişim.

### 4. 📄 Profesyonel Raporlama (PDF & CSV Export)
- **PDF Analiz Raporu:** `html2pdf.js` entegrasyonu ile analiz sonucunu veya aday detayını tek tıkla şık bir PDF dokümanı olarak indirme.
- **CSV / Excel Dışa Aktarma:** `\uFEFF` UTF-8 BOM desteği ile Türkçe karakterleri bozmadan tüm aday verilerini Excel uyumlu CSV formatında dışa aktarma.

### 5. 🔒 Güvenlik & Performans Mimarisi
- **XSS & Input Sanitization:** Tüm kullanıcı girdileri backend ve frontend seviyesinde temizlenerek XSS enjeksiyonları engellenir.
- **In-Memory Rate Limiter:** Belirli IP adreslerinden gelen aşırı istekleri sınırlandıran hafıza içi hız sınırlayıcı middleware.
- **Bellek İçi Önbellekleme (In-Memory Cache):** Sık sorgulanan API istekleri için 30 saniyelik TTL ile hızlı yanıt (`X-Cache: HIT / MISS` başlıkları) ve veri güncellemelerinde otomatik geçersiz kılma (cache invalidation).
- **Yönetici Girişi (Admin Auth):** Yetkisiz erişimlere karşı Aday Yönetim Paneli ve Dashboard alanlarını kilitleyen `localStorage` token tabanlı güvenli oturum kontrolü.

### 6. 🎨 Modern & Akıcı Arayüz (60 FPS UI/UX)
- **Toast Bildirim Sistemi:** Ekranda dinamik olarak beliren, animasyonlu ve otomatik kaybolan renk kodlu bildirimler.
- **Donanım Hızlandırma:** GPU optimizasyonu, akıcı kaydırma (`smooth scroll`) ve mobil uyumlu (responsive) esnek düzenler.
- **Canlı Sağlık Durumu (Health Check):** Navigasyon barında sunucu ve veritabanı bağlantı durumunu anlık izleyen dinamik durum rozeti.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji / Kütüphane | Açıklama |
|---|---|---|
| **Backend** | **Node.js & Express.js (v5)** | RESTful API, Routing, Caching & Security Middleware |
| **Veritabanı** | **MongoDB & Mongoose (v9)** | NoSQL Veritabanı (MongoMemoryServer yedek desteği ile) |
| **Yapay Zeka** | **Google Generative AI** | Gemini 2.0 Flash / Gemini 1.5 Flash Multimodal NLP |
| **Frontend** | **Vanilla HTML5 & Saf JavaScript** | Hızlı, bağımlılıksız, saf JS (ES6+) mimarisi |
| **Stil & Arayüz** | **Tailwind CSS (CDN)** | Koyu Tema (Dark Mode), Glassmorphism & Responsive Tasarım |
| **Grafik & Görselleştirme** | **Chart.js (v4)** | Skor ve Kriter İstatistik Grafikleri |
| **Doküman & PDF** | **PDF.js & html2pdf.js** | İstemci tarafı PDF okuma ve dışa aktarma |
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

### 1. Yeni Başvuru ve CV Analizi
- **Uç Nokta:** `POST /api/basvuru`
- **İstek Gövdesi (JSON):**
```json
{
  "isim": "Ahmet Yılmaz",
  "eposta": "ahmet@example.com",
  "arananKriter": "Senior Frontend Developer",
  "cvMetni": "React, TypeScript, Next.js ve Tailwind CSS konularında 5 yıl deneyimli...",
  "gorselVerisi": "data:image/png;base64,..."
}
```
- **Başarılı Yanıt (201 Created):**
```json
{
  "mesaj": "CV analizi başarıyla tamamlandı.",
  "veri": {
    "_id": "66bc...",
    "isim": "Ahmet Yılmaz",
    "eposta": "ahmet@example.com",
    "arananKriter": "Senior Frontend Developer",
    "uygunlukSkoru": 92,
    "gucluYonler": ["Kapsamlı React ekosistemi tecrübesi", "Modern CSS mimarileri"],
    "zayifYonler": ["Test otomasyonu detaylandırılabilir"],
    "tarih": "2026-08-15T00:00:00.000Z"
  }
}
```

---

### 2. Aday Başvurularını Listeleme (Önbellekli & Sayfalanmış)
- **Uç Nokta:** `GET /api/basvurular`
- **Sorgu Parametreleri (Query Params):**
  - `page` (varsayılan: `1`): Sayfa numarası
  - `limit` (varsayılan: `6`): Sayfa başına kayıt sayısı
  - `search` (isteğe bağlı): İsim veya kriter arama metni
  - `scoreFilter` (isteğe bağlı): `all`, `high` (80+), `mid` (50-79), `low` (0-49)
- **HTTP Başlıkları:** `X-Cache: HIT` (Önbellekten) veya `X-Cache: MISS` (Veritabanından)
- **Başarılı Yanıt (200 OK):**
```json
{
  "success": true,
  "data": [...],
  "toplam": 24,
  "toplamSayfa": 4,
  "mevcutSayfa": 1
}
```

---

### 3. Aday Kaydı Silme
- **Tekil Silme:** `DELETE /api/basvurular/:id` → 200 OK
- **Toplu Silme:** `DELETE /api/basvurular` → 200 OK

---

### 4. Yönetici Girişi (Admin Authentication)
- **Uç Nokta:** `POST /api/auth/login`
- **İstek Gövdesi (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- **Başarılı Yanıt (200 OK):**
```json
{
  "success": true,
  "token": "admin-token-123",
  "mesaj": "Giriş başarılı."
}
```

---

### 5. Sistem Sağlık Durumu (Health Check)
- **Uç Nokta:** `GET /api/health`
- **Başarılı Yanıt (200 OK):**
```json
{
  "status": "OK",
  "db": "Connected",
  "dbState": "connected",
  "uptime": "1420 saniye",
  "env": "production",
  "timestamp": "2026-08-15T00:00:00.000Z"
}
```

---

## 🧪 Uçtan Uca (E2E) Test Paketi

Proje, **Playwright** test çatısı ile Chromium, Firefox ve WebKit tarayıcılarında çalışan 11 farklı test senaryosuna ve toplam 33 bağımsız doğrulamaya sahiptir.

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
├── models/
│   └── Analysis.js          # Mongoose Veri Şeması ve Modeli
├── public/
│   ├── index.html           # SPA Tek Sayfa Arayüzü, Chart.js & Toast Yönetimi
│   └── test-results.json    # Otomatik Test Rapor Çıktısı
├── tests/
│   └── app.spec.js          # Playwright Uçtan Uca (E2E) Test Paketi
├── .dockerignore            # Docker İmajı Hariç Tutma Listesi
├── .env                     # Ortam Değişkenleri Yapılandırması
├── docker-compose.yml       # Docker Compose Servis Orkestrasyonu
├── Dockerfile               # Node:20-Alpine Tabanlı Optimize Docker İmajı
├── package.json             # NPM Bağımlılıkları ve Script Tanımları
├── playwright.config.js     # Playwright Test Yapılandırması
├── server.js                # Express REST API, Caching, AI & Auth Sunucusu
└── README.md                # Kapsamlı Teknik Proje Dokümantasyonu
```

---

## 📄 Lisans

Bu proje **MIT Lisansı** kapsamında açık kaynak olarak geliştirilmiştir.
