// Güvenlik: In-Memory Rate Limiter ve XSS Girdi Temizleme Katmanı
const rateLimitDeposu = {};
const RATE_LIMIT_PENCERE_MS = 15 * 60 * 1000; // 15 dakika
const MAKS_BASVURU_SAYISI = 1000;

// İstemci IP adresine göre aşırı istekleri sınırlandıran middleware
function rateLimiterMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || "127.0.0.1";
  const suan = Date.now();

  if (!rateLimitDeposu[ip] || suan - rateLimitDeposu[ip].baslangicZamani > RATE_LIMIT_PENCERE_MS) {
    rateLimitDeposu[ip] = { sayac: 1, baslangicZamani: suan };
    return next();
  }

  rateLimitDeposu[ip].sayac++;

  if (rateLimitDeposu[ip].sayac > MAKS_BASVURU_SAYISI) {
    return res.status(429).json({
      hata: "Çok fazla başvuru yapıldı. Lütfen bir süre sonra tekrar deneyiniz.",
      mesaj: "Rate limit aşıldı.",
    });
  }

  next();
}

// XSS saldırılarına karşı tehlikeli HTML karakterlerini temizler
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
