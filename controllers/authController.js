// Kullanıcı kayıt, giriş ve şirket oturum iş mantığı kontrolcüsü
const User = require("../models/User");
const Analysis = require("../models/Analysis");

const ADMIN_KULLANICI = process.env.ADMIN_USERNAME || "admin";
const ADMIN_SIFRE = process.env.ADMIN_PASSWORD || "admin123";

// Yeni kullanıcı ve şirket kaydı oluşturur
async function kayitOl(req, res) {
  try {
    const { kullaniciAdi, sifre, sirketAdi, rol } = req.body;

    if (!kullaniciAdi || !sifre) {
      return res.status(400).json({
        success: false,
        mesaj: "Kullanıcı adı ve şifre zorunludur.",
      });
    }

    const temizKullaniciAdi = kullaniciAdi.trim().toLowerCase();
    const varMi = await User.findOne({ kullaniciAdi: temizKullaniciAdi });
    if (varMi) {
      return res.status(400).json({
        success: false,
        mesaj: "Bu kullanıcı adı zaten kullanılmaktadır.",
      });
    }

    const hashliSifre = User.sifreHashle(sifre.trim());

    const yeniKullanici = new User({
      kullaniciAdi: temizKullaniciAdi,
      sifre: hashliSifre,
      sirketAdi: (sirketAdi || "Genel Şirket").trim(),
      rol: rol === "admin" ? "admin" : "user",
    });

    await yeniKullanici.save();

    const token = `user-token-${yeniKullanici._id}`;

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: yeniKullanici._id,
        kullaniciAdi: yeniKullanici.kullaniciAdi,
        rol: yeniKullanici.rol,
        sirketAdi: yeniKullanici.sirketAdi,
      },
      mesaj: "Kayıt başarıyla tamamlandı.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      mesaj: "Kayıt sırasında sunucu hatası: " + err.message,
    });
  }
}

// Kullanıcı veya yönetici girişi yaparak oturum token'ı döner
async function girisYap(req, res) {
  try {
    const kullaniciAdi = (req.body.username || req.body.kullaniciAdi || "").trim().toLowerCase();
    const sifre = (req.body.password || req.body.sifre || "").trim();

    if (!kullaniciAdi || !sifre) {
      return res.status(400).json({
        success: false,
        mesaj: "Kullanıcı adı ve şifre zorunludur.",
      });
    }

    // 1. Varsayılan yönetici (admin) kontrolü
    if (kullaniciAdi === ADMIN_KULLANICI.toLowerCase() && sifre === ADMIN_SIFRE) {
      return res.status(200).json({
        success: true,
        token: "admin-token-123",
        user: {
          id: null,
          kullaniciAdi: "admin",
          rol: "admin",
          sirketAdi: "Yönetim Kurulu",
        },
        mesaj: "Giriş başarılı.",
      });
    }

    // 2. Veritabanı kayıtlı kullanıcı kontrolü
    const user = await User.findOne({ kullaniciAdi });
    if (user && User.sifreDogrula(sifre, user.sifre)) {
      const token = `user-token-${user._id}`;
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          kullaniciAdi: user.kullaniciAdi,
          rol: user.rol,
          sirketAdi: user.sirketAdi,
        },
        mesaj: "Giriş başarılı.",
      });
    }

    return res.status(401).json({
      success: false,
      mesaj: "Kullanıcı adı veya şifre hatalı.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      mesaj: "Giriş sırasında sunucu hatası: " + err.message,
    });
  }
}

// Aktif oturum sahibinin profil bilgilerini döner
async function profilGetir(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, mesaj: "Oturum bulunamadı." });
  }
  return res.json({ success: true, user: req.user });
}

// Admin için tüm kayıtlı şirket ve kullanıcıları istatistikleriyle listeler
async function kullanicilariListele(req, res) {
  try {
    const users = await User.find({ rol: { $ne: "admin" } })
      .sort({ createdAt: -1 })
      .lean();

    const stats = await Promise.all(
      users.map(async (u) => {
        const toplamCv = await Analysis.countDocuments({ userId: u._id });
        const aktifCv = await Analysis.countDocuments({
          userId: u._id,
          silindiMi: false,
          silindi: false,
        });

        return {
          id: u._id,
          kullaniciAdi: u.kullaniciAdi,
          sirketAdi: u.sirketAdi || "Genel Şirket",
          rol: u.rol,
          kayitTarihi: u.createdAt || u.tarih || new Date(),
          toplamCv: toplamCv,
          aktifCv: aktifCv,
        };
      })
    );

    return res.json({
      success: true,
      toplamKullanici: stats.length,
      data: stats,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      mesaj: "Kullanıcılar listelenirken sunucu hatası: " + err.message,
    });
  }
}

module.exports = {
  kayitOl,
  girisYap,
  profilGetir,
  kullanicilariListele,
};
