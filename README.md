# 🚀 CV Analiz Platformu (Yapay Zeka Destekli)

Bu proje, işverenlerin veya İK uzmanlarının sisteme yükledikleri CV'leri **belirledikleri dinamik kriterlere göre** yapay zeka (Gemini 2.0 Flash) ile saniyeler içinde analiz etmelerini sağlayan modern bir web uygulamasıdır.

## 🌟 Özellikler

*   **🤖 Yapay Zeka Analizi:** Google Gemini API entegrasyonu ile CV metninden güçlü ve zayıf yönleri çıkarma.
*   **🎯 Dinamik Kriter:** Sadece sabit bir rol için değil, "Aranan Pozisyon/Kriter" alanına girilen herhangi bir kritere göre (Örn: "En az 3 yıl deneyimli Go Developer") analiz yapabilme yeteneği.
*   **📊 Akıllı Skorlama:** Adayın yetkinliklerini 100 üzerinden otomatik skorlama ve görsel "Skor Halkası" ile sunma.
*   **🛡️ Hata Toleransı (Fallback):** Gemini API kota sınırına (429) ulaşsa dahi, sistem çökmek yerine hazır yedek veri devreye girer ve başvuru kayıt süreci kesintisiz devam eder.
*   **💾 Veritabanı:** Analiz edilen başvuruların doğrudan yerel MongoDB'ye kaydedilmesi.
*   **🎨 Premium Arayüz:** TailwindCSS ile hazırlanmış koyu tema, yüksek kontrastlı cam efekti (glassmorphism) ve pürüzsüz animasyonlar.

## 🛠️ Kullanılan Teknolojiler

*   **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS
*   **Backend:** Node.js, Express.js
*   **Veritabanı:** MongoDB (Mongoose ORM)
*   **Yapay Zeka:** `@google/generative-ai` (Gemini API)
*   **Diğer:** CORS, Dotenv

## 🚀 Kurulum & Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/mustafabalci387-tech/cv-analiz.git
cd cv-analiz-platformu
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Ortam Değişkenlerini (Env) Ayarlayın
Proje ana dizininde bir `.env` dosyası oluşturun ve Gemini API anahtarınızı ile port bilginizi girin:
```env
PORT=3000
GEMINI_API_KEY=sizin_gemini_api_anahtariniz
```

### 4. MongoDB Bağlantısı
Bilgisayarınızda **MongoDB Community Server**'ın kurulu ve çalışıyor (`localhost:27017`) olduğundan emin olun.

### 5. Sunucuyu Başlatın
```bash
node server.js
```
Terminalde `MongoDB yerel veritabanı bağlantısı başarılı.` ve `Sunucu 3000 portunda çalışıyor.` mesajlarını gördükten sonra tarayıcınızda **http://localhost:3000** adresine gidebilirsiniz.

## 🤝 Katkıda Bulunma

Bu proje geliştirilmeye açıktır. Pull request (PR) göndermekten çekinmeyin!

1. Bu projeyi fork'layın.
2. Kendi feature branch'inizi oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Harika bir özellik eklendi'`)
4. Branch'inizi push'layın (`git push origin feature/YeniOzellik`)
5. Bir Pull Request açın.

---
*Geliştirici: Barış Balcı*
