// Aday CV analizi ve başvuru kayıt şeması (Analysis Modeli)
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
    ekleyenKullanici: {
      type: String,
      default: "",
    },
    kullaniciAdi: {
      type: String,
      default: "",
    },
    sirketAdi: {
      type: String,
      default: "",
    },
    silindi: {
      type: Boolean,
      default: false,
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

// silindi ve silindiMi alanlarını eşitle
analysisSchema.pre("save", function () {
  if (this.isModified("silindi")) {
    this.silindiMi = this.silindi;
  } else if (this.isModified("silindiMi")) {
    this.silindi = this.silindiMi;
  }
});

analysisSchema.index({ tarih: -1 });
analysisSchema.index({ silindi: 1, silindiMi: 1, tarih: -1 });

module.exports = mongoose.model("Analysis", analysisSchema);
