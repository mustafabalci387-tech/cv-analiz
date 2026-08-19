// Kullanıcı ve yönetici oturum yetkilendirme kontrol middleware katmanı
const User = require("../models/User");

// İstek başlıklarındaki token bilgisini çözerek req.user nesnesine bağlar
async function authKontrol(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["x-auth-token"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

  if (!token) {
    req.user = null;
    return next();
  }

  // Varsayılan yönetici token doğrulaması
  if (token === "admin-token-123") {
    req.user = {
      _id: null,
      id: null,
      kullaniciAdi: "admin",
      rol: "admin",
      sirketAdi: "Yönetim",
    };
    return next();
  }

  // Veritabanı kullanıcı token doğrulaması (user-token-<userId>)
  if (token.startsWith("user-token-")) {
    const userId = token.replace("user-token-", "");
    try {
      const user = await User.findById(userId).select("-sifre");
      if (user) {
        req.user = {
          _id: user._id,
          id: user._id,
          kullaniciAdi: user.kullaniciAdi,
          rol: user.rol,
          sirketAdi: user.sirketAdi,
        };
      }
    } catch (e) {
      req.user = null;
    }
  }

  next();
}

// Sadece yönetici (admin) rolündeki kullanıcıların erişimine izin verir
function adminZorunlu(req, res, next) {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      hata: "Bu işlem için yönetici (admin) yetkisi gereklidir.",
    });
  }
  next();
}

module.exports = {
  authKontrol,
  adminZorunlu,
};
