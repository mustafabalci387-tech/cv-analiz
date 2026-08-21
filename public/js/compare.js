// ====== CV Analiz Platformu - Aday Kıyaslama Modülü (compare.js) ======

let secilenKiyaslamaAdaylari = [];

function kiyaslamaDurumunuGuncelle() {
  const floatingBar = document.getElementById("compare-floating-bar");
  const compareBtn = document.getElementById("compare-submit-btn");
  const compareText = document.getElementById("compare-bar-text");

  if (!floatingBar || !compareBtn) return;

  const secilenler = (typeof mevcutAdaylar !== "undefined" ? mevcutAdaylar : []).filter((a) =>
    secilenKiyaslamaAdaylari.includes(a._id)
  );

  if (secilenKiyaslamaAdaylari.length === 0) {
    floatingBar.classList.add("hidden");
  } else {
    floatingBar.classList.remove("hidden");
    if (secilenKiyaslamaAdaylari.length === 1) {
      const isim1 = secilenler[0] ? (typeof htmlEntityDecode === "function" ? htmlEntityDecode(secilenler[0].isim) : secilenler[0].isim) : "1. Aday";
      compareText.textContent = `1 Aday Seçildi: ${isim1} (Kıyaslamak için 1 aday daha seçin)`;
      compareBtn.disabled = true;
      compareBtn.textContent = "Adayları Kıyasla (1/2)";
      compareBtn.className = "px-4 py-2 rounded-xl bg-slate-700 text-slate-400 text-xs font-bold cursor-not-allowed opacity-60";
    } else if (secilenKiyaslamaAdaylari.length >= 2) {
      const ad1 = secilenler[0] ? (typeof htmlEntityDecode === "function" ? htmlEntityDecode(secilenler[0].isim) : secilenler[0].isim) : "1. Aday";
      const ad2 = secilenler[1] ? (typeof htmlEntityDecode === "function" ? htmlEntityDecode(secilenler[1].isim) : secilenler[1].isim) : "2. Aday";
      compareText.textContent = `2 Aday Seçildi: ${ad1} ⚡ ${ad2}`;
      compareBtn.disabled = false;
      compareBtn.textContent = "⚖️ Adayları Kıyasla (2)";
      compareBtn.className = "px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 cursor-pointer";
    }
  }
}

document.getElementById("compare-clear-btn")?.addEventListener("click", () => {
  secilenKiyaslamaAdaylari = [];
  window.secilenKiyaslamaAdaylari = secilenKiyaslamaAdaylari;
  document.querySelectorAll(".compare-checkbox").forEach((cb) => { cb.checked = false; });
  kiyaslamaDurumunuGuncelle();
});

document.getElementById("compare-submit-btn")?.addEventListener("click", adaylariKiyaslaModalAc);
document.getElementById("compare-modal-close-btn")?.addEventListener("click", compareModalKapat);
document.getElementById("compare-modal-close-bottom-btn")?.addEventListener("click", compareModalKapat);
document.getElementById("compare-modal")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("compare-modal")) compareModalKapat();
});

function compareModalKapat() {
  document.getElementById("compare-modal")?.classList.add("hidden");
}

function adaylariKiyaslaModalAc() {
  const modal = document.getElementById("compare-modal");
  const container = document.getElementById("compare-columns-container");
  if (!modal || !container) return;

  const secilenler = (typeof mevcutAdaylar !== "undefined" ? mevcutAdaylar : []).filter((a) =>
    secilenKiyaslamaAdaylari.includes(a._id)
  );

  if (secilenler.length < 2) {
    if (typeof showToast === "function") showToast("Lütfen kıyaslamak için listeden 2 aday seçiniz.", "info");
    return;
  }

  const [a1, a2] = secilenler;
  const s1 = a1.uygunlukSkoru || 0;
  const s2 = a2.uygunlukSkoru || 0;

  function renderCompareColumn(a, isWinner, otherScore) {
    const score = a.uygunlukSkoru || 0;
    const scoreInfo = typeof getScoreInfo === "function" ? getScoreInfo(score) : { label: "Aday", bg: "bg-indigo-500/20 text-indigo-300" };
    const decode = typeof htmlEntityDecode === "function" ? htmlEntityDecode : (t) => t || "";

    const winnerBadge = isWinner && score !== otherScore
      ? '<span class="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">👑 Daha Yüksek Skor</span>'
      : "";

    const gucluList = (a.gucluYonler || []).map((g) => `<li class="tag rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-300">${decode(g)}</li>`).join("") || '<li class="text-xs text-slate-500">-</li>';
    const zayifList = (a.zayifYonler || []).map((z) => `<li class="tag-weak rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-300">${decode(z)}</li>`).join("") || '<li class="text-xs text-slate-500">-</li>';

    const riskList = (Array.isArray(a.riskler) && a.riskler.length > 0)
      ? a.riskler.map((r) => `<li class="p-2 rounded-lg bg-amber-500/10 text-amber-200 border border-amber-500/20 text-xs">⚠️ ${decode(r)}</li>`).join("")
      : '<li class="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs">✅ Belirgin risk tespit edilmedi.</li>';

    const kirilimList = ((a.skorKirilimi && a.skorKirilimi.length > 0) ? a.skorKirilimi : [
      `+ %${Math.round(score * 0.5)}: Temel teknik yetkinlik uyumu`,
      `+ %${Math.round(score * 0.35)}: Sektörel deneyim ve kapsam`
    ]).map((k) => {
      const isPos = String(k).trim().startsWith("+");
      const cl = isPos ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" : "bg-red-500/10 text-red-300 border-red-500/25";
      return `<div class="p-2 rounded-lg border text-xs ${cl}">${decode(k)}</div>`;
    }).join("");

    return `
      <div class="p-5 rounded-2xl bg-slate-800/60 border ${isWinner && score !== otherScore ? 'border-emerald-500/40 shadow-xl shadow-emerald-950/20' : 'border-slate-700/60'} space-y-4">
        <div class="flex items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 font-extrabold flex items-center justify-center text-lg flex-shrink-0">
              ${(decode(a.isim) || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 class="text-base font-extrabold text-white">${decode(a.isim || "Aday")}</h4>
              <p class="text-xs text-indigo-400 font-medium">${decode(a.eposta || "-")}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="px-3.5 py-1.5 rounded-xl font-extrabold text-sm ${scoreInfo.bg}">%${score}</div>
            <div class="text-[11px] text-slate-400 mt-1">${scoreInfo.label}</div>
          </div>
        </div>

        ${winnerBadge ? `<div class="text-center">${winnerBadge}</div>` : ""}

        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Aranan Pozisyon / Kriter</p>
          <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
            ${decode(a.arananKriter || "Genel")}
          </div>
        </div>

        <div>
          <p class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">🌟 Güçlü Yönler</p>
          <ul class="space-y-1.5">${gucluList}</ul>
        </div>

        <div>
          <p class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">⚡ Gelişim Alanları</p>
          <ul class="space-y-1.5">${zayifList}</ul>
        </div>

        <div>
          <p class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5">📊 Skor Kırılımı (XAI)</p>
          <div class="space-y-1.5">${kirilimList}</div>
        </div>

        <div>
          <p class="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">⚠️ Risk & Çelişki Değerlendirmesi</p>
          <ul class="space-y-1.5">${riskList}</ul>
        </div>

        <div class="pt-2 flex items-center gap-2">
          <button type="button" class="btn-compare-detail flex-1 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer">
            Detay Raporu
          </button>
          <button type="button" class="btn-compare-invite py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer" title="Mülakat Daveti Gönder">
            📩 Davet
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${renderCompareColumn(a1, s1 >= s2, s2)}
    ${renderCompareColumn(a2, s2 >= s1, s1)}
  `;

  const detailBtns = container.querySelectorAll(".btn-compare-detail");
  if (detailBtns[0]) detailBtns[0].onclick = () => { compareModalKapat(); if (typeof detayModalAc === "function") detayModalAc(a1); };
  if (detailBtns[1]) detailBtns[1].onclick = () => { compareModalKapat(); if (typeof detayModalAc === "function") detayModalAc(a2); };

  const inviteBtns = container.querySelectorAll(".btn-compare-invite");
  if (inviteBtns[0]) inviteBtns[0].onclick = () => { if (typeof epostaSablonuHazirla === "function") epostaSablonuHazirla(a1, "davet"); };
  if (inviteBtns[1]) inviteBtns[1].onclick = () => { if (typeof epostaSablonuHazirla === "function") epostaSablonuHazirla(a2, "davet"); };

  modal.classList.remove("hidden");
}

window.secilenKiyaslamaAdaylari = secilenKiyaslamaAdaylari;
window.kiyaslamaDurumunuGuncelle = kiyaslamaDurumunuGuncelle;
window.adaylariKiyaslaModalAc = adaylariKiyaslaModalAc;
window.compareModalKapat = compareModalKapat;
