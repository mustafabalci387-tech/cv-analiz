// ====== CV Analiz Platformu - Ana Uygulama Modülü (app.js) ======

// DOM Kısayolları
const $ = (id) => document.getElementById(id);

const form = $("cv-form");
const submitBtn = $("submit-btn");
const btnText = $("btn-text");
const btnSpinner = $("btn-spinner");
const formSection = $("form-section");
const resultSection = $("result-section");
const newAnalysisBtn = $("new-analysis-btn");
const dropZone = $("drop-zone");
const cvFileInput = $("cv-file-input");
const fileStatus = $("file-status");
const cvMetniArea = $("cvMetni");
const isimInput = $("isim");
const epostaInput = $("eposta");
const arananKriterInput = $("arananKriter");

// Modal & Sidebar
const detailModal = $("detail-modal");
const appSidebar = $("app-sidebar");
const sidebarOverlay = $("sidebar-overlay");

// Panel DOM
const panelList = $("panel-list");
const panelSkeleton = $("panel-skeleton");
const panelEmpty = $("panel-empty");
const panelError = $("panel-error");
const panelCount = $("panel-count");
const panelPrevBtn = $("panel-prev-btn");
const panelNextBtn = $("panel-next-btn");
const panelPageInfo = $("panel-page-info");
const panelSearchInput = $("panel-search-input");
const panelScoreFilter = $("panel-score-filter");

// Global Durum
let yuklenenDosyalar = [];
let yuklenenGorselBase64 = "";
let secilenAdayForMail = null;
let aktifSayfa = 1;
let aktifArama = "";
let aktifFiltre = "all";
let mevcutAdaylar = [];
let scoreChart = null;
let kriterChart = null;

// HTML Entity kalıntılarını temizleyen yardımcı
function htmlEntityDecode(str) {
  if (!str) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = String(str)
    .replace(/&#x2F;/gi, "/")
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
  return txt.value;
}

// ====== Toast Bildirim Sistemi ======
function showToast(mesaj, tip = "info") {
  let container = $("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  let styleClasses = "bg-slate-900/98 border-indigo-500/40 text-indigo-300 shadow-indigo-950/40";
  let iconHtml = '<svg class="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25z" /></svg>';

  if (tip === "success") {
    styleClasses = "bg-slate-900/98 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40";
    iconHtml = '<svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
  } else if (tip === "error") {
    styleClasses = "bg-slate-900/98 border-red-500/40 text-red-300 shadow-red-950/40";
    iconHtml = '<svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008z" /></svg>';
  }

  toast.className = `pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-x-full opacity-0 ${styleClasses}`;
  toast.innerHTML = `${iconHtml}<div class="text-xs font-semibold flex-1 leading-snug">${mesaj || ""}</div><button type="button" class="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>`;

  toast.querySelector("button")?.addEventListener("click", () => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove("translate-x-full", "opacity-0"));

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add("translate-x-full", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

const showError = (msg) => showToast(msg, "error");

// ====== Sidebar Kontrolleri ======
function sidebarAc() {
  appSidebar?.classList.remove("-translate-x-full");
  sidebarOverlay?.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function sidebarKapat() {
  appSidebar?.classList.add("-translate-x-full");
  sidebarOverlay?.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  document.body.style.overflow = "";
}

$("sidebar-toggle-btn")?.addEventListener("click", sidebarAc);
$("sidebar-close-btn")?.addEventListener("click", sidebarKapat);
sidebarOverlay?.addEventListener("click", sidebarKapat);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && appSidebar && !appSidebar.classList.contains("-translate-x-full")) {
    sidebarKapat();
  }
});

// ====== Sol Menü Filtreleri ======
function adayListesineKaydir() {
  const pSec = $("panel-section") || $("aday-listesi-container");
  if (pSec) {
    pSec.style.display = "";
    pSec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function sidebarFiltreSec(anahtar, etiket, skorFiltresi, activeBtnId) {
  sidebarKapat();
  document.querySelectorAll(".sidebar-filter-btn").forEach((btn) => {
    btn.className = "sidebar-filter-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent transition-all text-left cursor-pointer";
  });

  if (activeBtnId) {
    const el = $(activeBtnId);
    if (el) el.className = "sidebar-filter-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-all text-left cursor-pointer";
  }

  const activeBadge = $("sidebar-stat-active-filter");
  if (activeBadge) activeBadge.textContent = etiket || "Tümü";

  if (panelSearchInput) panelSearchInput.value = anahtar || "";
  if (panelScoreFilter) panelScoreFilter.value = skorFiltresi || (anahtar ? "all" : panelScoreFilter.value);

  basvurulariYukle(1, anahtar || "", skorFiltresi || "all");
  adayListesineKaydir();
  showToast(`${etiket} filtresi uygulandı.`, "info");
}

$("btn-sidebar-filter-all")?.addEventListener("click", () => sidebarFiltreSec("", "Tümü", "all", "btn-sidebar-filter-all"));
$("btn-sidebar-filter-it")?.addEventListener("click", () => sidebarFiltreSec("Yazılım", "Yazılım / IT", "all", "btn-sidebar-filter-it"));
$("btn-sidebar-filter-tourism")?.addEventListener("click", () => sidebarFiltreSec("Turizm", "Turizm / Otel", "all", "btn-sidebar-filter-tourism"));
$("btn-sidebar-filter-rest")?.addEventListener("click", () => sidebarFiltreSec("Restoran", "Restoran / Servis", "all", "btn-sidebar-filter-rest"));
$("btn-sidebar-filter-mgmt")?.addEventListener("click", () => sidebarFiltreSec("Yönetim", "Yönetim & İletişim", "all", "btn-sidebar-filter-mgmt"));

$("btn-sidebar-shortlist")?.addEventListener("click", function () {
  sidebarFiltreSec("", "⭐ Kısa Liste", "high", null);
  this.classList.add("ring-1", "ring-amber-400");
  setTimeout(() => this.classList.remove("ring-1", "ring-amber-400"), 2000);
});

$("btn-sidebar-csv-export")?.addEventListener("click", () => {
  sidebarKapat();
  adayListesineKaydir();
  $("panel-csv-export-btn")?.click();
});

$("btn-sidebar-pdf-export")?.addEventListener("click", () => {
  sidebarKapat();
  adayListesineKaydir();
  topluPdfOzetiIndir();
});

async function topluPdfOzetiIndir() {
  sidebarKapat();
  let list = (mevcutAdaylar && mevcutAdaylar.length > 0) ? mevcutAdaylar : [];

  if (list.length === 0) {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/basvurular?limit=1000", { headers });
      const resData = await res.json();
      list = resData.data || [];
    } catch (e) {
      console.warn("Aday listesi çekilemedi:", e);
    }
  }

  if (!list || list.length === 0) {
    showToast("Listede aday bulunmuyor.", "info");
    alert("Listede aday bulunmuyor.");
    return;
  }

  const sirket = localStorage.getItem("kullaniciAdi") || "Genel Şirket";
  const sirketEtiket = localStorage.getItem("adminToken") ? "Yönetici (Admin)" : sirket;

  const tableRows = list.map((a, i) => {
    const score = a.uygunlukSkoru || 0;
    const info = getScoreInfo(score);
    const tarihStr = a.tarih ? new Date(a.tarih).toLocaleDateString("tr-TR") : "-";
    const gucluStr = (a.gucluYonler || []).slice(0, 2).map((g) => `• ${htmlEntityDecode(g)}`).join("<br/>") || "-";

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; ${i % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">
          ${htmlEntityDecode(a.isim || "Aday")}
          <div style="font-size: 11px; font-weight: normal; color: #64748b;">${htmlEntityDecode(a.eposta || "-")}</div>
        </td>
        <td style="padding: 10px 12px; color: #334155;">${htmlEntityDecode(a.arananKriter || "-")}</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; background: #e0e7ff; color: #3730a3;">
            %${score} (${info.label})
          </span>
        </td>
        <td style="padding: 10px 12px; font-size: 11px; color: #475569; max-width: 250px;">${gucluStr}</td>
        <td style="padding: 10px 12px; font-size: 11px; color: #64748b; text-align: center;">${tarihStr}</td>
      </tr>
    `;
  }).join("");

  const printWin = window.open("", "_blank");
  if (!printWin) {
    showToast("Yazdırma penceresi açılamadı. Lütfen açılır pencere engelleyicisini kontrol edin.", "error");
    return;
  }

  printWin.document.open();
  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8" />
      <title>Toplu Aday Özet Raporu - ${sirketEtiket}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 24px; color: #0f172a; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 14px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; color: #1e1b4b; }
        .meta { font-size: 12px; color: #64748b; text-align: right; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #1e293b; color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">CV Analiz Platformu - Toplu Aday Özeti</div>
          <div style="font-size: 13px; color: #4f46e5; font-weight: 600; margin-top: 2px;">Şirket: ${sirketEtiket}</div>
        </div>
        <div class="meta">
          <div>Tarih: ${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR")}</div>
          <div>Toplam Aday: ${list.length}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Aday Bilgisi</th>
            <th>Aranan Pozisyon</th>
            <th style="text-align: center;">Yapay Zeka Skoru</th>
            <th>Güçlü Yönler</th>
            <th style="text-align: center;">Kayıt Tarihi</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => printWin.print(), 350);
  showToast("Toplu PDF özeti yazdırma penceresine aktarıldı.", "success");
}

// ====== Dosya Yükleme & Sürükle-Bırak ======
if (dropZone && cvFileInput) {
  dropZone.addEventListener("click", () => cvFileInput.click());

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("border-indigo-400", "bg-slate-800/80");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove("border-indigo-400", "bg-slate-800/80");
    });
  });

  dropZone.addEventListener("drop", (e) => {
    if (e.dataTransfer?.files?.length > 0) dosyalariIsle(Array.from(e.dataTransfer.files));
  });

  cvFileInput.addEventListener("change", function () {
    if (this.files?.length > 0) dosyalariIsle(Array.from(this.files));
  });
}

function dosyalariIsle(files) {
  if (!files || files.length === 0) return;
  yuklenenDosyalar = files;

  const countSpan = $("file-count-badge");
  const listUl = $("file-list-preview");
  const isBatchBox = $("batch-badge-container");

  if (fileStatus) fileStatus.classList.remove("hidden");

  if (files.length === 1) {
    const f = files[0];
    if (countSpan) countSpan.textContent = "1 Dosya Seçildi";
    if (isBatchBox) isBatchBox.classList.add("hidden");
    if (listUl) listUl.innerHTML = `<li class="text-xs text-indigo-300 truncate font-mono">📄 ${f.name} (${(f.size / 1024).toFixed(1)} KB)</li>`;

    dosyaMetniniOku(f).then((icerik) => {
      if (typeof icerik === "string" && icerik.startsWith("data:image")) {
        yuklenenGorselBase64 = icerik;
        cvMetniArea.value = `[Görsel CV Yüklendi: ${f.name}]`;
      } else {
        yuklenenGorselBase64 = "";
        cvMetniArea.value = icerik;
      }
      showToast(`${f.name} başarıyla okundu.`, "success");
    });
  } else {
    if (countSpan) countSpan.textContent = `${files.length} Dosya (Toplu Analiz Modu)`;
    if (isBatchBox) isBatchBox.classList.remove("hidden");
    if (listUl) {
      listUl.innerHTML = files.slice(0, 5).map((file) => `<li class="text-xs text-slate-300 truncate font-mono">📄 ${file.name}</li>`).join("") +
        (files.length > 5 ? `<li class="text-xs text-slate-500 italic">...ve ${files.length - 5} dosya daha</li>` : "");
    }
    cvMetniArea.value = `[${files.length} adet CV toplu analiz için sıraya alındı]`;
    showToast(`${files.length} adet CV toplu analize hazırlandı.`, "info");
  }
}

function dosyaMetniniOku(file) {
  return new Promise((resolve) => {
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isImage = file.type.startsWith("image/");

    if (isPdf && typeof pdfjsLib !== "undefined") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const typedarray = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
          const sayfaSayisi = pdf.numPages;
          const metinler = [];
          let bitti = 0;
          for (let p = 1; p <= sayfaSayisi; p++) {
            pdf.getPage(p).then((page) => {
              page.getTextContent().then((tc) => {
                metinler[p - 1] = tc.items.map((i) => i.str).join(" ");
                bitti++;
                if (bitti === sayfaSayisi) resolve(metinler.join("\n\n"));
              });
            });
          }
        }).catch(() => resolve(`PDF metni ayrıştırılamadı: ${file.name}`));
      };
      reader.readAsArrayBuffer(file);
    } else if (isImage) {
      const rImg = new FileReader();
      rImg.onload = (e) => resolve(e.target.result);
      rImg.readAsDataURL(file);
    } else {
      const rTxt = new FileReader();
      rTxt.onload = (e) => resolve(e.target.result);
      rTxt.readAsText(file);
    }
  });
}

function setLoading(active) {
  if (submitBtn) submitBtn.disabled = active;
  if (btnSpinner) btnSpinner.classList.toggle("hidden", !active);
  if (btnText) btnText.textContent = active ? "Yapay Zeka Analiz Ediyor..." : "Yapay Zeka ile Analiz Et";
}

// ====== Sonuç Görüntüleme ======
function renderResult(veri) {
  secilenAdayForMail = veri;
  const candidateName = $("candidate-name");
  const candidateEmail = $("candidate-email");
  const scoreValue = $("score-value");
  const scoreLabel = $("score-label");
  const strongList = $("strong-list");
  const weakList = $("weak-list");

  if (candidateName) candidateName.textContent = htmlEntityDecode(veri.isim || "Aday");
  if (candidateEmail) candidateEmail.textContent = htmlEntityDecode(veri.eposta || "");

  const skor = veri.uygunlukSkoru || 0;
  if (scoreValue) scoreValue.textContent = "%" + skor;

  const colors = getScoreInfo(skor);
  if (scoreLabel) {
    scoreLabel.textContent = `(${colors.label})`;
    scoreLabel.className = `text-xs font-semibold ${colors.text}`;
  }

  if (strongList) {
    strongList.innerHTML = (veri.gucluYonler || [])
      .map((g) => `<li class="tag rounded-lg px-3 py-2 text-xs font-semibold text-emerald-300">${htmlEntityDecode(g)}</li>`)
      .join("");
  }

  if (weakList) {
    weakList.innerHTML = (veri.zayifYonler || [])
      .map((z) => `<li class="tag-weak rounded-lg px-3 py-2 text-xs font-semibold text-amber-300">${htmlEntityDecode(z)}</li>`)
      .join("");
  }

  // XAI ve Mülakat Asistanı
  const resBreakdown = $("result-score-breakdown");
  const resInterviewList = $("result-interview-list");
  const resCopyBtn = $("result-copy-questions-btn");
  if (resBreakdown && resInterviewList) renderSkorVeMulakat(resBreakdown, resInterviewList, veri);
  if (resCopyBtn) resCopyBtn.onclick = () => mulakatSorulariniKopyala(veri);

  // Risk Dedektörü
  const resRiskBox = $("result-risk-box");
  const resRiskList = $("result-risk-list");
  const resRiskBadge = $("result-risk-badge");
  if (resRiskBox && resRiskList) renderRiskler(resRiskBox, resRiskList, resRiskBadge, veri);

  formSection?.classList.add("hidden");
  if (resultSection) {
    resultSection.classList.remove("hidden");
    resultSection.style.opacity = "0";
    requestAnimationFrame(() => {
      resultSection.style.opacity = "1";
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function getScoreInfo(score) {
  if (score >= 80) return { label: "Mükemmel Aday", text: "text-emerald-400", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
  if (score >= 60) return { label: "İyi Aday", text: "text-blue-400", bg: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
  if (score >= 40) return { label: "Gelişime Açık", text: "text-amber-400", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
  return { label: "Yetersiz", text: "text-red-400", bg: "bg-red-500/20 text-red-300 border-red-500/30" };
}

function formVeSonucAlaniniSifirla() {
  if (resultSection) {
    resultSection.classList.add("hidden");
    resultSection.style.opacity = "0";
  }
  formSection?.classList.remove("hidden");
  form?.reset();
  yuklenenDosyalar = [];
  yuklenenGorselBase64 = "";
  fileStatus?.classList.add("hidden");
  $("batch-progress-container")?.classList.add("hidden");
  mevcutAdaylar = [];
  if (panelList) panelList.innerHTML = "";
}

newAnalysisBtn?.addEventListener("click", () => {
  formVeSonucAlaniniSifirla();
  formSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ====== Aday Yönetim Paneli ======
function renderAdaylar(adaylar, filtre = aktifFiltre) {
  mevcutAdaylar = adaylar || [];
  if (!panelList) return;
  panelList.innerHTML = "";
  mevcutAdaylar.forEach((aday, idx) => {
    panelList.appendChild(adayKartiOlustur(aday, idx, filtre));
  });
  panelList.classList.remove("hidden");
  if (typeof kiyaslamaDurumunuGuncelle === "function") kiyaslamaDurumunuGuncelle();
}

async function basvurulariYukle(sayfa = 1, arama, filtre) {
  mevcutAdaylar = [];
  aktifSayfa = sayfa;
  aktifArama = (typeof arama !== "undefined" ? arama : (panelSearchInput?.value.trim() || "")).trim();
  aktifFiltre = filtre || (panelScoreFilter?.value || "all");

  panelSkeleton?.classList.remove("hidden");
  panelList?.classList.add("hidden");
  panelEmpty?.classList.add("hidden");
  panelError?.classList.add("hidden");

  try {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let url = `/api/basvurular?page=${aktifSayfa}&limit=6`;
    if (aktifArama) url += `&search=${encodeURIComponent(aktifArama)}`;
    if (aktifFiltre && aktifFiltre !== "all") url += `&scoreFilter=${encodeURIComponent(aktifFiltre)}`;

    const res = await fetch(url, { headers });
    const resData = await res.json();

    panelSkeleton?.classList.add("hidden");
    const adaylar = resData.data || [];

    if (!resData.success || adaylar.length === 0) {
      panelEmpty?.classList.remove("hidden");
      if (panelCount) panelCount.textContent = "0 Aday";
      if (panelPageInfo) panelPageInfo.textContent = "Sayfa 1 / 1";
      if (panelPrevBtn) panelPrevBtn.disabled = true;
      if (panelNextBtn) panelNextBtn.disabled = true;
      return;
    }

    if (panelCount) panelCount.textContent = `${resData.pagination?.total || adaylar.length} Aday`;
    const totalPages = resData.pagination?.totalPages || 1;
    if (panelPageInfo) panelPageInfo.textContent = `Sayfa ${aktifSayfa} / ${totalPages}`;
    if (panelPrevBtn) panelPrevBtn.disabled = aktifSayfa <= 1;
    if (panelNextBtn) panelNextBtn.disabled = aktifSayfa >= totalPages;

    renderAdaylar(adaylar, aktifFiltre);
  } catch (err) {
    console.error("Aday listesi yükleme hatası:", err);
    panelSkeleton?.classList.add("hidden");
    panelError?.classList.remove("hidden");
  }
}

function adayKartiOlustur(aday, index, filtre) {
  const div = document.createElement("div");
  div.className = "w-full max-w-full overflow-hidden p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3";

  const score = aday.uygunlukSkoru || 0;
  const scoreInfo = getScoreInfo(score);
  const isTop5 = filtre === "top5" || (score >= 80 && index < 5);
  const isAdmin = !!localStorage.getItem("adminToken");
  const isArchived = !!(aday.silindi || aday.silindiMi);
  const isChecked = (typeof secilenKiyaslamaAdaylari !== "undefined") && secilenKiyaslamaAdaylari.includes(aday._id);
  const basHarf = (htmlEntityDecode(aday.isim) || "?").charAt(0).toUpperCase();

  const top5BadgeHtml = isTop5 ? `<span class="badge-top5 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">🌟 En İyi 5 (#${index + 1})</span>` : "";
  const sirketBadgeHtml = (isAdmin && aday.sirketAdi) ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25">🏢 ${htmlEntityDecode(aday.sirketAdi || 'Genel Şirket')}</span>` : "";
  const archiveBadgeHtml = (isAdmin && isArchived) ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">📦 Arşivlendi (Şirket Sildi)</span>` : "";
  const riskBadgeHtml = (Array.isArray(aday.riskler) && aday.riskler.length > 0) ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30" title="${aday.riskler.length} adet dikkat noktası tespit edildi">⚠️ ${aday.riskler.length} Dikkat Noktası</span>` : "";
  const restoreBtnHtml = (isAdmin && isArchived) ? `<button type="button" class="btn-restore px-2.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs transition-all cursor-pointer" title="Geri Yükle">↺</button>` : "";

  div.innerHTML = `
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <label class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/40 text-[11px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer select-none flex-shrink-0">
        <input type="checkbox" class="compare-checkbox w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer" data-id="${aday._id}" ${isChecked ? 'checked' : ''} />
        <span>Kıyasla</span>
      </label>
      <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-sm flex-shrink-0">${basHarf}</div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <h5 class="text-sm font-bold text-white card-candidate-name truncate max-w-full"></h5>
          ${top5BadgeHtml}${sirketBadgeHtml}${archiveBadgeHtml}${riskBadgeHtml}
        </div>
        <p class="text-xs text-slate-400 mt-0.5 card-candidate-kriter break-words line-clamp-2"></p>
      </div>
    </div>

    <div class="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
      <div class="px-3 py-1 rounded-xl text-xs font-bold ${scoreInfo.bg}">%${score}</div>
      <button type="button" class="btn-detail px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer">Detaylar</button>
      <button type="button" class="btn-mail px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs transition-all cursor-pointer" title="E-posta ile Paylaş">✉</button>
      ${restoreBtnHtml}
      <button type="button" class="btn-delete px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/20 text-xs transition-all cursor-pointer" title="${isAdmin && isArchived ? 'Kalıcı Olarak Sil' : 'Sil (Arşivle)'}">✕</button>
    </div>
  `;

  div.querySelector(".card-candidate-name").textContent = htmlEntityDecode(aday.isim || "İsimsiz");
  div.querySelector(".card-candidate-kriter").textContent = htmlEntityDecode(aday.arananKriter || "Pozisyon Belirtilmedi");

  div.querySelector(".compare-checkbox")?.addEventListener("change", function () {
    if (typeof secilenKiyaslamaAdaylari === "undefined") window.secilenKiyaslamaAdaylari = [];
    if (this.checked) {
      if (!secilenKiyaslamaAdaylari.includes(aday._id)) {
        if (secilenKiyaslamaAdaylari.length >= 2) {
          secilenKiyaslamaAdaylari.shift();
          document.querySelectorAll(".compare-checkbox").forEach((c) => {
            if (!secilenKiyaslamaAdaylari.includes(c.getAttribute("data-id"))) c.checked = false;
          });
        }
        secilenKiyaslamaAdaylari.push(aday._id);
      }
    } else {
      window.secilenKiyaslamaAdaylari = secilenKiyaslamaAdaylari.filter((id) => id !== aday._id);
    }
    if (typeof kiyaslamaDurumunuGuncelle === "function") kiyaslamaDurumunuGuncelle();
  });

  div.querySelector(".btn-detail").addEventListener("click", () => detayModalAc(aday));
  div.querySelector(".btn-mail").addEventListener("click", () => mailModalAc(aday));

  div.querySelector(".btn-restore")?.addEventListener("click", async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/basvurular/${aday._id}/restore`, { method: "PUT", headers });
      if (!res.ok) throw new Error("Geri yükleme başarısız.");
      showToast("Aday kaydı başarıyla geri yüklendi.", "success");
      basvurulariYukle(aktifSayfa, aktifArama, aktifFiltre);
      dashboardGuncelle();
      if (typeof adminSirketleriYukle === "function") adminSirketleriYukle();
    } catch (err) {
      showToast(err.message || "Geri yüklenemedi.", "error");
    }
  });

  div.querySelector(".btn-delete").addEventListener("click", async () => {
    const msg = (isAdmin && isArchived)
      ? "Bu adayı veritabanından KALICI OLARAK silmek istediğinize emin misiniz?"
      : "Adayı silmek istediğinize emin misiniz?";
    if (!confirm(msg)) return;

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let url = `/api/basvurular/${aday._id}`;
      if (isAdmin && isArchived) url += "?kalici=true";

      const res = await fetch(url, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Silme başarısız.");
      showToast(isAdmin && isArchived ? "Aday kalıcı olarak silindi." : "Aday kaydı başarıyla silindi.", "success");
      basvurulariYukle(aktifSayfa, aktifArama, aktifFiltre);
      dashboardGuncelle();
      if (typeof adminSirketleriYukle === "function") adminSirketleriYukle();
    } catch (e) {
      showToast(e.message, "error");
    }
  });

  return div;
}

// ====== Form Gönderimi ======
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isim = isimInput?.value.trim() || "";
    const eposta = epostaInput?.value.trim() || "";
    const arananKriter = arananKriterInput?.value.trim() || "";
    const cvMetni = cvMetniArea?.value.trim() || "";

    if (!arananKriter || (!cvMetni && !yuklenenGorselBase64 && yuklenenDosyalar.length === 0)) {
      showError("Lütfen tüm zorunlu alanları doldurunuz (Aranan kriter ve CV metni zorunludur).");
      return;
    }

    if (yuklenenDosyalar.length > 1) {
      topluCvAnalizEt(yuklenenDosyalar, arananKriter);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/basvuru", {
        method: "POST",
        headers,
        body: JSON.stringify({
          isim: isim || "Aday",
          eposta,
          arananKriter,
          cvMetni,
          gorselVerisi: yuklenenGorselBase64 || "",
        }),
      });

      const resData = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(resData.hata || resData.mesaj || "Analiz sırasında bir hata oluştu.");

      renderResult(resData.veri || resData);
      basvurulariYukle(1, "");
      dashboardGuncelle();
      showToast("CV başarıyla analiz edildi ve kaydedildi.", "success");
    } catch (err) {
      setLoading(false);
      showError(err.message || "Bir hata oluştu.");
    }
  });
}

// Toplu CV Analizi
async function topluCvAnalizEt(files, arananKriter) {
  const progressContainer = $("batch-progress-container");
  const progressBar = $("batch-progress-bar");
  const progressText = $("batch-progress-text");

  progressContainer?.classList.remove("hidden");
  setLoading(true);

  const total = files.length;
  let basarili = 0;
  let sonAnaliz = null;

  const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const dosyaAdiTemiz = file.name.replace(/\.[^/.]+$/, "");
    if (progressText) progressText.textContent = `(${i + 1}/${total}) ${file.name} analiz ediliyor...`;
    if (progressBar) progressBar.style.width = `${Math.round((i / total) * 100)}%`;

    try {
      const icerik = await dosyaMetniniOku(file);
      const isGorsel = typeof icerik === "string" && icerik.startsWith("data:image");

      const res = await fetch("/api/basvuru", {
        method: "POST",
        headers,
        body: JSON.stringify({
          isim: dosyaAdiTemiz || `Aday ${i + 1}`,
          eposta: "",
          arananKriter,
          cvMetni: isGorsel ? `[Görsel CV: ${file.name}]` : icerik,
          gorselVerisi: isGorsel ? icerik : "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        basarili++;
        sonAnaliz = data.veri || data;
      }
    } catch (err) {
      console.warn(`${file.name} analizi başarısız:`, err);
    }
  }

  if (progressBar) progressBar.style.width = "100%";
  if (progressText) progressText.textContent = `Tamamlandı: ${basarili} / ${total} dosya başarıyla analiz edildi.`;
  setLoading(false);

  showToast(`Toplu analiz tamamlandı: ${basarili} / ${total} aday eklendi.`, "success");
  basvurulariYukle(1, "");
  dashboardGuncelle();
  if (sonAnaliz) renderResult(sonAnaliz);
}

// Panel Arama ve Filtre Dinleyicileri
panelSearchInput?.addEventListener("input", function () {
  basvurulariYukle(1, this.value.trim(), panelScoreFilter?.value);
});

$("panel-search-btn")?.addEventListener("click", () => {
  basvurulariYukle(1, panelSearchInput?.value.trim() || "", panelScoreFilter?.value || "all");
});

panelScoreFilter?.addEventListener("change", function () {
  basvurulariYukle(1, panelSearchInput?.value.trim() || "", this.value);
});

$("panel-refresh-btn")?.addEventListener("click", () => {
  if (panelSearchInput) panelSearchInput.value = "";
  if (panelScoreFilter) panelScoreFilter.value = "all";
  basvurulariYukle(1, "", "all");
});

panelPrevBtn?.addEventListener("click", () => {
  if (aktifSayfa > 1) basvurulariYukle(aktifSayfa - 1, aktifArama, aktifFiltre);
});

panelNextBtn?.addEventListener("click", () => {
  basvurulariYukle(aktifSayfa + 1, aktifArama, aktifFiltre);
});

// ====== Toplu Aday Silme (Admin: Kalıcı / Şirket: Arşiv) ======
async function tumAdaylariSil() {
  const isAdmin = !!(localStorage.getItem("adminToken") || (typeof aktifKullanici !== "undefined" && aktifKullanici?.rol === "admin"));
  const onayMesaji = isAdmin
    ? "DİKKAT: Arşivlenmiş olanlar dahil TÜM aday verileri kalıcı olarak silinecektir. Onaylıyor musunuz?"
    : "Tüm aday kayıtlarını silmek istediğinize emin misiniz?";

  if (!confirm(onayMesaji)) return;

  try {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = isAdmin ? "/api/basvurular?hardDelete=true" : "/api/basvurular";
    const res = await fetch(url, { method: "DELETE", headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.hata || errData.message || "Toplu silme başarısız.");
    }

    // 1. Liste görünümünü temizle ve boş durum mesajını göster
    if (panelList) panelList.innerHTML = "";
    if (panelEmpty) panelEmpty.classList.remove("hidden");
    if (panelSkeleton) panelSkeleton.classList.add("hidden");
    if (panelError) panelError.classList.add("hidden");

    // 2. Sayaçları anında 0 olarak güncelle
    const countIds = ["panel-count", "stat-total-count", "sidebar-stat-total", "stat-excellent-count", "sidebar-stat-high"];
    countIds.forEach((id) => {
      const el = $(id);
      if (el) el.textContent = "0";
    });
    const avgScoreEl = $("stat-avg-score");
    if (avgScoreEl) avgScoreEl.textContent = "%0";

    // 3. Dashboard grafiklerini boş verilerle sıfırla
    if (typeof scoreChart !== "undefined" && scoreChart) {
      scoreChart.data.datasets[0].data = [0, 0, 0];
      scoreChart.update();
    }
    if (typeof kriterChart !== "undefined" && kriterChart) {
      kriterChart.data.labels = [];
      kriterChart.data.datasets[0].data = [];
      kriterChart.update();
    }

    mevcutAdaylar = [];
    aktifSayfa = 1;

    // Şirket listesi varsa güncelle
    if (typeof adminSirketleriYukle === "function") adminSirketleriYukle();

    // 4. Başarılı bildirim toast mesajı göster
    showToast("Tüm adaylar ve arşiv kalıcı olarak temizlendi.", "success");

    // Verileri tazele
    basvurulariYukle(1, "");
    dashboardGuncelle();
  } catch (e) {
    showToast(e.message || "Silme işlemi sırasında hata oluştu.", "error");
  }
}

$("panel-delete-all-btn")?.addEventListener("click", tumAdaylariSil);

// ====== CSV Dışa Aktarma ======
$("panel-csv-export-btn")?.addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch("/api/basvurular?limit=1000", { headers });
    const resData = await res.json();
    const data = resData.data || [];

    if (data.length === 0) {
      showToast("Dışa aktarılacak aday verisi bulunmuyor.", "info");
      return;
    }

    const satirlar = ["Ad Soyad,E-posta,Aranan Kriter,Uygunluk Skoru,Güçlü Yönler,Zayıf Yönler,Tarih"];
    data.forEach((a) => {
      const isim = `"${(a.isim || "").replace(/"/g, '""')}"`;
      const eposta = `"${(a.eposta || "").replace(/"/g, '""')}"`;
      const kriter = `"${(a.arananKriter || "").replace(/"/g, '""')}"`;
      const skor = `"%${a.uygunlukSkoru || 0}"`;
      const guclu = `"${(a.gucluYonler || []).join("; ").replace(/"/g, '""')}"`;
      const zayif = `"${(a.zayifYonler || []).join("; ").replace(/"/g, '""')}"`;
      const tarih = a.tarih ? new Date(a.tarih).toLocaleDateString("tr-TR") : "-";
      satirlar.push([isim, eposta, kriter, skor, guclu, zayif, tarih].join(","));
    });

    const blob = new Blob(["\uFEFF" + satirlar.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.download = "Aday_Analiz_Raporu.csv";
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
    URL.revokeObjectURL(url);

    showToast("Aday listesi CSV formatında dışa aktarıldı.", "success");
  } catch (e) {
    showToast(`CSV dışa aktarma hatası: ${e.message}`, "error");
  }
});

// ====== XAI ve Mülakat Asistanı Render ======
function renderSkorVeMulakat(breakdownContainer, questionsContainer, aday) {
  if (!breakdownContainer || !questionsContainer) return;

  breakdownContainer.innerHTML = "";
  const skor = aday.uygunlukSkoru || 0;
  const kirilim = (aday.skorKirilimi && aday.skorKirilimi.length > 0)
    ? aday.skorKirilimi
    : [
        `+ %${Math.round(skor * 0.5)}: Temel teknik yetkinlik ve gereksinim uyumu`,
        `+ %${Math.round(skor * 0.35)}: Sektörel iş tecrübesi ve proje tutarlılığı`,
        skor < 80 ? `- %${100 - skor}: İlanda aranan bazı spesifik kriterlerdeki eksiklikler` : `+ %${Math.max(skor - 75, 5)}: Standart beklentilerin üzerindeki yetkinlik seviyesi`
      ];

  kirilim.forEach((madde) => {
    const div = document.createElement("div");
    const mStr = String(madde).trim();
    const isPositive = mStr.startsWith("+");
    const isNegative = mStr.startsWith("-");

    const badgeStyle = isPositive
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
      : (isNegative ? "bg-red-500/10 text-red-300 border-red-500/25" : "bg-indigo-500/10 text-indigo-300 border-indigo-500/25");

    div.className = `flex items-center gap-2.5 p-2.5 rounded-lg border text-xs ${badgeStyle}`;
    div.innerHTML = `
      <span class="text-sm flex-shrink-0">${isPositive ? "📈" : (isNegative ? "📉" : "ℹ️")}</span>
      <span class="font-medium flex-1">${htmlEntityDecode(mStr)}</span>
    `;
    breakdownContainer.appendChild(div);
  });

  questionsContainer.innerHTML = "";
  const sorular = (aday.mulakatSorulari && aday.mulakatSorulari.length > 0)
    ? aday.mulakatSorulari
    : [
        "Özgeçmişinizde belirtilen pozisyon deneyiminiz doğrultusunda, yönettiğiniz en karmaşık projeyi ve aldığınız kritik mimari kararları anlatır mısınız?",
        "Aranan kriterdeki beklentiler ve teknik gereksinimler karşısında karşılaşabileceğiniz engelleri nasıl aşmayı planlıyorsunuz?",
        "Zaman kısıtı ve yüksek teslimat baskısı altında ekip içi iletişimi ve kriz yönetimini nasıl sağlarsınız?"
      ];

  sorular.forEach((soru, i) => {
    const li = document.createElement("li");
    li.className = "flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/70 border border-purple-500/20";
    li.innerHTML = `
      <span class="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">${i + 1}</span>
      <span class="text-xs text-slate-200 leading-relaxed">${htmlEntityDecode(soru)}</span>
    `;
    questionsContainer.appendChild(li);
  });
}

function mulakatSorulariniKopyala(aday) {
  if (!aday) return;
  const isim = htmlEntityDecode(aday.isim || "Aday");
  const kriter = htmlEntityDecode(aday.arananKriter || "Pozisyon");
  const sorular = (aday.mulakatSorulari && aday.mulakatSorulari.length > 0)
    ? aday.mulakatSorulari
    : [
        "Özgeçmişinizde belirtilen pozisyon deneyiminiz doğrultusunda, yönettiğiniz en karmaşık projeyi ve aldığınız kritik mimari kararları anlatır mısınız?",
        "Aranan kriterdeki beklentiler ve teknik gereksinimler karşısında karşılaşabileceğiniz engelleri nasıl aşmayı planlıyorsunuz?",
        "Zaman kısıtı ve yüksek teslimat baskısı altında ekip içi iletişimi ve kriz yönetimini nasıl sağlarsınız?"
      ];

  const text = `🎙️ Kişiselleştirilmiş Mülakat Soruları - ${isim} (${kriter})\n\n` +
    sorular.map((s, i) => `${i + 1}. ${htmlEntityDecode(s)}`).join("\n\n");

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast("3 mülakat sorusu panoya kopyalandı!", "success"))
      .catch(() => showToast("Panoya kopyalanamadı.", "error"));
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("3 mülakat sorusu panoya kopyalandı!", "success");
    } catch (err) {
      showToast("Panoya kopyalanamadı.", "error");
    }
    textArea.remove();
  }
}

// ====== Risk Dedektörü Render ======
function renderRiskler(riskBox, riskList, riskBadge, aday) {
  if (!riskBox || !riskList) return;
  riskList.innerHTML = "";
  const riskler = Array.isArray(aday.riskler) ? aday.riskler : [];

  if (riskler.length === 0) {
    riskList.innerHTML = `<li class="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"><span>✅</span><span>Belirgin bir kariyer boşluğu veya risk tespit edilmedi. (Temiz Profil)</span></li>`;
    if (riskBadge) {
      riskBadge.textContent = "Temiz Profil";
      riskBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    }
  } else {
    if (riskBadge) {
      riskBadge.textContent = `${riskler.length} Dikkat Noktası`;
      riskBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30";
    }
    riskList.innerHTML = riskler.map((r) => `<li class="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 text-amber-200 border border-amber-500/25"><span class="mt-0.5">⚠️</span><span class="leading-snug">${htmlEntityDecode(r)}</span></li>`).join("");
  }
}

// ====== Hızlı AI E-posta Şablonları (Template Literals) ======
function epostaSablonuHazirla(aday, tip) {
  if (!aday) return;
  const isim = htmlEntityDecode(aday.isim || "Aday");
  const eposta = htmlEntityDecode(aday.eposta || "");
  const kriter = htmlEntityDecode(aday.arananKriter || "Pozisyon");
  const sirket = htmlEntityDecode(aday.sirketAdi || localStorage.getItem("kullaniciAdi") || "Şirketimiz");

  let subject = "";
  let body = "";

  if (tip === "davet") {
    subject = `Mülakat Daveti: ${kriter} - ${sirket}`;
    body = `Sayın ${isim},

${sirket} bünyesindeki "${kriter}" pozisyonuna yapmış olduğunuz başvuru ve özgeçmişiniz titizlikle değerlendirilmiş olup, yetkinlikleriniz pozisyon kriterlerimizle son derece uyumlu bulunmuştur.

Sizinle karşılıklı teknik ve kültürel uyumu değerlendireceğimiz bir mülakat görüşmesi gerçekleştirmek istiyoruz.

Uygun olduğunuz gün ve saat aralıklarını bu e-postayı yanıtlayarak bizimle paylaşabilirsiniz.

İlginiz için teşekkür eder, mülakat sürecinde başarılar dileriz.

Saygılarımızla,
${sirket} İnsan Kaynakları Ekibi`;
  } else {
    subject = `Başvuru Durumu: ${kriter} - ${sirket}`;
    body = `Sayın ${isim},

${sirket} olarak "${kriter}" pozisyonuna göstermiş olduğunuz ilgi ve başvurunuz için teşekkür ederiz.

Özgeçmişiniz titizlikle incelenmiş olup, mevcut dönemde aradığımız spesifik kriterler doğrultusunda diğer adaylarla ilerleme kararı alınmıştır.

Özgeçmişiniz gelecekte açılabilecek uygun pozisyonlar için yetenek havuzumuzda saklanacaktır. Kariyer yolculuğunuzda başarılar dileriz.

Saygılarımızla,
${sirket} İnsan Kaynakları Ekibi`;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(body);
  }

  showToast(tip === "davet" ? "Mülakat davet şablonu kopyalandı! E-posta istemcisi açılıyor..." : "Nazik ret şablonu kopyalandı! E-posta istemcisi açılıyor...", "success");

  setTimeout(() => {
    window.location.href = `mailto:${encodeURIComponent(eposta)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, 300);
}

// ====== Detay Modalı ======
function detayModalAc(aday) {
  secilenAdayForMail = aday;
  $("modal-name").textContent = htmlEntityDecode(aday.isim || "Aday");
  $("modal-email").textContent = htmlEntityDecode(aday.eposta || "");

  let dateStr = aday.tarih ? `Tarih: ${new Date(aday.tarih).toLocaleDateString("tr-TR")}` : "";
  if (localStorage.getItem("adminToken") && aday.sirketAdi) {
    dateStr += `${dateStr ? " | " : ""}🏢 Şirket: ${htmlEntityDecode(aday.sirketAdi || "Genel Şirket")}`;
  }
  $("modal-date").textContent = dateStr;
  $("modal-kriter").textContent = htmlEntityDecode(aday.arananKriter || "Belirtilmedi");
  $("modal-cv-text").textContent = htmlEntityDecode(aday.cvMetni || "CV metni bulunmuyor.");

  const score = aday.uygunlukSkoru || 0;
  const scoreInfo = getScoreInfo(score);
  const badge = $("modal-score-badge");
  badge.textContent = `%${score} (${scoreInfo.label})`;
  badge.className = `px-3.5 py-1.5 rounded-xl font-bold text-xs ${scoreInfo.bg}`;

  $("modal-strong-list").innerHTML = (aday.gucluYonler || [])
    .map((g) => `<li class="tag rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-300">${htmlEntityDecode(g)}</li>`)
    .join("");

  $("modal-weak-list").innerHTML = (aday.zayifYonler || [])
    .map((z) => `<li class="tag-weak rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-300">${htmlEntityDecode(z)}</li>`)
    .join("");

  // XAI & Mülakat
  renderSkorVeMulakat($("modal-score-breakdown"), $("modal-interview-list"), aday);
  const modalCopyBtn = $("modal-copy-questions-btn");
  if (modalCopyBtn) modalCopyBtn.onclick = () => mulakatSorulariniKopyala(aday);

  // Risk Dedektörü
  renderRiskler($("modal-risk-box"), $("modal-risk-list"), $("modal-risk-count-badge"), aday);

  // Hızlı E-posta Şablonları
  const quickInviteBtn = $("modal-quick-invite-btn");
  const quickRejectBtn = $("modal-quick-reject-btn");
  if (quickInviteBtn) quickInviteBtn.onclick = () => epostaSablonuHazirla(aday, "davet");
  if (quickRejectBtn) quickRejectBtn.onclick = () => epostaSablonuHazirla(aday, "ret");

  const gBox = $("modal-gorsel-box");
  const gImg = $("modal-gorsel-img");
  if (aday.gorselVerisi) {
    gImg.src = aday.gorselVerisi;
    gBox.classList.remove("hidden");
  } else {
    gBox.classList.add("hidden");
  }

  detailModal?.classList.remove("hidden");
}

function detayModalKapat() {
  detailModal?.classList.add("hidden");
}

$("modal-close-btn")?.addEventListener("click", detayModalKapat);
$("modal-close-btn-bottom")?.addEventListener("click", detayModalKapat);
detailModal?.addEventListener("click", (e) => {
  if (e.target === detailModal) detayModalKapat();
});

// ====== PDF İndirme ======
$("download-pdf-btn")?.addEventListener("click", () => pdfRaporuIndir("result-section", "Aday_Analiz_Raporu.pdf"));
$("modal-download-pdf-btn")?.addEventListener("click", () => pdfRaporuIndir("detail-modal", "Aday_Analiz_Raporu.pdf"));

function pdfRaporuIndir(elemId, dosyaAdi) {
  const elem = $(elemId);
  if (!elem) return;
  if (typeof html2pdf === "undefined") {
    showToast("PDF kütüphanesi yüklenemedi.", "error");
    return;
  }
  const opt = {
    margin: [10, 10, 10, 10],
    filename: dosyaAdi,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#0a0f1a" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };
  html2pdf().set(opt).from(elem).save().then(() => {
    showToast("PDF raporu başarıyla indirildi.", "success");
  });
}

// ====== E-Posta Gönderme Modalı ======
const mailModal = $("mail-modal");
const mailForm = $("mail-form");
const mailRecipient = $("mail-recipient");
const mailSummary = $("mail-candidate-summary");

function mailModalAc(aday) {
  secilenAdayForMail = aday;
  mailSummary.innerHTML = `
    <strong>Aday:</strong> <span>${htmlEntityDecode(aday.isim || "Aday")}</span><br/>
    <strong>Pozisyon:</strong> <span>${htmlEntityDecode(aday.arananKriter || "-")}</span><br/>
    <strong>Hassas Skor:</strong> %${aday.uygunlukSkoru || 0}
  `;
  mailRecipient.value = htmlEntityDecode(aday.eposta || "");
  mailModal?.classList.remove("hidden");
}

$("result-mail-btn")?.addEventListener("click", () => {
  if (secilenAdayForMail) mailModalAc(secilenAdayForMail);
});

$("modal-mail-btn")?.addEventListener("click", () => {
  if (secilenAdayForMail) mailModalAc(secilenAdayForMail);
});

$("mail-cancel-btn")?.addEventListener("click", () => {
  mailModal?.classList.add("hidden");
});

mailForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!secilenAdayForMail) return;

  const to = mailRecipient.value.trim();
  const btn = $("mail-send-btn");
  btn.disabled = true;
  btn.textContent = "Gönderiliyor...";

  try {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/mail-gonder", {
      method: "POST",
      headers,
      body: JSON.stringify({
        to,
        adayAdi: secilenAdayForMail.isim,
        skor: secilenAdayForMail.uygunlukSkoru,
        arananKriter: secilenAdayForMail.arananKriter,
        gucluYonler: secilenAdayForMail.gucluYonler,
        zayifYonler: secilenAdayForMail.zayifYonler,
      }),
    });

    const resData = await res.json();
    btn.disabled = false;
    btn.textContent = "Gönder";
    mailModal?.classList.add("hidden");

    if (resData.success) {
      showToast(`Aday değerlendirme raporu ${to} adresine başarıyla gönderildi!`, "success");
    } else {
      showToast(resData.mesaj || "E-posta gönderilemedi.", "error");
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Gönder";
    showToast(`E-posta gönderim hatası: ${err.message}`, "error");
  }
});

// ====== Dashboard & Grafikler ======
async function dashboardGuncelle() {
  try {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("userToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch("/api/basvurular?limit=1000", { headers });
    const resData = await res.json();
    const list = resData.data || [];

    const total = list.length;
    let totalScore = 0;
    let excellentCount = 0;
    const scoreCounts = { high: 0, mid: 0, low: 0 };
    const kriterCounts = {};

    list.forEach((a) => {
      const s = a.uygunlukSkoru || 0;
      totalScore += s;
      if (s >= 80) {
        excellentCount++;
        scoreCounts.high++;
      } else if (s >= 50) {
        scoreCounts.mid++;
      } else {
        scoreCounts.low++;
      }

      const k = a.arananKriter || "Diğer";
      kriterCounts[k] = (kriterCounts[k] || 0) + 1;
    });

    const avg = total > 0 ? Math.round(totalScore / total) : 0;

    const statTotal = $("stat-total-count");
    if (statTotal) statTotal.textContent = total;
    const statAvg = $("stat-avg-score");
    if (statAvg) statAvg.textContent = `%${avg}`;
    const statExc = $("stat-excellent-count");
    if (statExc) statExc.textContent = excellentCount;

    const sidebarTotalEl = $("sidebar-stat-total");
    if (sidebarTotalEl) sidebarTotalEl.textContent = total;
    const sidebarHighEl = $("sidebar-stat-high");
    if (sidebarHighEl) sidebarHighEl.textContent = excellentCount;

    // Doughnut Grafiği
    const scoreCanvas = $("score-chart");
    if (scoreCanvas && typeof Chart !== "undefined") {
      if (scoreChart) scoreChart.destroy();
      scoreChart = new Chart(scoreCanvas, {
        type: "doughnut",
        data: {
          labels: ["Mükemmel (%80+)", "İyi (%50-%79)", "Düşük (%0-%49)"],
          datasets: [{
            data: [scoreCounts.high, scoreCounts.mid, scoreCounts.low],
            backgroundColor: ["#10b981", "#3b82f6", "#ef4444"],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: "#cbd5e1", font: { size: 11 } } } },
        },
      });
    }

    // Bar Grafiği
    const kriterCanvas = $("kriter-chart");
    if (kriterCanvas && typeof Chart !== "undefined") {
      if (kriterChart) kriterChart.destroy();
      const kLabels = Object.keys(kriterCounts).slice(0, 5);
      const kData = kLabels.map((k) => kriterCounts[k]);

      kriterChart = new Chart(kriterCanvas, {
        type: "bar",
        data: {
          labels: kLabels,
          datasets: [{
            label: "Başvuru Sayısı",
            data: kData,
            backgroundColor: "#6366f1",
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          scales: {
            x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: "#94a3b8", stepSize: 1 }, grid: { color: "rgba(148,163,184,0.1)" } },
          },
          plugins: { legend: { display: false } },
        },
      });
    }
  } catch (e) {
    console.warn("Dashboard güncelleme hatası:", e);
  }
}

// ====== Başlangıç / Boot ======
document.addEventListener("DOMContentLoaded", () => {
  // Sayfa açılışında olası body kaydırma kilitlerini sıfırla
  document.body.classList.remove("overflow-hidden");
  document.body.style.overflow = "";

  const oturumVar = (typeof oturumKontrol === "function") ? oturumKontrol() : false;
  if (oturumVar) {
    basvurulariYukle(1, "");
    dashboardGuncelle();
  }
  if (typeof saglikKontroluYap === "function") {
    saglikKontroluYap();
    setInterval(saglikKontroluYap, 30000);
  }
});

// Modül ve Test Dışa Aktarımları
window.showToast = showToast;
window.showError = showError;
window.htmlEntityDecode = htmlEntityDecode;
window.getScoreInfo = getScoreInfo;
window.renderAdaylar = renderAdaylar;
window.basvurulariYukle = basvurulariYukle;
window.adaylariYukle = basvurulariYukle;
window.detayModalAc = detayModalAc;
window.detayModalKapat = detayModalKapat;
window.mailModalAc = mailModalAc;
window.dashboardGuncelle = dashboardGuncelle;
window.formVeSonucAlaniniSifirla = formVeSonucAlaniniSifirla;
window.topluPdfOzetiIndir = topluPdfOzetiIndir;
window.sidebarAc = sidebarAc;
window.sidebarKapat = sidebarKapat;
window.sidebarFiltreSec = sidebarFiltreSec;
window.adayListesineKaydir = adayListesineKaydir;
window.renderSkorVeMulakat = renderSkorVeMulakat;
window.mulakatSorulariniKopyala = mulakatSorulariniKopyala;
window.renderRiskler = renderRiskler;
window.epostaSablonuHazirla = epostaSablonuHazirla;
window.dosyaMetniniOku = dosyaMetniniOku;
window.tumAdaylariSil = tumAdaylariSil;
