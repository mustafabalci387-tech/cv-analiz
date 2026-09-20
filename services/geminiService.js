const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY || "";
let genAI = null;
let aiModel = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // Hem v1beta hem güncel API sürümleriyle tam uyumlu resmi flash modeli
    aiModel = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
  } catch (err) {
    console.warn("Gemini başlatılamadı:", err.message);
  }
}

function htmlEntityTemizle(str) {
  if (!str) return "";
  return String(str)
    .replace(/&#x2F;/gi, "/")
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function varsayilanKirilim(skor) {
  return [
    `+ %${Math.min(Math.round(skor * 0.45), 40)}: Aranan pozisyon gereksinimleri ve teknik beceri uyumu`,
    `+ %${Math.min(Math.round(skor * 0.35), 35)}: Özgeçmiş bütünlüğü ve sektörel deneyim derinliği`,
    skor < 75
      ? `- %${Math.min(100 - skor, 25)}: İlanda belirtilen bazı ikincil kriterlerin açıkça vurgulanmaması`
      : `+ %${Math.max(skor - 75, 10)}: Pozisyon beklentilerinin üzerindeki ek yetkinlikler`,
  ];
}

function varsayilanMulakat(kriter) {
  return [
    `"${kriter}" kriteri kapsamında bugüne kadar karşılaştığınız en zorlu teknik problemi ve çözümünüzü aktarır mısınız?`,
    "Projelerinizde hata ayıklama, güvenlik ve performans optimizasyonu süreçlerini nasıl kurguluyorsunuz?",
    "Yoğun teslim baskısı altında ekip içi iletişimi ve teknik kriz yönetimini nasıl sağlarsınız?",
  ];
}

// Güvenli yerel kural motoru (API veya ağ hatasında anında devreye girer)
function akilliYedekAnaliz(cvMetni, arananKriter) {
  const temizCv = htmlEntityTemizle(cvMetni || "").toLowerCase();
  const temizKriter = htmlEntityTemizle(arananKriter || "").toLowerCase();

  const durakKelimeler = new Set(["ve", "veya", "ile", "bir", "en", "az", "için", "olan", "şarttır", "istenen"]);
  const kriterKelimeler = (temizKriter.match(/[a-zA-ZçğıöşüÇĞİÖŞÜ0-9]+/g) || []).filter((k) => k.length > 2 && !durakKelimeler.has(k));

  const eslesenler = [];
  const eksikler = [];

  kriterKelimeler.forEach((kelime) => {
    if (temizCv.includes(kelime)) {
      if (!eslesenler.includes(kelime)) eslesenler.push(kelime);
    } else {
      if (!eksikler.includes(kelime)) eksikler.push(kelime);
    }
  });

  const toplamKriter = kriterKelimeler.length || 1;
  const oran = eslesenler.length / toplamKriter;
  let skor = Math.round(oran * 60 + Math.min(temizCv.length / 40, 25) + (eslesenler.length > 2 ? 10 : 5));
  skor = Math.min(Math.max(skor, 35), 94);

  return {
    gucluYonler: eslesenler.length > 0
      ? [`İlanda aranan "${eslesenler.slice(0, 3).join(", ")}" yetkinlikleri CV'de yer alıyor.`]
      : ["Temel özgeçmiş formatı eksiksiz sunuldu."],
    zayifYonler: eksikler.length > 0
      ? [`İlan gereksinimlerinden "${eksikler.slice(0, 2).join(", ")}" kriterleri CV metninde yeterince vurgulanmamış.`]
      : ["Belirgin bir teknik eksiklik tespit edilmedi."],
    uygunlukSkoru: skor,
    skorKirilimi: varsayilanKirilim(skor),
    mulakatSorulari: varsayilanMulakat(arananKriter),
    riskler: eksikler.length > 1 ? ["Bazı anahtar kriterlerin CV metninde doğrulanması gerekiyor."] : [],
  };
}

// Master Prompt ile CV Analizi Yürüten Ana Servis
async function cvAnalizEt(cvMetni, arananKriter, gorselVerisi) {
  // MASTER PROMPT: Yapay zekaya kimlik, format ve matematiksel kısıtlar dayatan katı kural seti
  const masterPrompt = `[ROL VE GÖREV]
Sen kıdemli bir İnsan Kaynakları (İK) Direktörü ve Baş Teknik Mülakatçısın.
Görevin, aşağıda verilen CV içeriğini işverenin talep ettiği kriterlere göre titizlikle analiz etmektir.

[KRİTERLER]
İşverenin Aradığı Kriter: "${arananKriter}"

[CV METNİ]
${cvMetni || "Görsel CV ekte sunulmuştur."}

[ANALİZ VE PUANLAMA KURALLARI]
1. Uygunluk skorunu asla 5'er veya 10'ar yuvarlama (Örn: 70, 80 verme). 0 ile 100 arasında net, tekil bir tam sayı üret (Örn: 67, 74, 83, 89).
2. 'gucluYonler' dizisine kriterle doğrudan örtüşen 2 somut madde yaz.
3. 'zayifYonler' dizisine adayın geliştirmesi gereken 2 somut madde yaz.
4. 'skorKirilimi' dizisine puanın oluşumunu gösteren + ve - yüzdeli 3 madde yaz (Örn: "+ %40: Teknik Uyum", "- %10: Deneyim Eksikliği").
5. 'mulakatSorulari' dizisine adayın CV'sindeki teknik iddiaları sınayan 3 adet hedef odaklı teknik soru yaz.
6. 'riskler' dizisine adayın geçmişinde gördüğün şüpheli durum veya boşlukları yaz (Yoksa boş dizi [] ver).

[FORMAT KISITI]
Cevabında ASLA 'Tabii ki', 'İşte analiziniz', markdown backtick (\`\`\`json) veya selamlama cümleleri kullanma!
SADECE ve SADECE aşağıdaki JSON şemasına uygun saf JSON nesnesi döndür:
{
  "gucluYonler": ["madde 1", "madde 2"],
  "zayifYonler": ["madde 1", "madde 2"],
  "uygunlukSkoru": 78,
  "skorKirilimi": ["+ %45: Teknik yığın uyumu", "+ %30: Proje deneyimi", "+ %3: Ek yetkinlikler"],
  "mulakatSorulari": ["soru 1", "soru 2", "soru 3"],
  "riskler": []
}`;

  // API tanımlı değilse hemen güvenli kural motoruna yönlenir
  if (!aiModel) {
    return akilliYedekAnaliz(cvMetni, arananKriter);
  }

  const payload = [masterPrompt];

  // Görsel varsa multimodal inlineData olarak eklenir
  if (gorselVerisi && typeof gorselVerisi === "string" && gorselVerisi.startsWith("data:")) {
    const match = gorselVerisi.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      payload.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }

  try {
    const response = await aiModel.generateContent(payload);
    const rawText = response.response.text();

    // Regex ile cevabın içindeki en dış süslü parantezleri cımbızla alır
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON deseni bulunamadı.");

    const parsed = JSON.parse(jsonMatch[0]);

    let skor = parseInt(parsed.uygunlukSkoru, 10);
    if (isNaN(skor) || skor < 0) skor = 50;
    if (skor > 100) skor = 100;

    return {
      gucluYonler: Array.isArray(parsed.gucluYonler) ? parsed.gucluYonler : [],
      zayifYonler: Array.isArray(parsed.zayifYonler) ? parsed.zayifYonler : [],
      uygunlukSkoru: skor,
      skorKirilimi: Array.isArray(parsed.skorKirilimi) && parsed.skorKirilimi.length > 0 ? parsed.skorKirilimi : varsayilanKirilim(skor),
      mulakatSorulari: Array.isArray(parsed.mulakatSorulari) && parsed.mulakatSorulari.length > 0 ? parsed.mulakatSorulari : varsayilanMulakat(arananKriter),
      riskler: Array.isArray(parsed.riskler) ? parsed.riskler : [],
    };
  } catch (err) {
    console.warn("Gemini servisi atlandı, Akıllı Kural Motoru çalıştı:", err.message);
    return akilliYedekAnaliz(cvMetni, arananKriter);
  }
}

module.exports = { cvAnalizEt, akilliYedekAnaliz };