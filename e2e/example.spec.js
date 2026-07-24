const { test, expect } = require('@playwright/test');

test('Uçtan Uca CV Analizi ve Sonuç Ekranı Testi', async ({ page }) => {
  // 1. Uygulamaya git
  await page.goto('http://localhost:3000');

  // 2. Form alanlarını doldur
  await page.locator('input').nth(0).fill('Mustafa Barış Balcı');
  await page.locator('input').nth(1).fill('baris@test.com');
  await page.locator('textarea').nth(0).fill('Node.js Backend Developer arıyoruz.');
  await page.locator('textarea').nth(1).fill('Node.js, Express ve MongoDB konularında uzmanım.');

  // 3. Analiz Et butonuna tıkla
  const analizButonu = page.locator('#submit-btn');
  await expect(analizButonu).toBeVisible();
  await analizButonu.click();

  // 4. Sonuç alanının ekrana yansımasını bekle (15 saniye tolerans)
  const sonucAlani = page.locator('#result-section');
  await expect(sonucAlani).toBeVisible({ timeout: 15000 });

  console.log('✅ CV analizi başarıyla tamamlandı ve sonuç ekrana yansıdı!');
});