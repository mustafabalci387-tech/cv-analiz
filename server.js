const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Analysis = require("./models/Analysis");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const birincilModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const yedekModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const cvSemasiTanimi = new mongoose.Schema({
  isim: {
    type: String,
    required: true,
    trim: true,
  },
  eposta: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  cvMetni: {
    type: String,
    required: true,
  },
  arananKriter: {
    type: String,
    required: true,
    trim: true,
  },
  gucluYonler: {
    type: [String],
    default: [],
  },
  zayifYonler: {
    type: [String],
    default: [],
  },
  uygunlukSkoru: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  gorselVerisi: {
    type: String,
    default: "",
  },
  tarih: {
    type: Date,
    default: Date.now,
  },
  silindiMi: {
    type: Boolean,
    default: false,
  },
});

const CvModel = mongoose.model("Cv", cvSemasiTanimi);

async function icerikUretModelAgnostik(icerikler) {
  try {
    return await birincilModel.generateContent(icerikler);
  } catch (birincilHata) {
    return await yedekModel.generateContent(icerikler);
  }
}

function akilliYedekAnaliz(cvMetni, arananKriter) {
  var cvAlt = (cvMetni || "").toLowerCase();
  var kriterAlt = (arananKriter || "").toLowerCase();

  var kriterKelimeler = kriterAlt.match(/[a-zA-ZçğıöşüÇĞİÖŞÜ0-9]+/g) || [];
  var durakKelimeler = ["ve", "veya", "ile", "bir", "en", "az", "için", "olan", "şarttır", "önemli", "aranıyor", "istenen", "gibi", "yıl"];
  var filtrelenmisKriterler = kriterKelimeler.filter(function (k) {
    return k.length > 2 && durakKelimeler.indexOf(k) === -1;
  });

  var eslesenKelimeler = [];
  var eksikKelimeler = [];

  filtrelenmisKriterler.forEach(function (kelime) {
    if (cvAlt.includes(kelime)) {
      if (eslesenKelimeler.indexOf(kelime) === -1) eslesenKelimeler.push(kelime);
    } else {
      if (eksikKelimeler.indexOf(kelime) === -1) eksikKelimeler.push(kelime);
    }
  });

  var toplamKriter = filtrelenmisKriterler.length || 1;
  var eslesmeOrani = eslesenKelimeler.length / toplamKriter;

  var hesaplananSkor = Math.round(eslesmeOrani * 100);

  if (hesaplananSkor > 100) hesaplananSkor = 100;
  if (hesaplananSkor < 0) hesaplananSkor = 0;

  var gucluYonler = [];
  var zayifYonler = [];

  if (eslesenKelimeler.length > 0) {
    gucluYonler.push("İlanda aranan '" + eslesenKelimeler.slice(0, 3).join(", ") + "' kriterleri CV'de tespit edildi.");
    gucluYonler.push("Pozisyon gereksinimlerine kısmen/tamamen uyum sağlıyor.");
  } else {
    gucluYonler.push("Temel aday bilgileri veritabanına kaydedildi.");
  }

  if (eksikKelimeler.length > 0) {
    zayifYonler.push("İş ilanı için kritik olan '" + eksikKelimeler.slice(0, 3).join(", ") + "' yetkinlikleri CV'de bulunamadı.");
  } else {
    zayifYonler.push("Aday ilan gereksinimlerini yüksek oranda karşılıyor.");
  }

  return {
    gucluYonler: gucluYonler,
    zayifYonler: zayifYonler,
    uygunlukSkoru: hesaplananSkor
  };
}

app.post("/api/basvuru", async (req, res) => {
  try {
    const { isim, eposta, cvMetni, arananKriter, gorselVerisi } = req.body;

    if (!isim || !eposta || (!cvMetni && !gorselVerisi) || !arananKriter) {
      return res.status(400).json({ hata: "isim, eposta, arananKriter ve CV içeriği alanları zorunludur." });
    }

    const prompt = `Sen tarafsız bir İK uzmanısın. Aşağıdaki CV'yi iş verenin şu aradığı kriterlere göre detaylıca analiz et: "${arananKriter}".
Adayın niteliklerini kriterle karşılaştır ve sadece şu JSON formatında yanıt ver:
{
  "gucluYonler": ["Kriterle birebir uyuşan 2-4 adet somut güçlü yön"],
  "zayifYonler": ["Kriterde istenen ama CV'de eksik olan 1-3 adet yön"],
  "uygunlukSkoru": 0
}
Not: uygunlukSkoru 0 ile 100 arasında gerçekçi bir sayı olmalıdır. Açıklama veya markdown ekleme.

CV İÇERİĞİ:
${cvMetni || "Görsel CV ekte sunulmuştur."}`;

    const icerikler = [prompt];

    if (gorselVerisi && typeof gorselVerisi === "string" && gorselVerisi.startsWith("data:") && (!cvMetni || cvMetni.includes("[Görsel CV Yüklendi"))) {
      const match = gorselVerisi.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        icerikler.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    let analizSonucu;

    try {
      const sonuc = await icerikUretModelAgnostik(icerikler);
      const yapiZekaCevabi = sonuc.response.text();

      const jsonEslesmesi = yapiZekaCevabi.match(/\{[\s\S]*\}/);
      if (!jsonEslesmesi) {
        throw new Error("JSON çıkarılamadı");
      }

      analizSonucu = JSON.parse(jsonEslesmesi[0]);
    } catch (apiHatasi) {
      console.warn("Gemini API kotasına takılındı, Akıllı Kural Motoru devreye girdi.");
      analizSonucu = akilliYedekAnaliz(cvMetni, arananKriter);
    }

    const yeniBasvuru = new CvModel({
      isim,
      eposta,
      cvMetni: cvMetni || "[Görsel CV Yüklendi]",
      arananKriter,
      gorselVerisi: gorselVerisi || "",
      gucluYonler: analizSonucu.gucluYonler || [],
      zayifYonler: analizSonucu.zayifYonler || [],
      uygunlukSkoru: analizSonucu.uygunlukSkoru || 0,
    });

    await yeniBasvuru.save();

    const yeniAnaliz = new Analysis({
      fullName: isim,
      email: eposta,
      cvText: cvMetni || "[Görsel CV Yüklendi]",
      jobCriteria: arananKriter,
      strengths: analizSonucu.gucluYonler || [],
      weaknesses: analizSonucu.zayifYonler || [],
      matchScore: analizSonucu.uygunlukSkoru || 0,
      imageData: gorselVerisi || "",
    });

    await yeniAnaliz.save();

    return res.status(201).json({
      mesaj: "Başvuru başarıyla kaydedildi.",
      veri: yeniBasvuru,
    });
  } catch (hata) {
    return res.status(500).json({ hata: "Sunucu hatası: " + hata.message });
  }
});

app.get("/api/basvurular", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
    const limit = parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 6;
    const skip = (page - 1) * limit;

    const filter = { silindiMi: false };
    if (req.query.search) {
      filter.$or = [
        { isim: { $regex: req.query.search, $options: "i" } },
        { eposta: { $regex: req.query.search, $options: "i" } },
        { arananKriter: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const total = await CvModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const data = await CvModel.find(filter)
      .sort({ tarih: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        totalPages,
      },
    });
  } catch (hata) {
    return res.status(500).json({ hata: "Sunucu hatası: " + hata.message });
  }
});

app.get("/api/basvurular/:id", async (req, res) => {
  try {
    const aday = await CvModel.findById(req.params.id);

    if (!aday) {
      return res.status(404).json({ hata: "Aday bulunamadı." });
    }

    return res.json(aday);
  } catch (hata) {
    return res.status(500).json({ hata: "Sunucu hatası: " + hata.message });
  }
});

app.delete("/api/basvurular", async (req, res) => {
  try {
    await CvModel.updateMany({ silindiMi: false }, { silindiMi: true });
    await Analysis.deleteMany({});
    return res.json({ mesaj: "Tüm başvurular başarıyla silindi." });
  } catch (hata) {
    return res.status(500).json({ hata: "Sunucu hatası: " + hata.message });
  }
});

app.delete("/api/basvurular/:id", async (req, res) => {
  try {
    const silinenAday = await CvModel.findByIdAndUpdate(
      req.params.id,
      { silindiMi: true },
      { new: true }
    );

    if (!silinenAday) {
      return res.status(404).json({ hata: "Aday bulunamadı." });
    }

    return res.json({ mesaj: "Aday başarıyla silindi." });
  } catch (hata) {
    return res.status(500).json({ hata: "Sunucu hatası: " + hata.message });
  }
});

app.get("/api/analizler", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) > 0 ? parseInt(req.query.page, 10) : 1;
    const limit = parseInt(req.query.limit, 10) > 0 ? parseInt(req.query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: "i" } },
        { jobCriteria: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const total = await Analysis.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 0;

    const data = await Analysis.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        totalPages,
      },
    });
  } catch (hata) {
    return res.status(500).json({
      success: false,
      error: "Sunucu hatası: " + hata.message,
    });
  }
});

app.delete("/api/analizler", async (req, res) => {
  try {
    await Analysis.deleteMany({});
    return res.status(200).json({ success: true, mesaj: "Tüm analizler başarıyla silindi." });
  } catch (hata) {
    return res.status(500).json({ success: false, error: "Sunucu hatası: " + hata.message });
  }
});

app.delete("/api/analizler/:id", async (req, res) => {
  try {
    const silinen = await Analysis.findByIdAndDelete(req.params.id);
    if (!silinen) {
      return res.status(404).json({ success: false, error: "Analiz bulunamadı." });
    }
    return res.status(200).json({ success: true, mesaj: "Analiz başarıyla silindi." });
  } catch (hata) {
    return res.status(500).json({ success: false, error: "Sunucu hatası: " + hata.message });
  }
});

async function baslat() {
  await mongoose.connect("mongodb://localhost:27017/cv_analiz_db");
  console.log("MongoDB yerel veritabanı bağlantısı başarılı.");

  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
  });
}

baslat().catch((hata) => {
  console.error("Bağlantı hatası:", hata.message);
  process.exit(1);
});

module.exports = { app, CvModel, Analysis };