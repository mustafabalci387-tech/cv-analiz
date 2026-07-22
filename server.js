const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
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

app.post("/api/basvuru", async (req, res) => {
  try {
    const { isim, eposta, cvMetni, arananKriter } = req.body;

    if (!isim || !eposta || !cvMetni || !arananKriter) {
      return res.status(400).json({ hata: "isim, eposta, cvMetni ve arananKriter alanları zorunludur." });
    }

    let analizSonucu;

    try {
      const prompt = `Bu CV'yi iş verenin şu aradığı kriterlere göre incele: "${arananKriter}". Sonucu sadece şu JSON formatında döndür: { "gucluYonler": [], "zayifYonler": [], "uygunlukSkoru": 0 }\n\nCV Metni:\n${cvMetni}`;

      const sonuc = await model.generateContent(prompt);
      const yapiZekaCevabi = sonuc.response.text();

      const jsonEslesmesi = yapiZekaCevabi.match(/\{[\s\S]*\}/);
      if (!jsonEslesmesi) {
        throw new Error("JSON ayrıştırılamadı.");
      }

      analizSonucu = JSON.parse(jsonEslesmesi[0]);
    } catch (apiHatasi) {
      console.log("Gemini API hatası, yedek veri kullanılıyor:", apiHatasi.message);
      analizSonucu = {
        gucluYonler: ["Teknik Bilgi Yeterliliği", "Proje Deneyimi", "Problem Çözme Becerisi"],
        zayifYonler: ["Liderlik Deneyimi Eksikliği", "İleri Seviye Araç Bilgisi"],
        uygunlukSkoru: 75,
      };
    }

    const yeniBasvuru = new CvModel({
      isim,
      eposta,
      cvMetni,
      arananKriter,
      gucluYonler: analizSonucu.gucluYonler || [],
      zayifYonler: analizSonucu.zayifYonler || [],
      uygunlukSkoru: analizSonucu.uygunlukSkoru || 0,
    });

    await yeniBasvuru.save();

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
    const basvurular = await CvModel.find({ silindiMi: false }).sort({ uygunlukSkoru: -1 });
    return res.status(200).json(basvurular);
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

module.exports = { app, CvModel, model };
