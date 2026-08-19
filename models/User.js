// Kullanıcı ve şirket kimlik doğrulama şeması (User Modeli)
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

// Şifre hashleme yardımcısı (PBKDF2)
userSchema.statics.sifreHashle = function (sifre) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(sifre, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
};

// Şifre doğrulama yardımcısı
userSchema.statics.sifreDogrula = function (sifre, kayitliHash) {
  if (!kayitliHash) return false;
  if (!kayitliHash.includes(":")) {
    return sifre === kayitliHash;
  }
  const [salt, hash] = kayitliHash.split(":");
  const testHash = crypto.pbkdf2Sync(sifre, salt, 1000, 64, "sha512").toString("hex");
  return hash === testHash;
};

module.exports = mongoose.model("User", userSchema);
