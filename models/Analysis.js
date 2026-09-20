const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
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
      default: "",
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
    skorKirilimi: {
      type: [String],
      default: [],
    },
    mulakatSorulari: {
      type: [String],
      default: [],
    },
    riskler: {
      type: [String],
      default: [],
    },
    gorselVerisi: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    kullaniciAdi: {
      type: String,
      default: "",
    },
    sirketAdi: {
      type: String,
      default: "Genel Şirket",
    },
    silindi: {
      type: Boolean,
      default: false,
      index: true,
    },
    silindiMi: {
      type: Boolean,
      default: false,
    },
    tarih: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Geriye dönük uyumluluk için iki alanı eşit tutar (Mongoose 9+ Promise-tabanlı hook)
analysisSchema.pre("save", function () {
  if (this.isModified("silindi")) {
    this.silindiMi = this.silindi;
  } else if (this.isModified("silindiMi")) {
    this.silindi = this.silindiMi;
  }
});

// Aday listeleme ve dashboard filtreleme performansını artıran birleşik indeksler
analysisSchema.index({ silindi: 1, tarih: -1 });
analysisSchema.index({ sirketAdi: 1, silindi: 1 });

module.exports = mongoose.model("Analysis", analysisSchema);