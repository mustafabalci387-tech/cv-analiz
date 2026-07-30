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

});
