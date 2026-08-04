# 🚀 CV Analiz Platformu

CV Analiz Platformu; adayların Özgeçmiş (CV) metinlerini veya görsel CV yüklemelerini, işverenlerin belirlediği dinamik kriterlere göre Google Gemini AI altyapısı kullanarak saniyeler içinde analiz eden, puanlayan ve sonuçları detaylı raporlar halinde sunan profesyonel bir web uygulamasıdır.

---

## 🛠️ Proje Tanımı ve Teknolojiler

Bu proje, ölçeklenebilir ve modern bir web mimarisi üzerinde inşa edilmiştir. Sistem mimarisinde yer alan temel teknolojiler ve kullanım amaçları aşağıda özetlenmiştir:

- **Express.js (Backend REST API):** HTTP isteklerini karşılayan, rotaları (routes) yöneten, API isteklerini işleyen ve veritabanı ile iletişimi sağlayan esnek Node.js sunucu çatısı.
- **Mongoose / MongoDB (Veritabanı Katmanı):** Başvuru verilerini, CV içeriklerini, analiz sonuçlarını ve tarihçeyi esnek ve yüksek performanslı NoSQL belge yapısında depolayan ORM/ODB katmanı. (Canlı ortamda `process.env.MONGODB_URI` desteği ile yerel MongoDB veya `MongoMemoryServer` yedek mekanizması mevcuttur).
- **Google Gemini AI (`@google/generative-ai`):** Yüklenen CV metni ve görsellerini doğal dil işleme (NLP) ile analiz ederek adayların güçlü/zayıf yönlerini çıkartan ve 0-100 arası uygunluk skoru üreten yapay zeka entegrasyonu. (Kota sınırlarında devreye giren Akıllı Kural Motoru yedek mekanizması içerir).
- **Playwright (Otomatik Uçtan Uca Test):** Uygulamanın ön yüz (UI) bileşenlerini, form gönderimlerini, modal etkileşimlerini ve uçtan uca (E2E) kullanıcı senaryolarını otomatize eden test altyapısı.
- **Tailwind CSS (Ön Yüz Tasarımı):** Modern koyu tema (dark mode), cam efekti (glassmorphic UI), duyarlı (responsive) grid düzenleri ve pürüzsüz mikro animasyonlar sunan stil kütüphanesi.

---

## 🚀 Kurulum ve Çalıştırma Adımları

Uygulamayı yerel ortamınızda veya canlı sunucuda çalıştırmak için aşağıdaki adımları takip edin:

### 1. Projeyi Klonlayın ve Bağımlılıkları Yükleyin

```bash
git clone https://github.com/mustafabalci387-tech/cv-analiz.git
cd cv-analiz-platformu
npm install
```

### 2. Ortam Değişkenlerini (.env) Yapılandırın

Proje kök dizininde `.env` adında bir dosya oluşturun ve aşağıdaki ortam değişkenlerini tanımlayın:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cv_analiz_db
GEMINI_API_KEY=sizin_gemini_api_anahtariniz
```

> **Not:** `MONGODB_URI` belirtilmediğinde veya yerel MongoDB servisi kapalı olduğunda sistem otomatik olarak `MongoMemoryServer` (bellek içi geçici veritabanı) başlatır.

### 3. Sunucuyu Başlatın

**Canlı Ortam / Üretim Modu (Production):**
```bash
npm start
```

**Geliştirici Modu (Development):**
```bash
node server.js
```

Sunucu başarıyla başladığında tarayıcınızdan **`http://localhost:3000`** adresine erişebilirsiniz.

---

## 📡 API Dokümantasyonu

Platform, istemci uygulamalar için geniş bir RESTful API seti sunar:

### 1. Başvuru & Analiz Endpoint'leri

#### `POST /api/basvuru`
Yeni bir CV başvurusu kaydeder, Gemini AI ile analizi gerçekleştirir ve veritabanına ekler.

- **İstek Gövdesi (JSON):**
  ```json
  {
    "isim": "Mustafa Barış Balcı",
    "eposta": "baris@example.com",
    "cvMetni": "Node.js, Express ve MongoDB konularında 5 yıl tecrübeli yazılım uzmanı...",
    "arananKriter": "Senior Node.js Backend Developer",
    "gorselVerisi": "data:image/png;base64,..." // Opsiyonel (Görsel CV yüklendiğinde)
  }
  ```
- **Yanıt (201 Created):**
  ```json
  {
    "mesaj": "Başvuru başarıyla kaydedildi.",
    "veri": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "isim": "Mustafa Barış Balcı",
      "eposta": "baris@example.com",
      "uygunlukSkoru": 85,
      "gucluYonler": ["Node.js ve Express.js yetkinlikleri ile doğrudan uyuşuyor."],
      "zayifYonler": ["Docker tecrübesinden bahsedilmemiş."],
      "tarih": "2026-08-04T13:00:00.000Z"
    }
  }
  ```

---

### 2. Aday Başvuruları Yönetimi

#### `GET /api/basvurular`
Silinmemiş tüm aday başvurularını arama ve sayfalama desteğiyle listeler.

- **Query Parametreleri:**
  - `page` *(number, varsayılan: 1)*: Sayfa numarası.
  - `limit` *(number, varsayılan: 6)*: Sayfa başına gösterilecek aday sayısı.
  - `search` *(string, opsiyonel)*: İsim, e-posta veya aranan kriterlerde arama terimi.
- **Yanıt (200 OK):**
  ```json
  {
    "success": true,
    "data": [...],
    "pagination": {
      "total": 12,
      "page": 1,
      "totalPages": 2
    }
  }
  ```

#### `GET /api/basvurular/:id`
Belirtilen ID'ye sahip adayın detay bilgilerini getirir.
- **Yanıt (200 OK):** Aday nesnesi JSON formatında döner.

#### `DELETE /api/basvurular`
Tüm başvuruları mantıksal olarak siler (`silindiMi: true`) ve analiz geçmişini temizler.
- **Yanıt (200 OK):** `{ "mesaj": "Tüm başvurular başarıyla silindi." }`

#### `DELETE /api/basvurular/:id`
Belirtilen ID'ye sahip adayı mantıksal olarak siler (`silindiMi: true`).
- **Yanıt (200 OK):** `{ "mesaj": "Aday başarıyla silindi." }`

---

### 3. Analiz Geçmişi Yönetimi

#### `GET /api/analizler`
Tüm kayıtlı analiz geçmişini arama ve sayfalama desteğiyle listeler.
- **Query Parametreleri:** `page` *(varsayılan: 1)*, `limit` *(varsayılan: 10)*, `search` *(opsiyonel)*.

#### `DELETE /api/analizler`
Tüm analiz geçmişi kayıtlarını kalıcı olarak veritabanından siler.

#### `DELETE /api/analizler/:id`
Belirtilen analizi veritabanından siler.

---

### 4. Test Raporu Endpoint'i

#### `GET /api/test-results`
Playwright E2E testleri sonucunda üretilen özet rapor verilerini (`public/test-results.json`) döner.

---

## 🧪 Otomatik Testler (Playwright)

Projede kullanıcı arayüzü ve uçtan uca iş akışlarının doğrulanması için Playwright kullanılmaktadır.

### Testleri Çalıştırma Komutları

- **Tüm E2E Testlerini Arka Planda Run Etmek:**
  ```bash
  npx playwright test
  ```

- **Testleri Tarayıcı Arayüzü ile (Headed Mode) İzleyerek Çalıştırmak:**
  ```bash
  npx playwright test --headed
  ```

- **Playwright UI Modunda Etkileşimli Çalıştırmak:**
  ```bash
  npx playwright test --ui
  ```

- **Test Sonuçları HTML Raporunu Görüntülemek:**
  ```bash
  npx playwright show-report
  ```

---

## 📄 Lisans

Bu proje ISC lisansı altında korunmaktadır.
