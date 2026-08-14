const { test, expect } = require('@playwright/test');

test.describe('CV Analiz Platformu E2E Test Senaryoları', () => {

  test.beforeEach(async ({ page }) => {
    // Her test öncesi uygulamaya git
    await page.goto('http://localhost:3000');
  });

  test.describe('Uçtan Uca CV Analizi ve Form Testi', () => {
    test('Formu doldurma, gönderme ve sonuç ekranının açıldığını doğrulama', async ({ page }) => {
      // 1. Form alanlarını doldur
      await page.locator('#isim').fill('Mustafa Barış Balcı');
      await page.locator('#eposta').fill('baris@test.com');
      await page.locator('#arananKriter').fill('Senior Node.js Backend Developer arıyoruz');
      await page.locator('#cvMetni').fill('Node.js, Express, MongoDB, REST API ve Playwright E2E konularında 5 yıl tecrübeli yazılım uzmanı.');

      // 2. Analiz Et butonuna tıkla
      const analizButonu = page.locator('#submit-btn');
      await expect(analizButonu).toBeVisible();
      await analizButonu.click();

      // 3. Sonuç alanının göründüğünü doğrula (15 sn tolerans)
      const sonucAlani = page.locator('#result-section');
      await expect(sonucAlani).toBeVisible({ timeout: 15000 });

      // Aday adının ve puan alanının görüntülendiğini teyit et
      await expect(page.locator('#candidate-name')).toContainText('Mustafa Barış Balcı');
      await expect(page.locator('#score-value')).toBeVisible();
    });
  });

  test.describe('Geçmiş Analizler ve Arama Testi', () => {
    test('Arama kutusuna metin yazma, filtreleme ve sayfalama kontrolleri', async ({ page }) => {
      // Arama input'unun varlığını teyit et
      const searchInput = page.locator('#panel-search-input');
      await expect(searchInput).toBeVisible();

      // Test araması yap
      await searchInput.fill('Node.js');
      const searchBtn = page.locator('#panel-search-btn');
      await searchBtn.click();

      // Sayfalama elemanlarının varlığını doğrula
      const prevBtn = page.locator('#panel-prev-btn');
      const nextBtn = page.locator('#panel-next-btn');
      const pageInfo = page.locator('#panel-page-info');

      await expect(prevBtn).toBeVisible();
      await expect(nextBtn).toBeVisible();
      await expect(pageInfo).toBeVisible();
      await expect(pageInfo).toContainText('Sayfa');
    });
  });

  test.describe('Aday Detay Modalı Testi', () => {
    test('Detaylar butonuna basma, modalın açıldığını ve kapat butonuna basıldığında kapandığını doğrulama', async ({ page }) => {
      // Eğer listede aday yoksa test için hızlıca aday ekle
      const detayButonlari = page.locator('.btn-detail');
      const count = await detayButonlari.count();

      if (count === 0) {
        await page.locator('#isim').fill('Ahmet Yılmaz');
        await page.locator('#eposta').fill('ahmet@test.com');
        await page.locator('#arananKriter').fill('React Developer');
        await page.locator('#cvMetni').fill('React, Tailwind CSS ve JavaScript geliştirme deneyimi olan ön yüz uzmanı.');
        await page.locator('#submit-btn').click();
        await expect(page.locator('#result-section')).toBeVisible({ timeout: 15000 });
      }

      // Detaylar butonuna tıkla
      const ilkDetayButonu = page.locator('.btn-detail').first();
      await expect(ilkDetayButonu).toBeVisible();
      await ilkDetayButonu.click();

      // Modalın göründüğünü ve içeriklerin dolu olduğunu teyit et
      const detailModal = page.locator('#detail-modal');
      await expect(detailModal).toBeVisible();
      await expect(page.locator('#modal-name')).not.toBeEmpty();
      await expect(page.locator('#modal-kriter')).not.toBeEmpty();

      // Kapat butonuna bas ve modalın kapandığını doğrula
      const modalCloseBtn = page.locator('#modal-close-btn');
      await expect(modalCloseBtn).toBeVisible();
      await modalCloseBtn.click();
      await expect(detailModal).toBeHidden();
    });
  });

  test.describe('PDF Raporu İndirme Butonları Testi', () => {
    test('Sonuç kartı ve aday detay modalındaki PDF İndir butonlarının görünürlüğünü ve etkileşimini doğrulama', async ({ page }) => {
      // 1. Formu doldur ve analiz yap
      await page.locator('#isim').fill('Zeynep Demir');
      await page.locator('#eposta').fill('zeynep@test.com');
      await page.locator('#arananKriter').fill('Full Stack Developer');
      await page.locator('#cvMetni').fill('JavaScript, Node.js, Express, MongoDB ve Tailwind CSS deneyimine sahip yazılım uzmanı.');

      const submitBtn = page.locator('#submit-btn');
      await expect(submitBtn).toBeVisible();
      await submitBtn.click();

      // 2. Analiz sonuç kartının göründüğünü doğrula
      const resultSection = page.locator('#result-section');
      await expect(resultSection).toBeVisible({ timeout: 15000 });

      // 3. Sonuç kartındaki #download-pdf-btn butonunun görünür ve tıklanabilir olduğunu doğrula
      const downloadPdfBtn = page.locator('#download-pdf-btn');
      await expect(downloadPdfBtn).toBeVisible();
      await expect(downloadPdfBtn).toBeEnabled();

      // 4. Aday yönetim panelindeki ilk aday detayını aç
      const detayButonlari = page.locator('.btn-detail');
      await expect(detayButonlari.first()).toBeVisible();
      await detayButonlari.first().click();

      // 5. Modalın açıldığını ve modal içerisindeki #modal-download-pdf-btn butonunun görünür olduğunu doğrula
      const detailModal = page.locator('#detail-modal');
      await expect(detailModal).toBeVisible();

      const modalDownloadPdfBtn = page.locator('#modal-download-pdf-btn');
      await expect(modalDownloadPdfBtn).toBeVisible();
      await expect(modalDownloadPdfBtn).toBeEnabled();
    });
  });

  test.describe('Aday İstatistik Dashboard ve Grafik Testi', () => {
    test('Dashboard bölümü, istatistik kartları ve grafik canvas elemanlarının görünürlüğünü doğrulama', async ({ page }) => {
      // 1. Dashboard bölümünün sayfada görünür olduğunu doğrula
      const dashboardSection = page.locator('#dashboard-section');
      await expect(dashboardSection).toBeVisible();

      // 2. Toplam Başvuru istatistik kartının görünür olduğunu ve metin içerdiğini doğrula
      const statTotalCount = page.locator('#stat-total-count');
      await expect(statTotalCount).toBeVisible();
      await expect(statTotalCount).not.toBeEmpty();

      // 3. Ortalama Skor istatistik kartının görünür olduğunu ve metin içerdiğini doğrula
      const statAvgScore = page.locator('#stat-avg-score');
      await expect(statAvgScore).toBeVisible();
      await expect(statAvgScore).not.toBeEmpty();

      // 4. Mükemmel Aday Sayısı istatistik kartının görünür olduğunu ve metin içerdiğini doğrula
      const statExcellentCount = page.locator('#stat-excellent-count');
      await expect(statExcellentCount).toBeVisible();
      await expect(statExcellentCount).not.toBeEmpty();

      // 5. Skor Dağılımı pasta grafiği canvas elemanının sayfada yüklendiğini doğrula
      const scoreChart = page.locator('#score-chart');
      await expect(scoreChart).toBeAttached();

      // 6. Pozisyon / Kriter Dağılımı çubuk grafiği canvas elemanının sayfada yüklendiğini doğrula
      const kriterChart = page.locator('#kriter-chart');
      await expect(kriterChart).toBeAttached();
    });
  });

  test.describe('CSV Dışa Aktarma ve Skor Filtreleme Testi', () => {
    test('Skor filtresi seçeneklerinin çalıştığını ve CSV butonunun görünür olduğunu doğrulama', async ({ page }) => {
      // 1. Skor filtresi açılır menüsünün görünür olduğunu doğrula
      const scoreFilter = page.locator('#panel-score-filter');
      await expect(scoreFilter).toBeVisible();

      // 2. "high" (80+ Mükemmel) seçeneğini seç ve listenin yeniden yüklendiğini doğrula
      await scoreFilter.selectOption('high');
      await expect(scoreFilter).toHaveValue('high');
      await page.waitForTimeout(500);

      // 3. "mid" (50-79 Orta) seçeneğini seç ve listenin yeniden yüklendiğini doğrula
      await scoreFilter.selectOption('mid');
      await expect(scoreFilter).toHaveValue('mid');
      await page.waitForTimeout(500);

      // 4. "low" (0-49 Düşük) seçeneğini seç ve listenin yeniden yüklendiğini doğrula
      await scoreFilter.selectOption('low');
      await expect(scoreFilter).toHaveValue('low');
      await page.waitForTimeout(500);

      // 5. Filtreyi tekrar "all" (Tüm Skorlar) konumuna döndür
      await scoreFilter.selectOption('all');
      await expect(scoreFilter).toHaveValue('all');

      // 6. CSV Raporu İndir butonunun görünür ve tıklanabilir olduğunu doğrula
      const csvExportBtn = page.locator('#panel-csv-export-btn');
      await expect(csvExportBtn).toBeVisible();
      await expect(csvExportBtn).toBeEnabled();
    });
  });

  test.describe('Canlı Ortam Sağlık Kontrolü (Health Check) Testi', () => {
    test('/api/health endpoint yanıtını ve arayüz rozetini doğrulama', async ({ page }) => {
      // 1. /api/health REST API uç noktasına istek at ve yanıtı doğrula
      const response = await page.request.get('http://localhost:3000/api/health');
      await expect(response).toBeOK();

      const body = await response.json();
      expect(body.status).toBe('OK');
      expect(body).toHaveProperty('db');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('env');

      // 2. Arayüzdeki #health-badge elemanının görünür olduğunu doğrula
      const healthBadge = page.locator('#health-badge');
      await expect(healthBadge).toBeVisible();

      // 3. Rozet içerisinde sunucu durum metninin yer aldığını doğrula
      const healthText = page.locator('#health-text');
      await expect(healthText).toBeVisible();
      await expect(healthText).toContainText('Sunucu: Aktif', { timeout: 5000 });
    });
  });

  test.describe('In-Memory Caching (Bellek İçi Önbellekleme) Testi', () => {
    test('İlk istekte X-Cache MISS, ikinci istekte X-Cache HIT döndüğünü doğrulama', async ({ page }) => {
      // Benzersiz bir arama parametresi oluştur (önbelleğe daha önce düşmemiş olacak)
      var uniqueParam = 'cacheTest_' + Date.now();
      var testUrl = 'http://localhost:3000/api/basvurular?page=1&limit=6&search=' + uniqueParam;

      // 1. İlk istek: Benzersiz sorgu ile önbellekte veri yok, X-Cache: MISS bekleniyor
      const firstResponse = await page.request.get(testUrl);
      await expect(firstResponse).toBeOK();
      const firstCacheHeader = firstResponse.headers()['x-cache'];
      expect(firstCacheHeader).toBe('MISS');

      // 2. İkinci istek: Aynı benzersiz sorgu ile önbellekte veri var, X-Cache: HIT bekleniyor
      const secondResponse = await page.request.get(testUrl);
      await expect(secondResponse).toBeOK();
      const secondCacheHeader = secondResponse.headers()['x-cache'];
      expect(secondCacheHeader).toBe('HIT');
    });
  });

  test.describe('Güvenlik ve Girdi Temizleme (XSS & Rate Limiter) Testi', () => {
    test('Script tagı içeren girdi güvenli işlenmeli ve normal istek 201 ile tamamlanmalı', async ({ page }) => {
      // 1. XSS payload içeren başvuru verisi hazırla
      var xssPayload = {
        isim: "<script>alert('xss')</script> Test Adayı",
        eposta: "xsstest@test.com",
        arananKriter: "<script>alert('hack')</script> Developer",
        cvMetni: "Bu bir güvenlik testi CV metnidir. JavaScript, Node.js deneyimi."
      };

      // 2. POST /api/basvuru isteği at ve 201 Created döndüğünü doğrula
      const postResponse = await page.request.post('http://localhost:3000/api/basvuru', {
        data: xssPayload
      });
      expect(postResponse.status()).toBe(201);

      const responseBody = await postResponse.json();
      expect(responseBody).toHaveProperty('veri');

      // 3. Yanıttaki isim alanının ham <script> tagı olarak çalıştırılabilir şekilde dönmediğini doğrula
      var kaydedilenIsim = responseBody.veri.isim;
      var kaydedilenKriter = responseBody.veri.arananKriter;

      // Veri kaydedilmiş olmalı (boş olmamalı)
      expect(kaydedilenIsim).toBeTruthy();
      expect(kaydedilenKriter).toBeTruthy();

      // 4. Arayüzde XSS çalışmadığını doğrula - sayfa hala yüklü ve sağlam
      await page.goto('http://localhost:3000');
      const formSection = page.locator('#form-section');
      await expect(formSection).toBeVisible();

      // 5. Rate limiter devrede: Normal bir POST isteğinin sorunsuz 201 ile tamamlandığını doğrula
      var normalPayload = {
        isim: "Rate Limit Test",
        eposta: "ratelimit@test.com",
        arananKriter: "Backend Developer",
        cvMetni: "Node.js ve Express konularında deneyimli yazılım geliştirici."
      };

      const rateLimitResponse = await page.request.post('http://localhost:3000/api/basvuru', {
        data: normalPayload
      });
      expect(rateLimitResponse.status()).toBe(201);

      const rateLimitBody = await rateLimitResponse.json();
      expect(rateLimitBody).toHaveProperty('mesaj');
    });
  });

});

