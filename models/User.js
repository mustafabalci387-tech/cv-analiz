const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    kullaniciAdi: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    sifre: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    sirketAdi: {
      type: String,
      default: "Genel Şirket",
      trim: true,
    },
    tarih: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Güvenli şifre hashleme fonksiyonu (PBKDF2 + Rastgele Salt)
userSchema.statics.sifreHashle = function (sifre) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(sifre, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

// Zamanlama saldırılarına (Timing Attack) karşı korumalı şifre doğrulama
userSchema.statics.sifreDogrula = function (sifre, kayitliHash) {
  if (!kayitliHash) return false;

  // Eski düz metin şifreler varsa sistemin çökmesini önleyen geriye dönük kontrol
  if (!kayitliHash.includes(":")) {
    return sifre === kayitliHash;
  }

  const [salt, hash] = kayitliHash.split(":");
  const testHash = crypto.pbkdf2Sync(sifre, salt, 1000, 64, "sha512").toString("hex");

  try {
    const kayitliBuffer = Buffer.from(hash, "hex");
    const testBuffer = Buffer.from(testHash, "hex");
    return crypto.timingSafeEqual(kayitliBuffer, testBuffer);
  } catch {
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);