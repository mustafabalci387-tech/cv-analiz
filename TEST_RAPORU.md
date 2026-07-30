# 📊 CV Analiz Platformu - E2E Test İstatistikleri ve Raporu

**Son Test Yürütme Tarihi:** 2026-07-29T13:18:01.971Z  
**Toplam Çalışma Süresi:** 16.1 saniye  
**Test Çalıştırma Modu:** Parallel (3 Tarayıcı Motoru: Chromium, Firefox, WebKit)  
**Genel Başarı Oranı:** %100 (9/9 Geçti)

---

## 📈 Özet İstatistikler (`public/test-results.json`)

| Metrik | Değer | Durum |
| :--- | :--- | :--- |
| **Toplam Beklenen Test (`expected`)** | 9 | ✅ |
| **Başarılı Testler** | 9 | ✅ PASS |
| **Başarısız Testler (`unexpected`)** | 0 | 🎉 CLEAN |
| **Atlanan Testler (`skipped`)** | 0 | - |
| **Kararsız Testler (`flaky`)** | 0 | - |
| **Toplam Hata Sayısı (`errors`)** | 0 | - |

---

## 🧪 Detaylı Test Listesi ve Tarayıcı Motorları

### 1. Uçtan Uca CV Analizi ve Form Testi
* `[chromium]` › Formu doldurma, gönderme ve sonuç ekranının açıldığını doğrulama — **PASS**
* `[firefox]`  › Formu doldurma, gönderme ve sonuç ekranının açıldığını doğrulama — **PASS**
* `[webkit]`   › Formu doldurma, gönderme ve sonuç ekranının açıldığını doğrulama — **PASS**

### 2. Geçmiş Analizler ve Arama Testi
* `[chromium]` › Arama kutusuna metin yazma, filtreleme ve sayfalama kontrolleri — **PASS**
* `[firefox]`  › Arama kutusuna metin yazma, filtreleme ve sayfalama kontrolleri — **PASS**
* `[webkit]`   › Arama kutusuna metin yazma, filtreleme ve sayfalama kontrolleri — **PASS**

### 3. Aday Detay Modalı Testi
* `[chromium]` › Detaylar butonuna basma, modalın açıldığını ve kapatıldığını doğrulama — **PASS**
* `[firefox]`  › Detaylar butonuna basma, modalın açıldığını ve kapatıldığını doğrulama — **PASS**
* `[webkit]`   › Detaylar butonuna basma, modalın açıldığını ve kapatıldığını doğrulama — **PASS**

---

## 🌐 Canlı Rapor Bağlantıları

- **HTML İnteraktif Rapor:** [http://localhost:3000/playwright-report](http://localhost:3000/playwright-report)
- **JSON Test İstatistik API:** [http://localhost:3000/api/test-results](http://localhost:3000/api/test-results)
- **Test Dosyası:** [tests/app.spec.js](file:///c:/Users/Barış/Desktop/cv-analiz-platformu/tests/app.spec.js)

---

## 🚀 Testleri Yeniden Çalıştırma Komutu

```bash
npx playwright test
```
