const rateLimitDeposu = {};
const RATE_LIMIT_PENCERE_MS = 15 * 60 * 1000; // 15 dakika
const MAKS_BASVURU_SAYISI = Number(process.env.RATE_LIMIT_MAX) || 1000;

// Bellek sızıntısını (Memory Leak) önlemek için süresi dolan IP kayıtlarını temizleyen hafif döngü
setInterval(() => {
  const suan = Date.now();
  for (const ip in rateLimitDeposu) {
    if (suan - rateLimitDeposu[ip].baslangicZamani > RATE_LIMIT_PENCERE_MS) {
      delete rateLimitDeposu[ip];
    }
  }
}, RATE_LIMIT_PENCERE_MS);

function rateLimiterMiddleware(req, res, next) {
  const ip = req.ip || (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";
  const suan = Date.now();

  if (!rateLimitDeposu[ip] || suan - rateLimitDeposu[ip].baslangicZamani > RATE_LIMIT_PENCERE_MS) {
    rateLimitDeposu[ip] = { sayac: 1, baslangicZamani: suan };
    return next();
  }

  rateLimitDeposu[ip].sayac++;

  if (rateLimitDeposu[ip].sayac > MAKS_BASVURU_SAYISI) {
    return res.status(429).json({
      success: false,
      hata: "Çok fazla istek yapıldı. Lütfen 15 dakika sonra tekrar deneyiniz.",
      mesaj: "Rate limit aşıldı.",
    });
  }

  next();
}

function metniGuvenliYap(metin) {
  if (!metin || typeof metin !== "string") return metin;
  return metin
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

module.exports = {
  rateLimiterMiddleware,
  metniGuvenliYap,
};