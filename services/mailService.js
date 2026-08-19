// Aday değerlendirme sonuçlarını e-posta ile ileten bildirim servisi
const nodemailer = require("nodemailer");

// E-posta gönderici istemcisini oluşturur (Ortam değişkenleri yoksa test simülasyonu yapar)
function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

// Aday analiz özetini HTML formatında alıcı e-posta adresine gönderir
async function adayOzetMailiGonder({ to, adayAdi, skor, arananKriter, gucluYonler, zayifYonler, sirketAdi }) {
  const sirket = sirketAdi || "CV Analiz Platformu";
  const scorePercent = skor || 0;
  const scoreColor = scorePercent >= 80 ? "#10b981" : scorePercent >= 60 ? "#3b82f6" : scorePercent >= 40 ? "#f59e0b" : "#ef4444";
  const scoreLabel = scorePercent >= 80 ? "Mükemmel Aday" : scorePercent >= 60 ? "İyi Aday" : scorePercent >= 40 ? "Gelişime Açık" : "Yetersiz";

  const gucluItems = (gucluYonler || []).map((g) => `<li style="margin-bottom: 6px; color: #10b981;">✔ ${g}</li>`).join("");
  const zayifItems = (zayifYonler || []).map((z) => `<li style="margin-bottom: 6px; color: #f59e0b;">▲ ${z}</li>`).join("");

  const htmlIcerik = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.2);">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">🎯 CV Analiz Değerlendirme Raporu</h1>
      <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">${sirket} İşe Alım Paneli</p>
    </div>
    
    <div style="padding: 28px;">
      <div style="background-color: rgba(30, 41, 59, 0.7); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(148, 163, 184, 0.15);">
        <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 18px;">${adayAdi || "İsimsiz Aday"}</h2>
        <p style="margin: 0; color: #94a3b8; font-size: 13px;">Aranan Pozisyon / Kriter: <strong style="color: #cbd5e1;">${arananKriter || "Belirtilmedi"}</strong></p>
        
        <div style="margin-top: 16px; display: inline-block; padding: 8px 16px; border-radius: 20px; background-color: ${scoreColor}22; border: 1px solid ${scoreColor};">
          <span style="font-size: 20px; font-weight: 800; color: ${scoreColor};">%${scorePercent}</span>
          <span style="font-size: 13px; font-weight: 600; color: ${scoreColor}; margin-left: 8px;">(${scoreLabel})</span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #10b981; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">🌟 Güçlü Yönler</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
          ${gucluItems || "<li style='color:#94a3b8;'>Tespit edilen belirgin güçlü yön bulunamadı.</li>"}
        </ul>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="color: #f59e0b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">⚡ Gelişim Alanları / Eksikler</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
          ${zayifItems || "<li style='color:#94a3b8;'>Belirgin bir eksik tespit edilmedi.</li>"}
        </ul>
      </div>

      <div style="border-top: 1px solid rgba(148, 163, 184, 0.15); padding-top: 16px; text-align: center; color: #64748b; font-size: 11px;">
        <p style="margin: 0;">Bu e-posta, Yapay Zeka Destekli CV Analiz Platformu tarafından otomatik olarak oluşturulmuştur.</p>
      </div>
    </div>
  </div>
  `;

  const transporter = getTransporter();

  if (transporter) {
    return await transporter.sendMail({
      from: `"${sirket}" <${process.env.SMTP_FROM || process.env.SMTP_USER || "ik@cvanaliz.com"}>`,
      to,
      subject: `🎯 CV Analiz Raporu: ${adayAdi} - %${scorePercent} (${scoreLabel})`,
      html: htmlIcerik,
    });
  }

  // SMTP tanımlı değilse konsola loglayıp simülasyon olarak başarılı döner
  console.log(`[MAIL SİMÜLASYONU] ${to} adresine "${adayAdi}" aday raporu gönderildi (%${scorePercent}).`);
  return {
    simulasyon: true,
    to,
    skor: scorePercent,
    mesaj: "SMTP yapılandırılmadığı için e-posta simüle edildi.",
  };
}

module.exports = {
  adayOzetMailiGonder,
};
