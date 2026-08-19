// Kimlik doğrulama, kullanıcı kaydı ve giriş API yönlendirmeleri
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authKontrol, adminZorunlu } = require("../middleware/authMiddleware");

// Yeni kullanıcı ve şirket kaydı
router.post("/register", authController.kayitOl);

// Kullanıcı ve yönetici girişi
router.post("/login", authController.girisYap);

// Aktif oturum bilgisi
router.get("/me", authKontrol, authController.profilGetir);

// Admin için tüm kayıtlı şirketler & kullanıcılar listesi
router.get("/users", authKontrol, adminZorunlu, authController.kullanicilariListele);

module.exports = router;
