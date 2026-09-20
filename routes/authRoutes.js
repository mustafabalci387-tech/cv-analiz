const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authKontrol, adminZorunlu } = require("../middleware/authMiddleware");

router.post("/register", authController.kayitOl);
router.post("/login", authController.girisYap);
router.get("/me", authKontrol, authController.profilGetir);
router.get("/users", authKontrol, adminZorunlu, authController.kullanicilariListele);

module.exports = router;