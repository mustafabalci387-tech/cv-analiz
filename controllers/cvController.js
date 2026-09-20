// CV analizi, aday yönetimi, filtreleme, önbellek ve e-posta iş mantığı kontrolcüsü
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Analysis = require("../models/Analysis");
const { cvAnalizEt } = require("../services/geminiService");
const { adayOzetMailiGonder } = require("../services/mailService");
const { metniGuvenliYap } = require("../middleware/rateLimiter");

// In-Memory Önbellek Deposu
let memoryCache = {};
const CACHE_SURESI_MS = 30000; // 30 saniye TTL

function onbellekTemizle() {
  memoryCache = {};
}

function onbellekAnahtariOlustur(req) {
  const userPrefix = req.user ? `${req.user.id || req.user.rol}:` : "public:";
  return userPrefix + (req.originalUrl || req.url);
}

// Filtre oluşturma yardımcısı
function olusturBasvuruFiltresi(req) {
  const filter = {};
  const isAdmin = req.user && req.user.rol === "admin";

  if (isAdmin) {
    if (req.query.sirket) filter.sirketAdi = { $regex: req.query.sirket.trim(), $options: "i" };
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.onlyArchived === "true") filter.$or = [{ silindiMi: true }, { silindi: true }];
  } else {
    // Normal şirket & misafir: silinmemiş kayıtlar
    filter.silindi = { $ne: true };
    filter.silindiMi = { $ne: true };

    if (req.user) {
      const uId = req.user._id || req.user.id;
      const orList = [
        { userId: uId },
        { ekleyenKullanici: uId },
        { ekleyenKullanici: String(uId) },
      ];
      if (req.user.kullaniciAdi) {
        orList.push({ kullaniciAdi: req.user.kullaniciAdi }, { ekleyenKullanici: req.user.kullaniciAdi });
      }
      if (req.user.sirketAdi && req.user.sirketAdi !== "Genel Şirket") {
        orList.push({ sirketAdi: req.user.sirketAdi });
      }
      filter.$and = [{ $or: orList }];
    }
  }

  // Arama filtresi
  const aramaMetni = (req.query.search || "").trim();
  if (aramaMetni) {
    const searchRegex = { $regex: aramaMetni, $options: "i" };
    const searchOr = [
      { isim: searchRegex },
      { eposta: searchRegex },
      { arananKriter: searchRegex },
      { sirketAdi: searchRegex },
      { kullaniciAdi: searchRegex },
    ];
    if (!filter.$and) filter.$and = [];
    filter.$and.push({ $or: searchOr });
  }

  // Skor filtresi
  const scoreFilter = req.query.scoreFilter;
  if (scoreFilter === "high") filter.uygunlukSkoru = { $gte: 80 };
  else if (scoreFilter === "mid") filter.uygunlukSkoru = { $gte: 50, $lt: 80 };
  else if (scoreFilter === "low") filter.uygunlukSkoru = { $lt: 50 };

  return filter;
}

// Yeni CV başvurusu oluşturur ve yapay zeka ile hassas puanlama yapar
async function basvuruYap(req, res) {
  try {
    let { isim, eposta, cvMetni, arananKriter, gorselVerisi } = req.body;

    if ((!cvMetni && !gorselVerisi) || !arananKriter) {
      return res.status(400).json({
        hata: "Aranan kriter ve CV içeriği (dosya veya metin) zorunludur.",
      });
    }

    isim = isim ? metniGuvenliYap(String(isim).trim()) : "Aday (Otomatik)";
    eposta = eposta ? metniGuvenliYap(String(eposta).trim()) : "aday@cvanaliz.internal";
    arananKriter = metniGuvenliYap(arananKriter.trim());

    // Gemini AI / Kural motoru ile hassas analiz
    const analizSonucu = await cvAnalizEt(cvMetni, arananKriter, gorselVerisi);

    const userObjId = req.user ? (req.user._id || req.user.id || null) : null;
    const ekleyenKullaniciVal = req.user ? String(req.user._id || req.user.id || req.user.kullaniciAdi || "") : "";
    const kullaniciAdiVal = req.user ? (req.user.kullaniciAdi || "") : "";
    const sirketAdiVal = req.user ? (req.user.sirketAdi || req.user.kullaniciAdi || "Genel Şirket") : "Genel Şirket";

    const yeniAnaliz = new Analysis({
      isim: isim || "Aday (Otomatik)",
      eposta: eposta || "aday@cvanaliz.internal",
      cvMetni: cvMetni || "[Görsel CV Yüklendi]",
      arananKriter,
      gorselVerisi: gorselVerisi || "",
      gucluYonler: analizSonucu.gucluYonler || [],
      zayifYonler: analizSonucu.zayifYonler || [],
      uygunlukSkoru: analizSonucu.uygunlukSkoru || 0,
      skorKirilimi: analizSonucu.skorKirilimi || [],
      mulakatSorulari: analizSonucu.mulakatSorulari || [],
      riskler: analizSonucu.riskler || [],
      userId: userObjId,
      ekleyenKullanici: ekleyenKullaniciVal,
      kullaniciAdi: kullaniciAdiVal,
      sirketAdi: sirketAdiVal,
      silindi: false,
      silindiMi: false,
    });

    await yeniAnaliz.save();
    onbellekTemizle();

    return res.status(201).json({
      mesaj: "Başvuru başarıyla kaydedildi.",
      veri: yeniAnaliz,
    });
  } catch (err) {
    return res.status(500).json({ hata: "Sunucu hatası: " + err.message });
  }
}

// Aday başvurularını arama, skor filtresi, 'En İyi 5' ve önbellek desteğiyle listeler
async function basvurulariListele(req, res) {
  try {
    const cacheKey = onbellekAnahtariOlustur(req);
    const cachedEntry = memoryCache[cacheKey];

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_SURESI_MS) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cachedEntry.data);
    }

    const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
    const limit = parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 6;
    const skip = (page - 1) * limit;

    const filter = olusturBasvuruFiltresi(req);
    const isTop5 = req.query.scoreFilter === "top5";
    const sortCriteria = isTop5 ? { uygunlukSkoru: -1, tarih: -1 } : { tarih: -1 };
    const queryLimit = isTop5 ? 5 : limit;

    const total = await Analysis.countDocuments(filter);
    const totalPages = Math.ceil(total / queryLimit) || 1;

    const data = await Analysis.find(filter)
      .sort(sortCriteria)
      .skip(skip)
      .limit(queryLimit)
      .lean();

    const responseData = {
      success: true,
      data,
      pagination: {
        total,
        page,
        totalPages,
      },
    };

    memoryCache[cacheKey] = { data: responseData, timestamp: Date.now() };

    res.setHeader("X-Cache", "MISS");
    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ hata: "Sunucu hatası: " + err.message });
  }
}

// Tekil aday başvuru detayını döner
async function basvuruDetay(req, res) {
  try {
    const aday = await Analysis.findById(req.params.id);
    if (!aday) return res.status(404).json({ hata: "Aday bulunamadı." });

    const isAdmin = req.user && req.user.rol === "admin";
    if (!isAdmin && (aday.silindiMi || aday.silindi)) {
      return res.status(404).json({ hata: "Aday bulunamadı." });
    }

    return res.json(aday);
  } catch (err) {
    return res.status(500).json({ hata: "Sunucu hatası: " + err.message });
  }
}

// Aday başvurusunu siler (Şirket için Soft-Delete, Admin için Kalıcı/Arşivleme)
async function basvuruSil(req, res) {
  try {
    const adayId = req.params.id;
    const aday = await Analysis.findById(adayId);
    if (!aday) return res.status(404).json({ hata: "Aday bulunamadı." });

    const isAdmin = req.user && req.user.rol === "admin";
    const kaliciSil = req.query.kalici === "true" || req.query.hard === "true";

    if (isAdmin && kaliciSil) {
      await Analysis.findByIdAndDelete(adayId);
      onbellekTemizle();
      return res.json({ success: true, mesaj: "Aday veritabanından kalıcı olarak silindi." });
    }

    aday.silindi = true;
    aday.silindiMi = true;
    await aday.save();

    onbellekTemizle();
    return res.json({
      success: true,
      mesaj: isAdmin ? "Aday arşive kaldırıldı." : "Aday kaydı başarıyla silindi (arşivlendi).",
      arsivlendi: true,
    });
  } catch (err) {
    return res.status(500).json({ hata: "Sunucu hatası: " + err.message });
  }
}

// Silinmiş/Arşivlenmiş adayı geri yükler (Restore)
async function basvuruGeriYukle(req, res) {
  try {
    const adayId = req.params.id;
    const aday = await Analysis.findById(adayId);
    if (!aday) return res.status(404).json({ hata: "Aday bulunamadı." });

    aday.silindi = false;
    aday.silindiMi = false;
    await aday.save();

    onbellekTemizle();
    return res.json({ success: true, mesaj: "Aday kaydı başarıyla geri yüklendi.", veri: aday });
  } catch (err) {
    return res.status(500).json({ hata: "Sunucu hatası: " + err.message });
  }
}

// Tüm aday başvurularını siler (Admin için Hard Delete, Normal Şirket için Soft Delete)
async function tumBasvurulariSil(req, res) {
  try {
    const isAdmin = req.user && req.user.rol === "admin";
    const hardDelete = req.query.hardDelete === "true" || req.body?.hardDelete === true || isAdmin;

    if (isAdmin || hardDelete) {
      // Arşivlenmiş olanlar dahil tüm koleksiyonu kalıcı olarak sil (Hard Delete)
      const result = await Analysis.deleteMany({});
      onbellekTemizle();
      return res.status(200).json({
        success: true,
        message: "Tüm aday kayıtları kalıcı olarak temizlendi",
        mesaj: "Tüm aday kayıtları kalıcı olarak temizlendi",
        deletedCount: result.deletedCount || 0,
      });
    }

    // Normal şirket kullanıcısı: kendi şirket/kullanıcı kayıtlarını soft-delete yapar
    if (!req.user) {
      return res.status(401).json({ success: false, hata: "Yetkisiz işlem. Giriş yapmalısınız." });
    }

    const uId = req.user._id || req.user.id;
    const filter = {
      $or: [
        { userId: uId },
        { ekleyenKullanici: uId },
        { ekleyenKullanici: String(uId) },
        ...(req.user.kullaniciAdi ? [{ kullaniciAdi: req.user.kullaniciAdi }, { ekleyenKullanici: req.user.kullaniciAdi }] : []),
        ...(req.user.sirketAdi && req.user.sirketAdi !== "Genel Şirket" ? [{ sirketAdi: req.user.sirketAdi }] : []),
      ],
    };

    const result = await Analysis.updateMany(filter, { silindi: true, silindiMi: true, arsivlendi: true });
    onbellekTemizle();
    return res.status(200).json({
      success: true,
      message: "Şirketinize ait başvurular arşivlendi.",
      mesaj: "Şirketinize ait başvurular arşivlendi.",
      modifiedCount: result.modifiedCount || 0,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      hata: "Sunucu hatası: " + err.message,
      message: "Sunucu hatası: " + err.message,
    });
  }
}

// Aday analiz özetini alıcı e-posta adresine HTML formatında gönderir
async function mailGonder(req, res) {
  try {
    const { to, adayAdi, skor, arananKriter, gucluYonler, zayifYonler, sirketAdi } = req.body;
    if (!to || !to.includes("@")) {
      return res.status(400).json({ success: false, mesaj: "Geçerli bir e-posta adresi belirtilmelidir." });
    }

    const sonuc = await adayOzetMailiGonder({
      to: to.trim(),
      adayAdi: adayAdi || "Değerlendirilen Aday",
      skor: skor || 0,
      arananKriter: arananKriter || "Belirtilmedi",
      gucluYonler: gucluYonler || [],
      zayifYonler: zayifYonler || [],
      sirketAdi: sirketAdi || (req.user ? req.user.sirketAdi : "CV Analiz Platformu"),
    });

    return res.status(200).json({
      success: true,
      mesaj: "Aday değerlendirme raporu başarıyla e-posta ile gönderildi.",
      detay: sonuc,
    });
  } catch (err) {
    return res.status(500).json({ success: false, mesaj: "E-posta gönderim hatası: " + err.message });
  }
}

// Canlı sistem ve veritabanı sağlık durumunu kontrol eder
function saglikKontrolu(req, res) {
  const dbDurumlari = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbDurumu = dbDurumlari[mongoose.connection.readyState] || "unknown";

  return res.json({
    status: "OK",
    db: dbDurumu === "connected" ? "Connected" : "Disconnected",
    dbState: dbDurumu,
    uptime: Math.floor(process.uptime()) + " saniye",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
}

// Kaydedilmiş Playwright E2E test sonuçlarını JSON olarak sunar
function testSonuclari(req, res) {
  const jsonPath = path.join(__dirname, "..", "public", "test-results.json");
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, error: "Test raporu okunamadı." });
    }
  }
  return res.status(404).json({ success: false, error: "Henüz kaydedilmiş test sonucu bulunmuyor." });
}

module.exports = {
  basvuruYap,
  basvurulariListele,
  basvuruDetay,
  basvuruSil,
  basvuruGeriYukle,
  tumBasvurulariSil,
  mailGonder,
  saglikKontrolu,
  testSonuclari,
  onbellekTemizle,
};
