// CV başvuruları, analizler, e-posta gönderimi ve sağlık kontrolü API yönlendirmeleri
const express = require("express");
const router = express.Router();
const cvController = require("../controllers/cvController");
const { authKontrol } = require("../middleware/authMiddleware");
const { rateLimiterMiddleware } = require("../middleware/rateLimiter");

// Tekil veya toplu CV başvurusu yap ve analiz et
router.post(["/basvuru", "/basvur"], rateLimiterMiddleware, authKontrol, cvController.basvuruYap);

// Başvuruları filtreli, aramalı ve önbellekli listele
router.get(["/basvurular", "/adaylar", "/analizler"], authKontrol, cvController.basvurulariListele);

// Tekil başvuru detayı
router.get(["/basvurular/:id", "/adaylar/:id"], authKontrol, cvController.basvuruDetay);

// Tekil başvuru silme (Soft-delete / Arşiv)
router.delete(["/basvurular/:id", "/adaylar/:id", "/analizler/:id"], authKontrol, cvController.basvuruSil);

// Silinmiş başvuruyu geri yükleme (Restore)
router.all(["/basvurular/:id/restore", "/adaylar/:id/restore"], authKontrol, cvController.basvuruGeriYukle);

// Tüm başvuruları silme
router.delete(["/basvurular", "/adaylar", "/analizler", "/adaylar/hepsini-sil", "/basvurular/hepsini-sil"], authKontrol, cvController.tumBasvurulariSil);

// Aday analiz özetini e-posta ile ilet
router.post("/mail-gonder", rateLimiterMiddleware, authKontrol, cvController.mailGonder);

// Canlı sistem sağlık durumu
router.get("/health", cvController.saglikKontrolu);

// E2E test sonuçları raporu
router.get("/test-results", cvController.testSonuclari);

module.exports = router;
