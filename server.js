// CV Analiz Platformu - Sade ve modüler ana sunucu giriş noktası
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cvRoutes = require("./routes/cvRoutes");
const Analysis = require("./models/Analysis");

const app = express();
const PORT = process.env.PORT || 3000;

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
  await connectDB();
  app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
}

baslat().catch((h) => {
  console.error("Başlatma hatası:", h.message);
  process.exit(1);
});

module.exports = { app, CvModel: Analysis, Analysis };