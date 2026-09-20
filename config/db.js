const mongoose = require("mongoose");

let mongoMemoryServer = null;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/cv_analiz_db";

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("MongoDB veritabanı bağlantısı başarılı.");
  } catch (err) {
    if (process.env.MONGODB_URI) {
      console.error("MongoDB bağlantı hatası:", err.message);
      throw err;
    }

    const { MongoMemoryServer } = require("mongodb-memory-server");
    mongoMemoryServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoMemoryServer.getUri());
    console.log("MongoMemoryServer geçici bellek içi veritabanı bağlantısı başarılı.");
  }
}

module.exports = connectDB;