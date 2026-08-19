// CV başvuruları, analizler, e-posta gönderimi ve sağlık kontrolü API yönlendirmeleri
const express = require("express");
const router = express.Router();
const cvController = require("../controllers/cvController");
const { authKontrol } = require("../middleware/authMiddleware");
const { rateLimiterMiddleware } = require("../middleware/rateLimiter");

// Tekil veya toplu CV başvurusu yap ve analiz et
router.post("/basvuru", rateLimiterMiddleware, authKontrol, cvController.basvuruYap);

// Başvuruları filtreli, aramalı ve önbellekli listele
router.get("/basvurular", authKontrol, cvController.basvurulariListele);

// Tekil başvuru detayı
router.get("/basvurular/:id", authKontrol, cvController.basvuruDetay);

// Tekil başvuru silme (Soft-delete / Arşiv)
router.delete("/basvurular/:id", authKontrol, cvController.basvuruSil);

// Silinmiş başvuruyu geri yükleme (Restore)
router.put("/basvurular/:id/restore", authKontrol, cvController.basvuruGeriYukle);
router.patch("/basvurular/:id/restore", authKontrol, cvController.basvuruGeriYukle);

// Tüm başvuruları silme
router.delete("/basvurular", authKontrol, cvController.tumBasvurulariSil);

// Geriye dönük uyumluluk için /adaylar rotaları
router.get("/adaylar", authKontrol, cvController.basvurulariListele);
router.get("/adaylar/:id", authKontrol, cvController.basvuruDetay);
router.delete("/adaylar/:id", authKontrol, cvController.basvuruSil);
router.put("/adaylar/:id/restore", authKontrol, cvController.basvuruGeriYukle);
router.delete("/adaylar", authKontrol, cvController.tumBasvurulariSil);

// Geriye dönük uyumluluk için /analizler rotaları
router.get("/analizler", authKontrol, cvController.basvurulariListele);
router.delete("/analizler/:id", authKontrol, cvController.basvuruSil);
router.delete("/analizler", authKontrol, cvController.tumBasvurulariSil);

// Aday analiz özetini e-posta ile ilet
router.post("/mail-gonder", rateLimiterMiddleware, authKontrol, cvController.mailGonder);

// Canlı sistem sağlık durumu
router.get("/health", cvController.saglikKontrolu);

// E2E test sonuçları raporu
router.get("/test-results", cvController.testSonuclari);

module.exports = router;
