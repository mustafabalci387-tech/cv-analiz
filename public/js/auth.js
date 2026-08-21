// ====== CV Analiz Platformu - Kimlik Doğrulama ve Oturum Modülü (auth.js) ======

const $id = (id) => document.getElementById(id);

const loginModal = $id("login-modal");
const loginForm = $id("login-form");
const loginError = $id("login-error");
const loginBtn = $id("admin-login-btn");
const logoutBtn = $id("admin-logout-btn");
const loginCancelBtn = $id("login-cancel-btn");
const registerForm = $id("register-form");
const registerError = $id("register-error");
const registerCancelBtn = $id("register-cancel-btn");
const tabLoginBtn = $id("tab-login-btn");
const tabRegisterBtn = $id("tab-register-btn");
const sidebarLogoutBtn = $id("sidebar-logout-btn");

// Sekme geçişi: Giriş & Kayıt
function authSekmeDegistir(aktifSekme) {
  if (!loginForm || !registerForm || !tabLoginBtn || !tabRegisterBtn) return;
  if (aktifSekme === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    tabLoginBtn.className = "flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20";
    tabRegisterBtn.className = "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    tabRegisterBtn.className = "flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-600/20";
    tabLoginBtn.className = "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";
  }
  if (loginError) { loginError.textContent = ""; loginError.classList.add("hidden"); }
  if (registerError) { registerError.textContent = ""; registerError.classList.add("hidden"); }
}

tabLoginBtn?.addEventListener("click", () => authSekmeDegistir("login"));
tabRegisterBtn?.addEventListener("click", () => authSekmeDegistir("register"));

function oturumKontrol() {
  if (typeof formVeSonucAlaniniSifirla === "function") formVeSonucAlaniniSifirla();

  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");
  const token = adminToken || userToken;

  const authLanding = $id("auth-landing-screen");
  const mainWorkspace = $id("main-workspace");
  const panelSection = $id("panel-section");
  const dashboardSection = $id("dashboard-section");
  const userCardName = $id("sidebar-user-name");
  const userCardRole = $id("sidebar-user-role");
  const playwrightReportLink = $id("playwright-report-link");
  const adminUsersPanel = $id("admin-users-panel");

  authLanding?.classList.add("hidden");
  mainWorkspace?.classList.remove("hidden");

  if (token) {
    if (panelSection) panelSection.style.display = "";
    if (dashboardSection) dashboardSection.style.display = "";
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "";
    sidebarLogoutBtn?.classList.remove("hidden");

    if (adminToken) {
      if (userCardName) userCardName.textContent = "Yönetici (Admin)";
      if (userCardRole) { userCardRole.textContent = "Admin"; userCardRole.className = "inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300"; }
      playwrightReportLink?.classList.remove("hidden");
      if (adminUsersPanel) adminUsersPanel.style.display = "";
      adminSirketleriYukle();
    } else {
      const uName = localStorage.getItem("kullaniciAdi") || "Şirket Kullanıcısı";
      if (userCardName) userCardName.textContent = uName;
      if (userCardRole) { userCardRole.textContent = "Şirket"; userCardRole.className = "inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300"; }
      playwrightReportLink?.classList.add("hidden");
      if (adminUsersPanel) adminUsersPanel.style.display = "none";
    }
    return true;
  } else {
    if (panelSection) panelSection.style.display = "none";
    if (dashboardSection) dashboardSection.style.display = "none";
    if (adminUsersPanel) adminUsersPanel.style.display = "none";
    if (loginBtn) loginBtn.style.display = "";
    if (logoutBtn) logoutBtn.style.display = "none";
    sidebarLogoutBtn?.classList.add("hidden");
    playwrightReportLink?.classList.add("hidden");
    if (userCardName) userCardName.textContent = "Giriş Yapılmadı";
    if (userCardRole) { userCardRole.textContent = "Misafir"; userCardRole.className = "inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300"; }
    return false;
  }
}

// ====== Admin Şirketler & Kullanıcılar Paneli ======
async function adminSirketleriYukle() {
  const adminToken = localStorage.getItem("adminToken");
  const panel = $id("admin-users-panel");
  const list = $id("admin-users-list");
  const loading = $id("admin-users-loading");
  const empty = $id("admin-users-empty");
  const countBadge = $id("admin-users-count");

  if (!adminToken) {
    if (panel) panel.style.display = "none";
    return;
  }

  if (panel) panel.style.display = "";
  loading?.classList.remove("hidden");
  list?.classList.add("hidden");
  empty?.classList.add("hidden");

  try {
    const res = await fetch("/api/auth/users", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    loading?.classList.add("hidden");

    if (json.success && json.data?.length > 0) {
      if (countBadge) countBadge.textContent = `${json.data.length} Şirket`;
      if (list) {
        list.innerHTML = "";
        json.data.forEach((u) => {
          const card = document.createElement("div");
          card.className = "p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3";
          const tarihStr = u.kayitTarihi ? new Date(u.kayitTarihi).toLocaleDateString("tr-TR") : "-";

          card.innerHTML = `
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs flex-shrink-0">🏢</div>
                  <div>
                    <h4 class="text-sm font-bold text-white company-name"></h4>
                    <p class="text-[11px] text-slate-400 company-user"></p>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${u.toplamCv || 0} CV</span>
              </div>
              <p class="text-[11px] text-slate-500">Kayıt: ${tarihStr}</p>
            </div>
            <button type="button" class="btn-filter-company w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              Bu Şirketin CV'lerini Filtrele
            </button>
          `;

          card.querySelector(".company-name").textContent = (typeof htmlEntityDecode === "function" ? htmlEntityDecode(u.sirketAdi) : u.sirketAdi) || "Genel Şirket";
          card.querySelector(".company-user").textContent = "@" + (typeof htmlEntityDecode === "function" ? htmlEntityDecode(u.kullaniciAdi) : u.kullaniciAdi);

          card.querySelector(".btn-filter-company").addEventListener("click", () => {
            const searchInput = $id("panel-search-input");
            if (searchInput) searchInput.value = u.sirketAdi;
            if (typeof basvurulariYukle === "function") basvurulariYukle(1, u.sirketAdi);
            const pSec = $id("panel-section");
            pSec?.scrollIntoView({ behavior: "smooth", block: "start" });
            if (typeof showToast === "function") showToast(`${u.sirketAdi} şirketinin CV'leri filtrelendi.`, "info");
          });

          list.appendChild(card);
        });
        list.classList.remove("hidden");
      }
    } else {
      if (countBadge) countBadge.textContent = "0 Şirket";
      empty?.classList.remove("hidden");
    }
  } catch (err) {
    loading?.classList.add("hidden");
    if (empty) {
      empty.textContent = "Şirketler listesi alınamadı.";
      empty.classList.remove("hidden");
    }
  }
}

$id("admin-users-refresh-btn")?.addEventListener("click", adminSirketleriYukle);

loginBtn?.addEventListener("click", () => {
  authSekmeDegistir("login");
  if (loginModal) loginModal.style.display = "flex";
});

loginCancelBtn?.addEventListener("click", () => {
  if (loginModal) loginModal.style.display = "none";
});

registerCancelBtn?.addEventListener("click", () => {
  if (loginModal) loginModal.style.display = "none";
});

// Giriş Formu
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = $id("login-username").value.trim();
  const password = $id("login-password").value.trim();

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();

    if (result.success) {
      if (result.user?.rol === "admin" || username === "admin") {
        localStorage.setItem("adminToken", result.token || "admin-token-123");
      } else {
        localStorage.setItem("userToken", result.token);
        localStorage.setItem("kullaniciAdi", result.user?.kullaniciAdi || username);
      }

      if (loginModal) loginModal.style.display = "none";
      loginForm.reset();
      if (typeof formVeSonucAlaniniSifirla === "function") formVeSonucAlaniniSifirla();
      oturumKontrol();
      if (typeof basvurulariYukle === "function") basvurulariYukle(1, "");
      if (typeof dashboardGuncelle === "function") dashboardGuncelle();
      if (typeof showToast === "function") showToast("Giriş başarılı!", "success");

      setTimeout(() => {
        $id("dashboard-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      if (loginError) {
        loginError.textContent = result.mesaj || "Giriş başarısız.";
        loginError.classList.remove("hidden");
      }
      if (typeof showToast === "function") showToast(result.mesaj || "Giriş başarısız.", "error");
    }
  } catch (err) {
    if (loginError) {
      loginError.textContent = "Sunucuya bağlanılamadı.";
      loginError.classList.remove("hidden");
    }
    if (typeof showToast === "function") showToast("Sunucuya bağlanılamadı.", "error");
  }
});

// Kayıt Formu
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const sirketAdi = ($id("register-company")?.value || "").trim() || "Genel Şirket";
  const kullaniciAdi = $id("register-username").value.trim();
  const sifre = $id("register-password").value.trim();

  if (!kullaniciAdi || !sifre) {
    if (registerError) { registerError.textContent = "Kullanıcı adı ve şifre zorunludur."; registerError.classList.remove("hidden"); }
    return;
  }

  const regBtn = $id("register-submit-btn");
  if (regBtn) { regBtn.disabled = true; regBtn.textContent = "Kayıt Oluşturuluyor..."; }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kullaniciAdi, sifre, sirketAdi }),
    });
    const result = await res.json();
    if (regBtn) { regBtn.disabled = false; regBtn.textContent = "Kayıt Ol ve Giriş Yap"; }

    if (result.success) {
      localStorage.setItem("userToken", result.token);
      localStorage.setItem("kullaniciAdi", result.user?.kullaniciAdi || kullaniciAdi);

      if (loginModal) loginModal.style.display = "none";
      registerForm.reset();
      if (typeof formVeSonucAlaniniSifirla === "function") formVeSonucAlaniniSifirla();
      oturumKontrol();
      if (typeof basvurulariYukle === "function") basvurulariYukle(1, "");
      if (typeof dashboardGuncelle === "function") dashboardGuncelle();
      if (typeof showToast === "function") showToast(`Şirket kaydı başarılı! Hoş geldiniz, ${result.user?.kullaniciAdi || kullaniciAdi}.`, "success");

      setTimeout(() => {
        $id("dashboard-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      if (registerError) {
        registerError.textContent = result.mesaj || "Kayıt başarısız.";
        registerError.classList.remove("hidden");
      }
      if (typeof showToast === "function") showToast(result.mesaj || "Kayıt başarısız.", "error");
    }
  } catch (err) {
    if (regBtn) { regBtn.disabled = false; regBtn.textContent = "Kayıt Ol ve Giriş Yap"; }
    if (registerError) {
      registerError.textContent = "Sunucuya bağlanılamadı.";
      registerError.classList.remove("hidden");
    }
    if (typeof showToast === "function") showToast("Sunucuya bağlanılamadı.", "error");
  }
});

function cikisYap() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("userToken");
  localStorage.removeItem("kullaniciAdi");
  if (typeof formVeSonucAlaniniSifirla === "function") formVeSonucAlaniniSifirla();
  if (typeof sidebarKapat === "function") sidebarKapat();
  oturumKontrol();
  if (typeof showToast === "function") showToast("Oturum kapatıldı.", "info");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

logoutBtn?.addEventListener("click", cikisYap);
sidebarLogoutBtn?.addEventListener("click", cikisYap);

// Canlı Sağlık Kontrolü
function saglikKontroluYap() {
  const dot = $id("health-dot");
  const text = $id("health-text");
  if (!dot || !text) return;

  fetch("/api/health")
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "OK" && data.db === "Connected") {
        dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
        text.textContent = `Sunucu: Aktif | DB: Bağlı | ${data.uptime}`;
      } else {
        dot.className = "w-2 h-2 rounded-full bg-amber-400 animate-pulse";
        text.textContent = `Sunucu: Aktif | DB: ${data.db || "Bilinmiyor"}`;
      }
    })
    .catch(() => {
      dot.className = "w-2 h-2 rounded-full bg-red-500 animate-pulse";
      text.textContent = "Sunucu: Erişilemiyor";
    });
}

window.oturumKontrol = oturumKontrol;
window.cikisYap = cikisYap;
window.authSekmeDegistir = authSekmeDegistir;
window.adminSirketleriYukle = adminSirketleriYukle;
window.saglikKontroluYap = saglikKontroluYap;
