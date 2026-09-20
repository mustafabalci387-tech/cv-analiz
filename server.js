require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const cvRoutes = require("./routes/cvRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/playwright-report", express.static(path.join(__dirname, "playwright-report")));

app.use("/api/auth", authRoutes);
app.use("/api", cvRoutes);

// Global hata yakalama middleware'i — tüm next(err) çağrılarını yakalar
app.use((err, req, res, next) => {
  console.error("Sunucu hatası:", err.message);
  return res.status(err.status || 500).json({
    success: false,
    hata: "Sunucu hatası: " + (err.message || "Bilinmeyen hata"),
  });
});

async function baslat() {
  await connectDB();
  app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
}

baslat().catch((hata) => {
  console.error("Başlatma hatası:", hata.message);
  process.exit(1);
});

module.exports = app;