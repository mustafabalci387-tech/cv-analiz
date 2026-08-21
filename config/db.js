// Veritabanı bağlantı yapılandırması
const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/cv_analiz_db";
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("MongoDB veritabanı bağlantısı başarılı.");
  } catch (err) {
    if (process.env.MONGODB_URI) {
      console.error("MongoDB bağlantı hatası:", err.message);
      throw err;
    }
    // Yerel MongoDB yoksa test/geliştirme için bellek içi veritabanı başlat
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoMemory = await MongoMemoryServer.create();
    await mongoose.connect(mongoMemory.getUri());
    console.log("MongoMemoryServer geçici bellek içi veritabanı bağlantısı başarılı.");
  }
}

module.exports = connectDB;
