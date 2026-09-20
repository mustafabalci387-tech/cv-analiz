// ====== CV Analiz Platformu - Kimlik Doğrulama ve Oturum Modülü (auth.js) ======

const $id = (id) => document.getElementById(id);

const loginModal = $id("login-modal");
const loginBtn = $id("admin-login-btn");
const logoutBtn = $id("admin-logout-btn");
const sidebarLogoutBtn = $id("sidebar-logout-btn");

function safeText(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

function authSekmeDegistir(aktifSekme) {
  const loginForm = $id("login-form");
  const registerForm = $id("register-form");
  const tabLoginBtn = $id("tab-login-btn");
  const tabRegisterBtn = $id("tab-register-btn");

  if (!loginForm || !registerForm || !tabLoginBtn || !tabRegisterBtn) return;

  const isLogin = aktifSekme === "login";
  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);

  tabLoginBtn.className = isLogin
    ? "flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
    : "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";

  tabRegisterBtn.className = isLogin
    ? "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white"
    : "flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-600/20";

  [$id("login-error"), $id("register-error")].forEach((el) => {
    if (el) { el.textContent = ""; el.classList.add("hidden"); }
  });
}

function landingSekmeDegistir(aktif) {
  const landingLoginForm = $id("landing-login-form");
  const landingRegisterForm = $id("landing-register-form");
  const landingTabLogin = $id("landing-tab-login");
  const landingTabRegister = $id("landing-tab-register");

  if (!landingLoginForm || !landingRegisterForm) return;

  const isLogin = aktif === "login";
  landingLoginForm.classList.toggle("hidden", !isLogin);
  landingRegisterForm.classList.toggle("hidden", isLogin);

  if (landingTabLogin) {
    landingTabLogin.className = isLogin
      ? "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
      : "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white";
  }

  if (landingTabRegister) {
    landingTabRegister.className = isLogin
      ? "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all text-slate-400 hover:text-white"
      : "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-600/20";
  }

  [$id("landing-login-error"), $id("landing-reg-error")].forEach((el) => {
    if (el) { el.textContent = ""; el.classList.add("hidden"); }
  });
}

$id("tab-login-btn")?.addEventListener("click", () => authSekmeDegistir("login"));
$id("tab-register-btn")?.addEventListener("click", () => authSekmeDegistir("register"));
$id("landing-tab-login")?.addEventListener("click", () => landingSekmeDegistir("login"));
$id("landing-tab-register")?.addEventListener("click", () => landingSekmeDegistir("register"));

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

  if (token) {
    if (authLanding) authLanding.classList.add("hidden");
    if (mainWorkspace) mainWorkspace.classList.remove("hidden");

    if (panelSection) panelSection.style.display = "";
    if (dashboardSection) dashboardSection.style.display = "";
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "";
    sidebarLogoutBtn?.classList.remove("hidden");

    if (adminToken) {
      if (userCardName) userCardName.textContent = "Yönetici (Admin)";
      if (userCardRole) {
        userCardRole.textContent = "Admin";
        userCardRole.className = "inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300";
      }
      playwrightReportLink?.classList.remove("hidden");
      if (adminUsersPanel) adminUsersPanel.style.display = "";
      adminSirketleriYukle();
    } else {
      const uName = localStorage.getItem("kullaniciAdi") || "Şirket Kullanıcısı";
      if (userCardName) userCardName.textContent = uName;
      if (userCardRole) {
        userCardRole.textContent = "Şirket";
        userCardRole.className = "inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300";
      }
      playwrightReportLink?.classList.add("hidden");
      if (adminUsersPanel) adminUsersPanel.style.display = "none";
    }
    return true;
  } else {
    if (authLanding) authLanding.classList.remove("hidden");
    if (mainWorkspace) mainWorkspace.classList.add("hidden");

    if (panelSection) panelSection.style.display = "none";
    if (dashboardSection) dashboardSection.style.display = "none";
    if (adminUsersPanel) adminUsersPanel.style.display = "none";
    if (loginBtn) loginBtn.style.display = "";
    if (logoutBtn) logoutBtn.style.display = "none";
    sidebarLogoutBtn?.classList.add("hidden");
    playwrightReportLink?.classList.add("hidden");

    if (userCardName) userCardName.textContent = "Giriş Yapılmadı";
    if (userCardRole) {
      userCardRole.textContent = "Misafir";
      userCardRole.className = "inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300";
    }
    return false;
  }
}

async function ortakGirisYap(username, password, errEl, submitBtn) {
  if (!username || !password) {
    if (errEl) { errEl.textContent = "Kullanıcı adı ve şifre zorunludur."; errEl.classList.remove("hidden"); }
    return;
  }

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Giriş yapılıyor..."; }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Giriş Yap"; }

    if (result.success) {
      if (result.user?.rol === "admin" || username === "admin") {
        localStorage.setItem("adminToken", result.token || "admin-token-123");
      } else {
        localStorage.setItem("userToken", result.token);
        localStorage.setItem("kullaniciAdi", result.user?.kullaniciAdi || username);
      }

      if (loginModal) loginModal.style.display = "none";
      $id("login-form")?.reset();
      $id("landing-login-form")?.reset();

      oturumKontrol();
      if (typeof basvurulariYukle === "function") basvurulariYukle(1, "");
      if (typeof dashboardGuncelle === "function") dashboardGuncelle();
      if (typeof showToast === "function") showToast("Giriş başarılı!", "success");

      setTimeout(() => {
        $id("dashboard-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      if (errEl) { errEl.textContent = result.mesaj || "Giriş başarısız."; errEl.classList.remove("hidden"); }
      if (typeof showToast === "function") showToast(result.mesaj || "Giriş başarısız.", "error");
    }
  } catch {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Giriş Yap"; }
    if (errEl) { errEl.textContent = "Sunucuya bağlanılamadı."; errEl.classList.remove("hidden"); }
    if (typeof showToast === "function") showToast("Sunucuya bağlanılamadı.", "error");
  }
}

async function ortakKayitOl(kullaniciAdi, sifre, sirketAdi, errEl, submitBtn) {
  if (!kullaniciAdi || !sifre) {
    if (errEl) { errEl.textContent = "Kullanıcı adı ve şifre zorunludur."; errEl.classList.remove("hidden"); }
    return;
  }

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Kayıt Oluşturuluyor..."; }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kullaniciAdi, sifre, sirketAdi }),
    });
    const result = await res.json();
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Kayıt Ol ve Giriş Yap"; }

    if (result.success) {
      localStorage.setItem("userToken", result.token);
      localStorage.setItem("kullaniciAdi", result.user?.kullaniciAdi || kullaniciAdi);

      if (loginModal) loginModal.style.display = "none";
      $id("register-form")?.reset();
      $id("landing-register-form")?.reset();

      oturumKontrol();
      if (typeof basvurulariYukle === "function") basvurulariYukle(1, "");
      if (typeof dashboardGuncelle === "function") dashboardGuncelle();
      if (typeof showToast === "function") showToast(`Şirket kaydı başarılı! Hoş geldiniz, ${result.user?.kullaniciAdi || kullaniciAdi}.`, "success");

      setTimeout(() => {
        $id("dashboard-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      if (errEl) { errEl.textContent = result.mesaj || "Kayıt başarısız."; errEl.classList.remove("hidden"); }
      if (typeof showToast === "function") showToast(result.mesaj || "Kayıt başarısız.", "error");
    }
  } catch {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Kayıt Ol ve Giriş Yap"; }
    if (errEl) { errEl.textContent = "Sunucuya bağlanılamadı."; errEl.classList.remove("hidden"); }
    if (typeof showToast === "function") showToast("Sunucuya bağlanılamadı.", "error");
  }
}

// Form Gönderim Dinleyicileri
$id("login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  ortakGirisYap($id("login-username").value.trim(), $id("login-password").value.trim(), $id("login-error"), null);
});

$id("landing-login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  ortakGirisYap($id("landing-login-user").value.trim(), $id("landing-login-pass").value.trim(), $id("landing-login-error"), $id("landing-login-submit"));
});

$id("register-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  ortakKayitOl($id("register-username").value.trim(), $id("register-password").value.trim(), ($id("register-company")?.value || "").trim() || "Genel Şirket", $id("register-error"), $id("register-submit-btn"));
});

$id("landing-register-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  ortakKayitOl($id("landing-reg-user").value.trim(), $id("landing-reg-pass").value.trim(), ($id("landing-reg-company")?.value || "").trim() || "Genel Şirket", $id("landing-reg-error"), $id("landing-reg-submit"));
});

// Modal Aç / Kapat Butonları
loginBtn?.addEventListener("click", () => {
  authSekmeDegistir("login");
  if (loginModal) loginModal.style.display = "flex";
});

$id("login-cancel-btn")?.addEventListener("click", () => {
  if (loginModal) loginModal.style.display = "none";
});

$id("register-cancel-btn")?.addEventListener("click", () => {
  if (loginModal) loginModal.style.display = "none";
});

// Oturumu Kapat
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

// Admin Şirketler Listesini Yükle
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
                    <h4 class="text-sm font-bold text-white company-name">${safeText(u.sirketAdi || "Genel Şirket")}</h4>
                    <p class="text-[11px] text-slate-400 company-user">@${safeText(u.kullaniciAdi || "")}</p>
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

          card.querySelector(".btn-filter-company").addEventListener("click", () => {
            const searchInput = $id("panel-search-input");
            if (searchInput) searchInput.value = u.sirketAdi;
            if (typeof basvurulariYukle === "function") basvurulariYukle(1, u.sirketAdi);
            $id("panel-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  } catch {
    loading?.classList.add("hidden");
    if (empty) {
      empty.textContent = "Şirketler listesi alınamadı.";
      empty.classList.remove("hidden");
    }
  }
}

$id("admin-users-refresh-btn")?.addEventListener("click", adminSirketleriYukle);

// Canlı Sağlık Kontrolü (Polling)
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

// Global Kapsama Aktarım
window.oturumKontrol = oturumKontrol;
window.cikisYap = cikisYap;
window.authSekmeDegistir = authSekmeDegistir;
window.adminSirketleriYukle = adminSirketleriYukle;
window.saglikKontroluYap = saglikKontroluYap;