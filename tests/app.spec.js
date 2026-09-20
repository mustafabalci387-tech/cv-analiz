const { test, expect } = require("@playwright/test");

test.describe("CV Analiz Platformu E2E Test Senaryoları", () => {
  const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  async function adminGirisYap(page) {
    await page.evaluate(() => localStorage.setItem("adminToken", "admin-token-123"));
    await page.reload();
    await expect(page.locator("#main-workspace")).toBeVisible({ timeout: 5000 });
  }

  test.describe("Uçtan Uca CV Analizi ve Form Testi", () => {
    test("Formu doldurma, gönderme ve sonuç ekranının açıldığını doğrulama", async ({ page }) => {
      await adminGirisYap(page);

      await page.locator("#isim").fill("Mustafa Barış Balcı");
      await page.locator("#eposta").fill("baris@test.com");
      await page.locator("#arananKriter").fill("Senior Node.js Backend Developer arıyoruz");
      await page.locator("#cvMetni").fill("Node.js, Express, MongoDB, REST API ve Playwright E2E konularında 5 yıl tecrübeli yazılım uzmanı.");

      const analizButonu = page.locator("#submit-btn");
      await expect(analizButonu).toBeVisible();
      await analizButonu.click();

      const sonucAlani = page.locator("#result-section");
      await expect(sonucAlani).toBeVisible({ timeout: 15000 });

      await expect(page.locator("#candidate-name")).toContainText("Mustafa Barış Balcı");
      await expect(page.locator("#score-value")).toBeVisible();
    });
  });

  test.describe("Geçmiş Analizler ve Arama Testi", () => {
    test("Arama kutusuna metin yazma, filtreleme ve sayfalama kontrolleri", async ({ page }) => {
      await adminGirisYap(page);

      const searchInput = page.locator("#panel-search-input");
      await expect(searchInput).toBeVisible();

      await searchInput.fill("Node.js");
      await page.locator("#panel-search-btn").click();

      await expect(page.locator("#panel-prev-btn")).toBeVisible();
      await expect(page.locator("#panel-next-btn")).toBeVisible();
      const pageInfo = page.locator("#panel-page-info");
      await expect(pageInfo).toBeVisible();
      await expect(pageInfo).toContainText("Sayfa");
    });
  });

  test.describe("Aday Detay Modalı Testi", () => {
    test("Detaylar butonuna basma, modalın açıldığını ve kapatıldığını doğrulama", async ({ page }) => {
      await adminGirisYap(page);

      const detayButonlari = page.locator(".btn-detail");
      const count = await detayButonlari.count();

      if (count === 0) {
        await page.locator("#isim").fill("Ahmet Yılmaz");
        await page.locator("#eposta").fill("ahmet@test.com");
        await page.locator("#arananKriter").fill("React Developer");
        await page.locator("#cvMetni").fill("React, Tailwind CSS ve JavaScript geliştirme deneyimi olan ön yüz uzmanı.");
        await page.locator("#submit-btn").click();
        await expect(page.locator("#result-section")).toBeVisible({ timeout: 15000 });
      }

      const ilkDetayButonu = page.locator(".btn-detail").first();
      await expect(ilkDetayButonu).toBeVisible();
      await ilkDetayButonu.click();

      const detailModal = page.locator("#detail-modal");
      await expect(detailModal).toBeVisible();
      await expect(page.locator("#modal-name")).not.toBeEmpty();
      await expect(page.locator("#modal-kriter")).not.toBeEmpty();

      const modalCloseBtn = page.locator("#modal-close-btn");
      await expect(modalCloseBtn).toBeVisible();
      await modalCloseBtn.click();
      await expect(detailModal).toBeHidden();
    });
  });

  test.describe("PDF Raporu İndirme Butonları Testi", () => {
    test("Sonuç kartı ve detay modalındaki PDF butonlarının görünürlüğünü doğrulama", async ({ page }) => {
      await adminGirisYap(page);

      await page.locator("#isim").fill("Zeynep Demir");
      await page.locator("#eposta").fill("zeynep@test.com");
      await page.locator("#arananKriter").fill("Full Stack Developer");
      await page.locator("#cvMetni").fill("JavaScript, Node.js, Express, MongoDB ve Tailwind CSS deneyimine sahip yazılım uzmanı.");

      await page.locator("#submit-btn").click();
      await expect(page.locator("#result-section")).toBeVisible({ timeout: 15000 });

      const downloadPdfBtn = page.locator("#download-pdf-btn");
      await expect(downloadPdfBtn).toBeVisible();
      await expect(downloadPdfBtn).toBeEnabled();

      const detayButonlari = page.locator(".btn-detail");
      await expect(detayButonlari.first()).toBeVisible();
      await detayButonlari.first().click();

      const detailModal = page.locator("#detail-modal");
      await expect(detailModal).toBeVisible();

      const modalDownloadPdfBtn = page.locator("#modal-download-pdf-btn");
      await expect(modalDownloadPdfBtn).toBeVisible();
      await expect(modalDownloadPdfBtn).toBeEnabled();
    });
  });

  test.describe("Aday İstatistik Dashboard ve Grafik Testi", () => {
    test("Dashboard bölümü ve grafik canvas elemanlarının varlığını doğrulama", async ({ page }) => {
      await adminGirisYap(page);

      await expect(page.locator("#dashboard-section")).toBeVisible();
      await expect(page.locator("#stat-total-count")).not.toBeEmpty();
      await expect(page.locator("#stat-avg-score")).not.toBeEmpty();
      await expect(page.locator("#stat-excellent-count")).not.toBeEmpty();

      await expect(page.locator("#score-chart")).toBeAttached();
      await expect(page.locator("#kriter-chart")).toBeAttached();
    });
  });

  test.describe("CSV Dışa Aktarma ve Skor Filtreleme Testi", () => {
    test("Skor filtresi seçeneklerinin çalıştığını ve CSV butonunu doğrulama", async ({ page }) => {
      await adminGirisYap(page);

      const scoreFilter = page.locator("#panel-score-filter");
      await expect(scoreFilter).toBeVisible();

      await scoreFilter.selectOption("high");
      await expect(scoreFilter).toHaveValue("high");

      await scoreFilter.selectOption("mid");
      await expect(scoreFilter).toHaveValue("mid");

      await scoreFilter.selectOption("low");
      await expect(scoreFilter).toHaveValue("low");

      await scoreFilter.selectOption("all");
      await expect(scoreFilter).toHaveValue("all");

      const csvExportBtn = page.locator("#panel-csv-export-btn");
      await expect(csvExportBtn).toBeVisible();
      await expect(csvExportBtn).toBeEnabled();
    });
  });

  test.describe("Canlı Ortam Sağlık Kontrolü (Health Check) Testi", () => {
    test("/api/health endpoint yanıtını ve arayüz rozetini doğrulama", async ({ page }) => {
      await adminGirisYap(page);

      const response = await page.request.get(`${BASE_URL}/api/health`);
      await expect(response).toBeOK();

      const body = await response.json();
      expect(body.status).toBe("OK");
      expect(body).toHaveProperty("db");
      expect(body).toHaveProperty("uptime");
      expect(body).toHaveProperty("env");

      await expect(page.locator("#health-badge")).toBeVisible();
      const healthText = page.locator("#health-text");
      await expect(healthText).toBeVisible();
      await expect(healthText).toContainText("Sunucu: Aktif", { timeout: 5000 });
    });
  });

  test.describe("In-Memory Caching (Bellek İçi Önbellekleme) Testi", () => {
    test("İlk istekte X-Cache MISS, ikinci istekte X-Cache HIT döndüğünü doğrulama", async ({ page }) => {
      const uniqueParam = `cacheTest_${Date.now()}`;
      const testUrl = `${BASE_URL}/api/basvurular?page=1&limit=6&search=${uniqueParam}`;

      const firstResponse = await page.request.get(testUrl);
      await expect(firstResponse).toBeOK();
      expect(firstResponse.headers()["x-cache"]).toBe("MISS");

      const secondResponse = await page.request.get(testUrl);
      await expect(secondResponse).toBeOK();
      expect(secondResponse.headers()["x-cache"]).toBe("HIT");
    });
  });

  test.describe("Güvenlik ve Girdi Temizleme (XSS & Rate Limiter) Testi", () => {
    test("Script tagı içeren girdi güvenli işlenmeli ve normal istek 201 ile tamamlanmalı", async ({ page }) => {
      const xssPayload = {
        isim: "<script>alert('xss')</script> Test Adayı",
        eposta: "xsstest@test.com",
        arananKriter: "<script>alert('hack')</script> Developer",
        cvMetni: "Bu bir güvenlik testi CV metnidir. JavaScript, Node.js deneyimi.",
      };

      const postResponse = await page.request.post(`${BASE_URL}/api/basvuru`, {
        data: xssPayload,
      });
      expect(postResponse.status()).toBe(201);

      const responseBody = await postResponse.json();
      expect(responseBody).toHaveProperty("veri");
      expect(responseBody.veri.isim).toBeTruthy();
      expect(responseBody.veri.arananKriter).toBeTruthy();

      await page.goto(BASE_URL);
      await expect(page.locator("#auth-landing-screen")).toBeVisible();

      const normalPayload = {
        isim: "Rate Limit Test",
        eposta: "ratelimit@test.com",
        arananKriter: "Backend Developer",
        cvMetni: "Node.js ve Express konularında deneyimli yazılım geliştirici.",
      };

      const rateLimitResponse = await page.request.post(`${BASE_URL}/api/basvuru`, {
        data: normalPayload,
      });
      expect(rateLimitResponse.status()).toBe(201);
      const rateLimitBody = await rateLimitResponse.json();
      expect(rateLimitBody).toHaveProperty("mesaj");
    });
  });

  test.describe("Yönetici Girişi (Admin Auth) ve Panel Kilitleme Testi", () => {
    test("Giriş yapılmadan paneller gizli, giriş sonrası görünür, çıkış sonrası tekrar gizli olmalı", async ({ page }) => {
      await page.goto(BASE_URL);
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      const authLanding = page.locator("#auth-landing-screen");
      const mainWorkspace = page.locator("#main-workspace");
      await expect(authLanding).toBeVisible();
      await expect(mainWorkspace).toBeHidden();

      await expect(page.locator("#landing-login-form")).toBeVisible();

      await page.locator("#landing-login-user").fill("admin");
      await page.locator("#landing-login-pass").fill("admin123");
      await page.locator("#landing-login-submit").click();

      await expect(authLanding).toBeHidden({ timeout: 10000 });
      await expect(mainWorkspace).toBeVisible({ timeout: 10000 });

      await expect(page.locator("#panel-section")).toBeVisible({ timeout: 10000 });
      await expect(page.locator("#dashboard-section")).toBeVisible({ timeout: 10000 });

      const logoutBtn = page.locator("#admin-logout-btn");
      await expect(logoutBtn).toBeVisible({ timeout: 10000 });
      await logoutBtn.click();

      await expect(authLanding).toBeVisible({ timeout: 5000 });
      await expect(mainWorkspace).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe("UI/UX Toast Bildirimleri Testi", () => {
    test("Hata ve başarı toast bildirimlerinin doğruluk kontrolü", async ({ page }) => {
      await adminGirisYap(page);

      await page.locator("#submit-btn").click();

      const toast = page.locator("#toast-container div").first();
      await expect(toast).toContainText("Lütfen tüm zorunlu alanları", { timeout: 7000 });

      const closeBtn = toast.locator("button");
      await closeBtn.click();
      await expect(toast).toBeHidden({ timeout: 7000 });

      await page.evaluate(() => showToast("Yönetici girişi başarılı!", "success"));
      await expect(page.locator("#toast-container")).toContainText("Yönetici girişi başarılı!", { timeout: 7000 });
    });
  });
});