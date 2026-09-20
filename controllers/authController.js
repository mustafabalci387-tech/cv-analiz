const User = require("../models/User");
const Analysis = require("../models/Analysis");

const ADMIN_KULLANICI = process.env.ADMIN_USERNAME || "admin";
const ADMIN_SIFRE = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-token-123";

async function kayitOl(req, res) {
  try {
    const { kullaniciAdi, sifre, sirketAdi } = req.body;

    if (!kullaniciAdi || !sifre) {
      return res.status(400).json({
        success: false,
        mesaj: "Kullanıcı adı ve şifre zorunludur.",
      });
    }

    const temizKullaniciAdi = String(kullaniciAdi).trim().toLowerCase();
    const varMi = await User.findOne({ kullaniciAdi: temizKullaniciAdi });
    if (varMi) {
      return res.status(400).json({
        success: false,
        mesaj: "Bu kullanıcı adı zaten kullanılmaktadır.",
      });
    }

    const hashliSifre = User.sifreHashle(String(sifre).trim());

    // Güvenlik: Dışarıdan admin rolü enjekte edilemez, herkes 'user' başlar
    const yeniKullanici = new User({
      kullaniciAdi: temizKullaniciAdi,
      sifre: hashliSifre,
      sirketAdi: (sirketAdi || "Genel Şirket").trim(),
      rol: "user",
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

async function girisYap(req, res) {
  try {
    const kullaniciAdi = String(req.body.username || req.body.kullaniciAdi || "").trim().toLowerCase();
    const sifre = String(req.body.password || req.body.sifre || "").trim();

    if (!kullaniciAdi || !sifre) {
      return res.status(400).json({
        success: false,
        mesaj: "Kullanıcı adı ve şifre zorunludur.",
      });
    }

    // 1. Sistem yöneticisi (admin) doğrulaması
    if (kullaniciAdi === ADMIN_KULLANICI.toLowerCase() && sifre === ADMIN_SIFRE) {
      return res.status(200).json({
        success: true,
        token: ADMIN_TOKEN,
        user: {
          id: null,
          kullaniciAdi: ADMIN_KULLANICI,
          rol: "admin",
          sirketAdi: "Yönetim Kurulu",
        },
        mesaj: "Giriş başarılı.",
      });
    }

    // 2. Veritabanı kayıtlı şirket/kullanıcı doğrulaması
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

async function profilGetir(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, mesaj: "Oturum bulunamadı." });
  }
  return res.json({ success: true, user: req.user });
}

async function kullanicilariListele(req, res) {
  try {
    const users = await User.find({ rol: { $ne: "admin" } })
      .sort({ createdAt: -1 })
      .lean();

    // Veritabanını tek tek boğmak yerine paralel sorgu çözümü
    const stats = await Promise.all(
      users.map(async (u) => {
        const [toplamCv, aktifCv] = await Promise.all([
          Analysis.countDocuments({ userId: u._id }),
          Analysis.countDocuments({ userId: u._id, silindi: false, silindiMi: false }),
        ]);

        return {
          id: u._id,
          kullaniciAdi: u.kullaniciAdi,
          sirketAdi: u.sirketAdi || "Genel Şirket",
          rol: u.rol,
          kayitTarihi: u.createdAt || u.tarih || new Date(),
          toplamCv,
          aktifCv,
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