// CV Analiz Platformu - Sade ve modüler ana sunucu giriş noktası
require("dotenv").config();
const express = require("express"), mongoose = require("mongoose"), cors = require("cors"), path = require("path");
const authRoutes = require("./routes/authRoutes"), cvRoutes = require("./routes/cvRoutes"), Analysis = require("./models/Analysis");

const app = express(), PORT = process.env.PORT || 3000;

// Temel Middleware Katmanları
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/playwright-report", express.static(path.join(__dirname, "playwright-report")));

// Modüler API Rotaları
app.use("/api/auth", authRoutes);
app.use("/api", cvRoutes);

// Veritabanı bağlantısı ve sunucuyu başlatma
async function baslat() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/cv_analiz_db";
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("MongoDB veritabanı bağlantısı başarılı.");
  } catch (err) {
    if (process.env.MONGODB_URI) throw err;
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoMemory = await MongoMemoryServer.create();
    await mongoose.connect(mongoMemory.getUri());
    console.log("MongoMemoryServer geçici veritabanı bağlantısı başarılı.");
  }
  app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
}

baslat().catch((h) => { console.error("Başlatma hatası:", h.message); process.exit(1); });

module.exports = { app, CvModel: Analysis, Analysis };