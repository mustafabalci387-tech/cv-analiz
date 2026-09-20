const User = require("../models/User");

async function authKontrol(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["x-auth-token"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

  if (!token) {
    req.user = null;
    return next();
  }

  const ADMIN_SECRET = process.env.ADMIN_TOKEN || "admin-token-123";

  if (token === ADMIN_SECRET) {
    req.user = {
      _id: null,
      id: null,
      kullaniciAdi: "admin",
      rol: "admin",
      sirketAdi: "Yönetim",
    };
    return next();
  }

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
          sirketAdi: user.sirketAdi || "Genel Şirket",
        };
      } else {
        req.user = null;
      }
    } catch {
      req.user = null;
    }
  }

  next();
}

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