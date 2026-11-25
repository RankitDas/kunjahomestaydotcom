/**
 * Kunja Homestay — Owner Desk Administration Controller
 * Supports Multi-Admin (Max 3), Free 6-Digit Email OTP, Strong Passwords,
 * Hero Showcase Multi-Image Uploader, Running Marquee Notice Media, and Room Slideshow Photo Management.
 */

let state = {
  authenticated: false,
  setupRequired: false,
  currentAdmin: null,
  csrfToken: null,
  adminCount: 0,
  maxAdmins: 3,
  canRegister: true,
  data: null
};

document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
});

// Toast notification helper
function showToast(message, isError = false) {
  const toast = document.getElementById("adminToast");
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? "#DC2626" : "var(--color-forest)";
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

// Password Visibility Toggle
window.togglePasswordVisibility = function(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
};

// Strong Password Live Validator (Generic strong policy: 8+ chars, uppercase, lowercase, number, symbol)
window.checkPasswordStrength = function(inputId, barContainerId, rulesListId) {
  const input = document.getElementById(inputId);
  const val = input ? input.value : "";
  const bars = document.querySelectorAll(`#${barContainerId} .pw-bar`);
  const prefix = rulesListId.startsWith("modal") ? "mrule" : (rulesListId.startsWith("reset") ? "rrule" : "rule");

  const hasLen = val.length >= 8;
  const hasUpper = /[A-Z]/.test(val);
  const hasLower = /[a-z]/.test(val);
  const hasNum = /[0-9]/.test(val);
  const hasSpec = /[^A-Za-z0-9]/.test(val);

  const updateRule = (id, valid, text) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = valid ? "pw-rule-item valid" : "pw-rule-item";
    el.textContent = (valid ? "✓ " : "○ ") + text;
  };

  updateRule(`${prefix}-len`, hasLen, "At least 8 characters");
  updateRule(`${prefix}-upper`, hasUpper, "At least 1 uppercase letter (A-Z)");
  updateRule(`${prefix}-lower`, hasLower, "At least 1 lowercase letter (a-z)");
  updateRule(`${prefix}-num`, hasNum, "At least 1 number (0-9)");
  updateRule(`${prefix}-spec`, hasSpec, "At least 1 special character (@ # $ % & * !)");

  const score = [hasLen, hasUpper, hasLower, hasNum, hasSpec].filter(Boolean).length;
  const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

  bars.forEach((bar, idx) => {
    if (idx < score - 1) {
      bar.style.background = colors[Math.min(score - 2, 3)] || "#10B981";
    } else {
      bar.style.background = "#E2E8F0";
    }
  });

  return hasLen && hasUpper && hasLower && hasNum && hasSpec;
};

// Check session status on page load
async function checkAuthStatus() {
  try {
    const res = await fetch("api/auth.php?action=status");
    const json = await res.json();
    state.authenticated = !!json.authenticated;
    state.setupRequired = !!json.setup_required;
    state.csrfToken = json.csrf_token || null;
    state.currentAdmin = json.current_admin || null;
    state.adminCount = json.admin_count || 0;
    state.maxAdmins = json.max_admins || 3;
    state.canRegister = !!json.can_register;

    renderAuthViews();

    if (state.authenticated) {
      await loadHomestayData();
      renderAdminsList();
      loadChangeLog();
      loadVisitorAnalytics();
      startPresenceHeartbeat();
    }
  } catch (err) {
    console.error("Auth check failed:", err);
    renderAuthViews();
  }
}

// Switch between Login, Registration, and Forgot Password screens
window.switchAuthMode = function(mode) {
  const loginForm = document.getElementById("loginForm");
  const regForm = document.getElementById("registerForm");
  const forgotForm = document.getElementById("forgotForm");
  const title = document.getElementById("authFormTitle");
  const subtitle = document.getElementById("authFormSubtitle");
  const err = document.getElementById("loginError");
  if (err) err.style.display = "none";

  if (loginForm) loginForm.style.display = (mode === "login") ? "block" : "none";
  if (regForm) regForm.style.display = (mode === "register") ? "block" : "none";
  if (forgotForm) forgotForm.style.display = (mode === "forgot") ? "block" : "none";

  if (mode === "register") {
    if (title) title.textContent = "Register Administrator";
    if (subtitle) subtitle.textContent = `Kunja Homestay (${state.adminCount} / 3 Registered)`;
  } else if (mode === "forgot") {
    if (title) title.textContent = "Forgot Password";
    if (subtitle) subtitle.textContent = "Verify your email to reset password";
  } else {
    if (title) title.textContent = "Admin Sign In";
    if (subtitle) subtitle.textContent = "Kunja Homestay Management Portal";
  }
};

// Toggle between Login/Register View and Dashboard View
function renderAuthViews() {
  const loginView = document.getElementById("loginView");
  const dashView = document.getElementById("dashboardView");
  const userGroup = document.getElementById("headerUserGroup");
  const displayUser = document.getElementById("displayUsername");
  const regPrompt = document.getElementById("registerPromptSection");

  if (state.authenticated) {
    if (loginView) loginView.style.display = "none";
    if (dashView) dashView.style.display = "block";
    if (userGroup) userGroup.style.display = "flex";
    if (displayUser) displayUser.textContent = `👤 ${state.currentAdmin?.name || 'Administrator'}`;
  } else {
    if (loginView) loginView.style.display = "flex";
    if (dashView) dashView.style.display = "none";
    if (userGroup) userGroup.style.display = "none";

    if (state.setupRequired) {
      switchAuthMode("register");
    } else {
      switchAuthMode("login");
    }

    if (regPrompt) {
      regPrompt.style.display = state.canRegister ? "block" : "none";
    }
  }
}

// 1. Request OTP for Public Registration
window.requestOtpForRegistration = async function() {
  const email = document.getElementById("regEmail").value.trim();
  const name = document.getElementById("regName").value.trim() || "Administrator";
  const btn = document.getElementById("sendRegOtpBtn");
  const hint = document.getElementById("regOtpHint");
  const group = document.getElementById("regOtpGroup");
  const err = document.getElementById("loginError");

  err.style.display = "none";
  if (!email || !email.includes("@")) {
    err.textContent = "Please enter a valid email address first.";
    err.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const res = await fetch("api/auth.php?action=request_otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, purpose: "register" })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      err.textContent = json.error || "Failed to send verification code.";
      err.style.display = "block";
    } else {
      group.style.display = "block";
      hint.style.display = "block";
      hint.textContent = "✓ 6-digit code sent to " + email + (json.dev_hint ? ` (${json.dev_hint})` : "");
      btn.textContent = "Resend Code";
    }
  } catch (e) {
    err.textContent = "Network error while sending OTP.";
    err.style.display = "block";
  } finally {
    btn.disabled = false;
  }
};

// 2. Submit Public Registration
window.handleAdminRegistration = async function(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value;
  const otp = document.getElementById("regOtp").value.trim();
  const err = document.getElementById("loginError");
  const submitBtn = document.getElementById("regSubmitBtn");

  err.style.display = "none";

  if (!checkPasswordStrength("regPassword", "regPwBars", "regPwRules")) {
    err.textContent = "Please ensure your password meets all strong password requirements.";
    err.style.display = "block";
    return;
  }

  if (!otp || otp.length !== 6) {
    err.textContent = "Please enter the 6-digit verification code sent to your email.";
    err.style.display = "block";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Verifying & Creating...";

  try {
    const res = await fetch("api/auth.php?action=register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, otp })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      err.textContent = json.error || "Registration failed.";
      err.style.display = "block";
    } else {
      state.authenticated = true;
      state.currentAdmin = json.current_admin;
      state.csrfToken = json.csrf_token;
      renderAuthViews();
      await loadHomestayData();
      renderAdminsList();
      showToast("Administrator registered and verified successfully!");
    }
  } catch (e) {
    err.textContent = "Network error during registration.";
    err.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Verify & Complete Registration →";
  }
};

// 3. Regular Login (Email OR Phone + Password, NO OTP)
async function handleLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById("loginIdentifier").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginSubmitBtn");

  errorEl.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = "Signing In...";

  try {
    const res = await fetch("api/auth.php?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      errorEl.textContent = json.error || "Login failed. Please check your credentials.";
      errorEl.style.display = "block";
    } else {
      state.authenticated = true;
      state.currentAdmin = json.current_admin;
      state.csrfToken = json.csrf_token;
      renderAuthViews();
      await loadHomestayData();
      renderAdminsList();
      showToast("Welcome back to Kunja Desk!");
    }
  } catch (err) {
    errorEl.textContent = "Network error. Please try again.";
    errorEl.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Access Kunja Desk →";
  }
}

// 4. Request OTP for Password Reset
window.requestOtpForReset = async function() {
  const email = document.getElementById("resetEmail").value.trim();
  const btn = document.getElementById("sendResetOtpBtn");
  const hint = document.getElementById("resetOtpHint");
  const err = document.getElementById("loginError");

  err.style.display = "none";
  if (!email || !email.includes("@")) {
    err.textContent = "Please enter your registered email address.";
    err.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const res = await fetch("api/auth.php?action=request_otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose: "reset" })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      err.textContent = json.error || "Failed to send reset code.";
      err.style.display = "block";
    } else {
      hint.style.display = "block";
      hint.textContent = "✓ 6-digit code sent to " + email + (json.dev_hint ? ` (${json.dev_hint})` : "");
      btn.textContent = "Resend Code";
    }
  } catch (e) {
    err.textContent = "Network error.";
    err.style.display = "block";
  } finally {
    btn.disabled = false;
  }
};

// 5. Submit Password Reset
window.handleResetPassword = async function(e) {
  e.preventDefault();
  const email = document.getElementById("resetEmail").value.trim();
  const otp = document.getElementById("resetOtp").value.trim();
  const newPassword = document.getElementById("resetNewPassword").value;
  const err = document.getElementById("loginError");
  const submitBtn = document.getElementById("resetSubmitBtn");

  err.style.display = "none";

  if (!checkPasswordStrength("resetNewPassword", "resetPwBars", "resetPwRules")) {
    err.textContent = "Please ensure your new password satisfies all strong requirements.";
    err.style.display = "block";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Updating Password...";

  try {
    const res = await fetch("api/auth.php?action=reset_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, new_password: newPassword })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      err.textContent = json.error || "Reset failed.";
      err.style.display = "block";
    } else {
      switchAuthMode("login");
      const succ = document.getElementById("loginSuccessMsg");
      if (succ) {
        succ.textContent = "Password updated! You can now log in with your new password.";
        succ.style.display = "block";
      }
      showToast("Password reset successfully!");
    }
  } catch (e) {
    err.textContent = "Network error.";
    err.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Reset Password & Log In →";
  }
};

// Handle Logout
async function handleLogout() {
  try {
    await fetch("api/auth.php?action=logout", { method: "POST" });
  } catch (e) {}
  state.authenticated = false;
  state.currentAdmin = null;
  state.csrfToken = null;
  renderAuthViews();
  showToast("Logged out successfully.");
}

// Switch Dashboard Tab (with localStorage persistence)
window.switchTab = function(tabName) {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach(el => el.style.display = "none");

  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach(btn => btn.classList.remove("active"));

  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.style.display = "block";

  const clickedBtn = Array.from(buttons).find(b => b.getAttribute("onclick")?.includes(tabName));
  if (clickedBtn) clickedBtn.classList.add("active");

  try {
    localStorage.setItem("kunja_active_tab", tabName);
  } catch (e) {}
};

// Modal helpers
window.openModal = function(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("open");
};

window.closeModal = function(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("open");
};

// --- DATA FETCHING & SAVING ---
async function loadHomestayData() {
  try {
    const res = await fetch("kunjaData.json?t=" + Date.now());
    state.data = await res.json();
    populateNoticeBanner();
    renderHeroImagesAdmin();
    renderPropertiesManager();
    renderCertPreview();
    renderReviewsList();
    renderGalleryGrid();

    // Restore preferred tab if previously saved
    try {
      const savedTab = localStorage.getItem("kunja_active_tab");
      if (savedTab && document.getElementById(`tab-${savedTab}`)) {
        window.switchTab(savedTab);
      }
    } catch (e) {}
  } catch (err) {
    showToast("Failed to load website configuration data.", true);
  }
}

async function saveAllDataToServer(successMsg = "Changes saved successfully.") {
  try {
    const res = await fetch("api/save-content.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": state.csrfToken
      },
      body: JSON.stringify({
        csrf_token: state.csrfToken,
        data: state.data
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      showToast(json.error || "Save failed.", true);
      return false;
    } else {
      showToast(successMsg);
      return true;
    }
  } catch (err) {
    showToast("Network error saving changes.", true);
    return false;
  }
}

// --- NOTICE BANNER & MARQUEE MEDIA LOGIC ---
function populateNoticeBanner() {
  const nb = state.data.noticeBanner || {};
  document.getElementById("noticeEnabled").checked = !!nb.enabled;
  document.getElementById("noticeTitle").value = nb.title || "";
  document.getElementById("noticeMessage").value = nb.message || "";
  document.getElementById("noticeFromDate").value = nb.fromDateTime || "";
  document.getElementById("noticeToDate").value = nb.toDateTime || "";

  const mediaPreview = document.getElementById("noticeMediaPreview");
  const mediaWrap = document.getElementById("noticeMediaPreviewWrap");
  const mediaName = document.getElementById("noticeMediaName");
  if (nb.bannerMedia) {
    if (mediaPreview) mediaPreview.src = nb.bannerMedia;
    if (mediaWrap) mediaWrap.style.display = "flex";
    if (mediaName) mediaName.textContent = nb.bannerMedia;
  } else {
    if (mediaWrap) mediaWrap.style.display = "none";
  }

  updateNoticePreview();
}

window.updateNoticePreview = function() {
  const title = document.getElementById("noticeTitle").value.trim();
  const msg = document.getElementById("noticeMessage").value.trim();
  const fromD = document.getElementById("noticeFromDate").value;
  const toD = document.getElementById("noticeToDate").value;
  const mediaSrc = state.data?.noticeBanner?.bannerMedia || "";

  document.getElementById("prevTitle").textContent = title || "Notice Title";
  document.getElementById("prevMessage").textContent = msg || "Notice message will appear here...";

  const prevImg = document.getElementById("prevMediaThumb");
  if (prevImg) {
    if (mediaSrc) {
      prevImg.src = mediaSrc;
      prevImg.style.display = "block";
    } else {
      prevImg.style.display = "none";
    }
  }

  let dtStr = "";
  if (fromD && toD) dtStr = `Effective: ${fromD} to ${toD}`;
  else if (toD) dtStr = `Reopening expected: ${toD}`;
  else if (fromD) dtStr = `Effective from: ${fromD}`;
  document.getElementById("prevDates").textContent = dtStr;
};

window.handleNoticeMediaUpload = async function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);
  formData.append("target_folder", "notices");
  formData.append("csrf_token", state.csrfToken);

  showToast("Uploading notice graphic...");
  try {
    const res = await fetch("api/upload-image.php", {
      method: "POST",
      headers: { "X-CSRF-Token": state.csrfToken },
      body: formData
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      showToast(json.error || "Upload failed.", true);
    } else {
      if (!state.data.noticeBanner) state.data.noticeBanner = {};
      state.data.noticeBanner.bannerMedia = json.path || json.imagePath || "";
      populateNoticeBanner();
      showToast("Notice graphic uploaded! Click Save Notice Settings to persist.");
    }
  } catch (err) {
    showToast("Network error uploading graphic.", true);
  }
};

window.removeNoticeMedia = function() {
  if (!state.data.noticeBanner) return;
  state.data.noticeBanner.bannerMedia = "";
  populateNoticeBanner();
  showToast("Notice graphic removed. Click Save Notice Settings to persist.");
};

window.saveNoticeBanner = async function(e) {
  e.preventDefault();
  state.data.noticeBanner = {
    enabled: document.getElementById("noticeEnabled").checked,
    title: document.getElementById("noticeTitle").value.trim(),
    message: document.getElementById("noticeMessage").value.trim(),
    fromDateTime: document.getElementById("noticeFromDate").value,
    toDateTime: document.getElementById("noticeToDate").value,
    bannerMedia: state.data.noticeBanner?.bannerMedia || ""
  };
  await saveAllDataToServer("Notice settings saved!");
};

// --- HERO SHOWCASE MULTI-IMAGE MANAGER ---
function renderHeroImagesAdmin() {
  const container = document.getElementById("heroImagesAdminGrid");
  if (!container) return;

  if (!state.data.siteConfig) state.data.siteConfig = {};
  if (!state.data.siteConfig.heroImages) {
    state.data.siteConfig.heroImages = [
      { id: "hero-1", src: "images/kunja-34.jpeg", caption: "Kunja Homestay Courtyard • Evening ambiance under the quiet Bolpur sky" },
      { id: "hero-2", src: "images/kunja-56.jpeg", caption: "Garden Wing & Verandahs • Fresh air and green surroundings" },
      { id: "hero-3", src: "images/kunja-35.jpeg", caption: "Serene Morning Light • Peaceful garden pathways and seating" },
      { id: "hero-4", src: "images/kunja-58.jpeg", caption: "Santiniketan Hospitality • Authentic home-cooked meals and tranquil stays" }
    ];
  }

  const list = state.data.siteConfig.heroImages;
  if (list.length === 0) {
    container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--color-text-muted);">No hero images currently in the showcase. Upload some above!</div>`;
    return;
  }

  container.innerHTML = list.map((item, idx) => `
    <div class="item-row" style="flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 280px;">
        <img src="${resolveAdminImageUrl(item.src)}" alt="Hero Image" onerror="handleAdminImageError(this)" style="width: 100px; height: 75px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <div style="flex: 1;">
          <input type="text" class="form-input" style="font-size: 0.88rem; padding: 0.4rem 0.6rem;" value="${item.caption || ''}" placeholder="Enter caption for this hero slide..." onchange="updateHeroCaption(${idx}, this.value)">
          <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 4px;">File: ${item.src}</div>
        </div>
      </div>
      <div style="display: flex; gap: 0.4rem;">
        <button class="btn btn-outline" style="padding: 0.35rem 0.65rem;" onclick="moveHeroItem(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>↑ Up</button>
        <button class="btn btn-outline" style="padding: 0.35rem 0.65rem;" onclick="moveHeroItem(${idx}, 1)" ${idx === list.length - 1 ? 'disabled' : ''}>↓ Down</button>
        <button class="btn btn-danger" style="padding: 0.35rem 0.65rem;" onclick="deleteHeroItem(${idx})">🗑️ Delete</button>
      </div>
    </div>
  `).join("");
}

window.updateHeroCaption = function(idx, val) {
  if (state.data.siteConfig.heroImages[idx]) {
    state.data.siteConfig.heroImages[idx].caption = val.trim();
    saveAllDataToServer("Hero caption updated.");
  }
};

window.moveHeroItem = async function(idx, dir) {
  const list = state.data.siteConfig.heroImages;
  const target = idx + dir;
  if (target < 0 || target >= list.length) return;
  const temp = list[idx];
  list[idx] = list[target];
  list[target] = temp;
  const ok = await saveAllDataToServer("Hero order updated.");
  if (ok) renderHeroImagesAdmin();
};

window.deleteHeroItem = async function(idx) {
  if (!confirm("Are you sure you want to remove this photo from the hero showcase?")) return;
  state.data.siteConfig.heroImages.splice(idx, 1);
  const ok = await saveAllDataToServer("Hero photo removed.");
  if (ok) renderHeroImagesAdmin();
};

window.handleHeroMultiUpload = async function(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  showToast(`Uploading ${files.length} hero images...`);
  let uploadedCount = 0;

  for (const file of files) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("target_folder", "gallery");
    formData.append("csrf_token", state.csrfToken);

    try {
      const res = await fetch("api/upload-image.php", {
        method: "POST",
        headers: { "X-CSRF-Token": state.csrfToken },
        body: formData
      });
      const json = await res.json();
      if (res.ok && json.success) {
        state.data.siteConfig.heroImages.push({
          id: "hero-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          src: json.path,
          caption: "Kunja Homestay • " + file.name.replace(/\.[^/.]+$/, "")
        });
        uploadedCount++;
      }
    } catch (err) {}
  }

  if (uploadedCount > 0) {
    await saveAllDataToServer(`${uploadedCount} hero images uploaded and added!`);
    renderHeroImagesAdmin();
  } else {
    showToast("Failed to upload images.", true);
  }
  e.target.value = "";
};

// --- PROPERTIES & ROOM PHOTO MANAGEMENT ---
function renderPropertiesManager() {
  const container = document.getElementById("propertiesManagerList");
  if (!container) return;

  const props = state.data.properties || [];
  container.innerHTML = props.map((prop, pIdx) => `
    <div class="prop-admin-box">
      <div class="prop-admin-header">
        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--color-forest); margin-bottom: 0.25rem;">
            🏡 ${prop.name}
          </h3>
          <div style="font-size: 0.85rem; color: var(--color-terracotta); font-weight: 600;">
            📍 ${prop.locationNote || 'Bolpur, Santiniketan'}
          </div>
          <p style="font-size: 0.88rem; color: var(--color-text-muted); margin-top: 0.5rem; max-width: 700px;">
            ${prop.description}
          </p>
        </div>
        <button class="btn btn-outline" onclick="openPropertyModal(${pIdx})">✏️ Edit Property</button>
      </div>

      <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1.25rem; background: var(--color-canvas); padding: 1rem; border-radius: var(--radius-sm);">
        <img src="${resolveAdminImageUrl(prop.coverImage)}" alt="${prop.name} cover" onerror="handleAdminImageError(this)" style="width: 120px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <div>
          <strong>Property Exterior Showcase Photo</strong>
          <div style="font-size: 0.82rem; color: var(--color-text-muted); margin-top: 3px;">${prop.coverImage}</div>
        </div>
      </div>

      <h4 style="font-size: 1.05rem; color: var(--color-forest); margin-bottom: 0.75rem;">Suites & Room Photo Slideshows</h4>
      <div class="item-list">
        ${(prop.rooms || []).map((room, rIdx) => `
          <div class="item-row">
            <div class="item-row-header">
              <div>
                <strong>${room.name}</strong> • <span style="color: var(--color-terracotta);">${room.nightlyPrice}</span> (${room.seasonLabel})
                <div style="font-size: 0.82rem; color: var(--color-text-muted);">👥 ${room.occupancyTag}</div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <label class="btn btn-outline" style="cursor: pointer; padding: 0.35rem 0.65rem; font-size: 0.82rem; margin-bottom: 0;">
                  + Add Photos
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" style="display: none;" onchange="handleRoomPhotosUpload(event, ${pIdx}, ${rIdx})">
                </label>
                <button class="btn btn-outline" style="padding: 0.35rem 0.65rem; font-size: 0.82rem;" onclick="openRoomModal(${pIdx}, ${rIdx})">✏️ Edit Details</button>
              </div>
            </div>

            <!-- Individual Room Slideshow Thumbnails Manager -->
            <div style="margin-top: 0.5rem;">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted);">Slideshow Photos (Cycles automatically every 3.5s):</span>
              <div class="room-thumbs-strip">
                ${(room.images || []).map((img, iIdx) => `
                  <div class="room-thumb-item">
                    <img src="${resolveAdminImageUrl(img)}" alt="Room photo" onerror="handleAdminImageError(this)">
                    <button class="room-thumb-del" onclick="deleteRoomPhoto(${pIdx}, ${rIdx}, ${iIdx})" title="Delete photo">✕</button>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

window.deleteRoomPhoto = async function(pIdx, rIdx, iIdx) {
  const room = state.data.properties[pIdx]?.rooms[rIdx];
  if (!room || room.images.length <= 1) {
    showToast("Each room must keep at least 1 photo for its slideshow.", true);
    return;
  }
  if (!confirm("Remove this photo from the room slideshow?")) return;
  room.images.splice(iIdx, 1);
  const ok = await saveAllDataToServer("Room photo removed.");
  if (ok) renderPropertiesManager();
};

window.handleRoomPhotosUpload = async function(e, pIdx, rIdx) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const prop = state.data.properties[pIdx];
  const room = prop?.rooms[rIdx];
  if (!room) return;

  // Determine exact subfolder matching room
  // e.g. building-1 (kunja_bati_homestay): Room A, Room C, Room B, Room D, Room E
  // building-2 (kunja_homestay): Room A1, Room 5, Room 2, Room A3, Room 1
  let targetFolder = "gallery";
  const bldgFolder = (prop.id === "building-1" || (prop.name && prop.name.includes("BATI"))) 
                     ? "kunja_bati_homestay" 
                     : "kunja_homestay";

  // Map room index or name to designated folder
  const b1Rooms = ["Room A", "Room B", "Room C", "Room D", "Room E"];
  const b2Rooms = ["Room A1", "Room 5", "Room 2", "Room A3", "Room 1"];
  const subName = (bldgFolder === "kunja_bati_homestay") 
                  ? (b1Rooms[rIdx] || "Room A") 
                  : (b2Rooms[rIdx] || "Room A1");
  targetFolder = `${bldgFolder}/${subName}`;

  showToast(`Uploading ${files.length} room photos into ${targetFolder}...`);
  let uploaded = 0;

  for (const file of files) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("target_folder", targetFolder);
    formData.append("subfolder", targetFolder);
    formData.append("csrf_token", state.csrfToken);

    try {
      const res = await fetch("api/upload-image.php", {
        method: "POST",
        headers: { "X-CSRF-Token": state.csrfToken },
        body: formData
      });
      const json = await res.json();
      if (res.ok && json.success) {
        room.images.push(json.path);
        uploaded++;
      }
    } catch (err) {}
  }

  if (uploaded > 0) {
    await saveAllDataToServer(`${uploaded} photos added to room slideshow!`);
    renderPropertiesManager();
  }
  e.target.value = "";
};

window.openPropertyModal = function(pIdx) {
  const prop = state.data.properties[pIdx];
  document.getElementById("editPropIndex").value = pIdx;
  document.getElementById("editPropName").value = prop.name || "";
  document.getElementById("editPropLocation").value = prop.locationNote || "";
  document.getElementById("editPropDesc").value = prop.description || "";
  document.getElementById("editPropExistingCover").value = prop.coverImage || "";
  openModal("propertyModal");
};

window.savePropertyEdit = async function(e) {
  e.preventDefault();
  const pIdx = parseInt(document.getElementById("editPropIndex").value, 10);
  const prop = state.data.properties[pIdx];
  if (!prop) return;

  prop.name = document.getElementById("editPropName").value.trim();
  prop.locationNote = document.getElementById("editPropLocation").value.trim();
  prop.description = document.getElementById("editPropDesc").value.trim();

  const fileInput = document.getElementById("editPropCoverFile");
  if (fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("target_folder", "gallery");
    formData.append("csrf_token", state.csrfToken);
    try {
      const res = await fetch("api/upload-image.php", {
        method: "POST",
        headers: { "X-CSRF-Token": state.csrfToken },
        body: formData
      });
      const json = await res.json();
      if (res.ok && json.success) prop.coverImage = json.path;
    } catch (err) {}
  }

  closeModal("propertyModal");
  const ok = await saveAllDataToServer("Property details updated.");
  if (ok) renderPropertiesManager();
};

window.openRoomModal = function(pIdx, rIdx) {
  const room = state.data.properties[pIdx]?.rooms[rIdx];
  document.getElementById("editRoomPropIdx").value = pIdx;
  document.getElementById("editRoomIdx").value = rIdx;
  document.getElementById("editRoomName").value = room.name || "";
  document.getElementById("editRoomPrice").value = room.nightlyPrice || "";
  document.getElementById("editRoomSeason").value = room.seasonLabel || "";
  document.getElementById("editRoomOccupancy").value = room.occupancyTag || "Perfect for 2 people";
  document.getElementById("editRoomDesc").value = room.description || "";
  document.getElementById("editRoomHighlights").value = (room.highlights || []).join(", ");
  openModal("roomModal");
};

window.saveRoomEdit = async function(e) {
  e.preventDefault();
  const pIdx = parseInt(document.getElementById("editRoomPropIdx").value, 10);
  const rIdx = parseInt(document.getElementById("editRoomIdx").value, 10);
  const room = state.data.properties[pIdx]?.rooms[rIdx];
  if (!room) return;

  room.name = document.getElementById("editRoomName").value.trim();
  room.nightlyPrice = document.getElementById("editRoomPrice").value.trim();
  room.seasonLabel = document.getElementById("editRoomSeason").value.trim();
  room.occupancyTag = document.getElementById("editRoomOccupancy").value;
  room.description = document.getElementById("editRoomDesc").value.trim();
  room.highlights = document.getElementById("editRoomHighlights").value.split(",").map(s => s.trim()).filter(Boolean);

  closeModal("roomModal");
  const ok = await saveAllDataToServer("Room details updated.");
  if (ok) renderPropertiesManager();
};

// --- MULTI-ADMIN SECURITY MANAGER ---
async function renderAdminsList() {
  const container = document.getElementById("adminsListTable");
  const countDisplay = document.getElementById("adminCountDisplay");
  const addBtn = document.getElementById("addNewAdminTabBtn");
  if (!container) return;

  try {
    const res = await fetch("api/auth.php?action=list_admins");
    const json = await res.json();
    if (!res.ok || !json.success) return;

    const admins = json.admins || [];
    state.adminCount = admins.length;
    if (countDisplay) countDisplay.textContent = admins.length;
    if (addBtn) addBtn.style.display = admins.length >= 3 ? "none" : "inline-flex";

    container.innerHTML = admins.map(admin => `
      <div class="item-row" style="flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; font-weight: 700; color: var(--color-forest); font-size: 1rem;">
            <span class="online-indicator-dot ${admin.online ? 'online' : 'offline'}" title="${admin.online ? 'Online now' : 'Offline'}"></span>
            <span>👤 ${admin.name}</span>
            ${admin.is_self ? '<span class="user-pill" style="font-size:0.75rem; margin-left:4px;">You (Current)</span>' : ''}
          </div>
          <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px;">
            📧 <strong>Email:</strong> <code>${admin.masked_email || admin.email}</code> &nbsp;|&nbsp; 📱 <strong>Phone:</strong> <code>${admin.masked_phone || admin.phone}</code>
          </div>
        </div>
        <div>
          ${admins.length > 1 && !admin.is_self ? `
            <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.82rem;" onclick="removeAdminAccount('${admin.id}', '${admin.name}')">Remove Admin</button>
          ` : (admin.is_self ? `
            <span style="font-size: 0.8rem; color: #059669; font-weight:600;">Active Session</span>
          ` : `
            <span style="font-size: 0.8rem; color: var(--color-text-muted); font-style: italic;">Primary Admin</span>
          `)}
        </div>
      </div>
    `).join("");
  } catch (err) {}
}

window.openAddAdminModal = function() {
  document.getElementById("modalAddAdminForm").reset();
  const err = document.getElementById("modalAdminError");
  if (err) err.style.display = "none";
  openModal("addAdminModal");
};

window.requestOtpForModalAdmin = async function() {
  const email = document.getElementById("modalAdminEmail").value.trim();
  const name = document.getElementById("modalAdminName").value.trim() || "Administrator";
  const btn = document.getElementById("modalSendOtpBtn");
  const hint = document.getElementById("modalAdminOtpHint");
  const group = document.getElementById("modalAdminOtpGroup");
  const err = document.getElementById("modalAdminError");

  err.style.display = "none";
  if (!email || !email.includes("@")) {
    err.textContent = "Please enter a valid email address.";
    err.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    const res = await fetch("api/auth.php?action=request_otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, purpose: "register" })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      err.textContent = json.error || "Failed to send OTP.";
      err.style.display = "block";
    } else {
      group.style.display = "block";
      hint.style.display = "block";
      hint.textContent = "✓ 6-digit code sent to " + email + (json.dev_hint ? ` (${json.dev_hint})` : "");
      btn.textContent = "Resend Code";
    }
  } catch (e) {
    err.textContent = "Network error sending code.";
    err.style.display = "block";
  } finally {
    btn.disabled = false;
  }
};

window.handleModalAdminRegister = async function(e) {
  e.preventDefault();
  const name = document.getElementById("modalAdminName").value.trim();
  const email = document.getElementById("modalAdminEmail").value.trim();
  const phone = document.getElementById("modalAdminPhone").value.trim();
  const password = document.getElementById("modalAdminPassword").value;
  const otp = document.getElementById("modalAdminOtp").value.trim();
  const err = document.getElementById("modalAdminError");

  err.style.display = "none";

  if (!checkPasswordStrength("modalAdminPassword", "modalPwBars", "modalPwRules")) {
    err.textContent = "Password must fulfill all strong security rules.";
    err.style.display = "block";
    return;
  }

  if (!otp || otp.length !== 6) {
    err.textContent = "Please enter the 6-digit OTP code sent to the email.";
    err.style.display = "block";
    return;
  }

  try {
    const res = await fetch("api/auth.php?action=register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, otp })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      err.textContent = json.error || "Failed to register administrator.";
      err.style.display = "block";
    } else {
      closeModal("addAdminModal");
      showToast("New administrator registered and verified!");
      renderAdminsList();
    }
  } catch (e) {
    err.textContent = "Network error registering admin.";
    err.style.display = "block";
  }
};

window.removeAdminAccount = async function(adminId, name) {
  if (!confirm(`Are you sure you want to remove administrator "${name}"?`)) return;

  try {
    const res = await fetch("api/auth.php?action=remove_admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": state.csrfToken
      },
      body: JSON.stringify({ admin_id: adminId, csrf_token: state.csrfToken })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      showToast(json.error || "Failed to remove administrator.", true);
    } else {
      showToast("Administrator removed successfully.");
      checkAuthStatus();
    }
  } catch (err) {
    showToast("Network error removing administrator.", true);
  }
};

// --- CERTIFICATE, REVIEWS, & GALLERY HELPERS ---
function renderCertPreview() {
  const img = document.getElementById("certPreviewDisplay");
  const path = state.data?.siteConfig?.recognition?.certificateImage || "images/certificates/kunja-57.jpeg";
  if (img) img.src = path;
}

window.uploadGovtCertificate = async function() {
  const fileInput = document.getElementById("certUploadFile");
  if (!fileInput.files.length) {
    showToast("Please choose an image file first.", true);
    return;
  }

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);
  formData.append("target_folder", "certificates");
  formData.append("csrf_token", state.csrfToken);

  showToast("Uploading certificate image...");
  try {
    const res = await fetch("api/upload-image.php", {
      method: "POST",
      headers: { "X-CSRF-Token": state.csrfToken },
      body: formData
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      showToast(json.error || "Certificate upload failed.", true);
    } else {
      if (!state.data.siteConfig) state.data.siteConfig = {};
      if (!state.data.siteConfig.recognition) state.data.siteConfig.recognition = {};
      state.data.siteConfig.recognition.certificateImage = json.path;
      renderCertPreview();
      await saveAllDataToServer("Certificate updated and saved!");
    }
  } catch (err) {
    showToast("Network error uploading certificate.", true);
  }
};

// --- REVIEWS, MODERATION, REPLIES & SOCIAL LINKS ---
function renderReviewsList() {
  // Populate Google Review URL & Social Links
  const gInput = document.getElementById("adminGoogleReviewUrl");
  const fbInput = document.getElementById("adminFacebookUrl");
  const igInput = document.getElementById("adminInstagramUrl");
  if (gInput) gInput.value = state.data.contact?.googleReviewUrl || "";
  if (fbInput) fbInput.value = state.data.socialLinks?.facebook || "https://www.facebook.com/kunjajayanta";
  if (igInput) igInput.value = state.data.socialLinks?.instagram || "https://www.instagram.com/jayantakunja/";

  const allReviews = state.data.reviews || [];
  const pending = allReviews.filter(r => r.approved !== true);
  const published = allReviews
    .filter(r => r.approved === true)
    .sort((a, b) => (Number(b.rating) || 5) - (Number(a.rating) || 5));

  const pendingCountEl = document.getElementById("pendingReviewsCount");
  if (pendingCountEl) pendingCountEl.textContent = pending.length;

  const pendingContainer = document.getElementById("pendingReviewsList");
  if (pendingContainer) {
    if (pending.length === 0) {
      pendingContainer.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--color-text-muted); font-size: 0.88rem;">No pending guest reviews waiting for approval.</div>`;
    } else {
      pendingContainer.innerHTML = pending.map(rev => {
        const stars = "★".repeat(Number(rev.rating) || 5) + "☆".repeat(5 - (Number(rev.rating) || 5));
        return `
          <div class="item-row" style="background: #FFFBEB; border-color: #FDE68A;">
            <div class="item-row-header">
              <div>
                <strong>${rev.guestName}</strong> <span style="font-size:0.82rem; color:var(--color-text-muted);">(${rev.property || rev.hometown || 'Guest'})</span>
                <div style="color: #F59E0B; font-size: 0.95rem; margin-top: 2px;">${stars}</div>
              </div>
              <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                <button class="btn btn-forest" style="padding: 0.35rem 0.7rem; font-size: 0.82rem;" onclick="approveReview('${rev.id}')">✓ Approve & Show</button>
                <button class="btn btn-danger" style="padding: 0.35rem 0.7rem; font-size: 0.82rem;" onclick="deleteReviewById('${rev.id}')">✕ Reject / Delete</button>
              </div>
            </div>
            <p style="font-size: 0.88rem; color: var(--color-text-main); margin: 0.5rem 0 0;">${rev.reviewText}</p>
          </div>
        `;
      }).join("");
    }
  }

  const container = document.getElementById("reviewsList");
  if (!container) return;
  if (published.length === 0) {
    container.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--color-text-muted);">No published reviews yet.</div>`;
    return;
  }

  container.innerHTML = published.map(rev => {
    const stars = "★".repeat(Number(rev.rating) || 5) + "☆".repeat(5 - (Number(rev.rating) || 5));
    return `
      <div class="item-row">
        <div class="item-row-header">
          <div>
            <strong>${rev.guestName}</strong> <span style="font-size:0.82rem; color:var(--color-text-muted);">(${rev.property || rev.hometown || 'Guest'})</span>
            <div style="color: #F59E0B; font-size: 0.95rem; margin-top: 2px;">${stars}</div>
            ${rev.quote ? `<div style="font-weight: 600; color: var(--color-forest); margin-top: 3px;">"${rev.quote}"</div>` : ''}
          </div>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-outline" style="padding: 0.35rem 0.65rem; font-size: 0.82rem;" onclick="toggleReviewVisibility('${rev.id}')">👁️ Hide / Unpublish</button>
            <button class="btn btn-danger" style="padding: 0.35rem 0.65rem; font-size: 0.82rem;" onclick="deleteReviewById('${rev.id}')">🗑️ Delete</button>
          </div>
        </div>
        <p style="font-size: 0.88rem; color: var(--color-text-muted); margin: 0.5rem 0;">${rev.reviewText}</p>
        <div style="background: var(--color-canvas); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); margin-top: 0.5rem;">
          <label style="font-size: 0.78rem; font-weight: 700; color: var(--color-forest); display: block; margin-bottom: 0.35rem;">💬 Official Owner Reply:</label>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <input type="text" class="form-input" id="replyInput-${rev.id}" value="${(rev.adminReply || '').replace(/"/g, '&quot;')}" placeholder="Write a warm thank-you or response..." style="flex: 1; min-width: 200px; font-size: 0.85rem; padding: 0.4rem 0.65rem;">
            <button class="btn btn-forest" style="padding: 0.4rem 0.85rem; font-size: 0.82rem;" onclick="saveAdminReply('${rev.id}')">Save Reply</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.saveGoogleReviewUrl = async function(e) {
  e.preventDefault();
  if (!state.data.contact) state.data.contact = {};
  if (!state.data.socialLinks) state.data.socialLinks = {};
  state.data.contact.googleReviewUrl = document.getElementById("adminGoogleReviewUrl").value.trim();
  const fb = document.getElementById("adminFacebookUrl")?.value.trim();
  const ig = document.getElementById("adminInstagramUrl")?.value.trim();
  if (fb) state.data.socialLinks.facebook = fb;
  if (ig) state.data.socialLinks.instagram = ig;
  await saveAllDataToServer("Google Review & Social Links updated!");
};

window.approveReview = async function(id) {
  const rev = (state.data.reviews || []).find(r => r.id === id);
  if (!rev) return;
  rev.approved = true;
  const ok = await saveAllDataToServer("Review approved and published!");
  if (ok) renderReviewsList();
};

window.toggleReviewVisibility = async function(id) {
  const rev = (state.data.reviews || []).find(r => r.id === id);
  if (!rev) return;
  rev.approved = !rev.approved;
  const ok = await saveAllDataToServer(rev.approved ? "Review published!" : "Review hidden from public site.");
  if (ok) renderReviewsList();
};

window.saveAdminReply = async function(id) {
  const rev = (state.data.reviews || []).find(r => r.id === id);
  const input = document.getElementById(`replyInput-${id}`);
  if (!rev || !input) return;
  rev.adminReply = input.value.trim();
  const ok = await saveAllDataToServer("Owner reply saved!");
  if (ok) renderReviewsList();
};

window.deleteReviewById = async function(id) {
  if (!confirm("Are you sure you want to delete this guest review?")) return;
  state.data.reviews = (state.data.reviews || []).filter(r => r.id !== id);
  const ok = await saveAllDataToServer("Review removed.");
  if (ok) renderReviewsList();
};

// Multi-Select Gallery Manager
let selectedGalleryIndices = new Set();

function renderGalleryGrid() {
  const container = document.getElementById("galleryGrid");
  const countDisplay = document.getElementById("galleryCountDisplay");
  if (!container) return;
  const list = state.data.gallery || [];

  if (countDisplay) countDisplay.textContent = list.length;
  selectedGalleryIndices.clear();
  updateBulkDeleteButton();

  container.innerHTML = list.map((item, idx) => `
    <div style="background: var(--color-canvas); border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow: hidden; position: relative;">
      <label style="position: absolute; top: 8px; left: 8px; z-index: 5; background: rgba(255,255,255,0.9); border-radius: 4px; padding: 2px 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 0.78rem; font-weight: 600; box-shadow: var(--shadow-sm);">
        <input type="checkbox" class="gallery-select-cb" data-idx="${idx}" onchange="toggleGallerySelect(${idx}, this.checked)">
        <span>Select</span>
      </label>
      <img src="${resolveAdminImageUrl(item.image)}" alt="${item.title}" onerror="handleAdminImageError(this)" style="width: 100%; height: 140px; object-fit: cover;">
      <div style="padding: 0.75rem;">
        <div style="font-weight: 600; font-size: 0.9rem; color: var(--color-forest); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.title}">${item.title}</div>
        <div style="font-size: 0.8rem; color: var(--color-text-muted); margin: 3px 0 6px;">Category: ${item.category}</div>
        <button class="btn btn-danger" style="width: 100%; padding: 0.3rem 0.5rem; font-size: 0.8rem; justify-content: center;" onclick="deleteGalleryItem(${idx})">Delete Photo</button>
      </div>
    </div>
  `).join("");
}

window.toggleGallerySelect = function(idx, isChecked) {
  if (isChecked) {
    selectedGalleryIndices.add(idx);
  } else {
    selectedGalleryIndices.delete(idx);
  }
  updateBulkDeleteButton();
};

window.toggleSelectAllGallery = function() {
  const cbs = document.querySelectorAll(".gallery-select-cb");
  const list = state.data.gallery || [];
  if (selectedGalleryIndices.size === list.length) {
    selectedGalleryIndices.clear();
    cbs.forEach(cb => cb.checked = false);
  } else {
    list.forEach((_, idx) => selectedGalleryIndices.add(idx));
    cbs.forEach(cb => cb.checked = true);
  }
  updateBulkDeleteButton();
};

function updateBulkDeleteButton() {
  const btn = document.getElementById("bulkDeleteBtn");
  const countEl = document.getElementById("selectedCountDisplay");
  const count = selectedGalleryIndices.size;
  if (countEl) countEl.textContent = count;
  if (btn) btn.style.display = count > 0 ? "inline-flex" : "none";
}

window.deleteSelectedGalleryItems = async function() {
  const count = selectedGalleryIndices.size;
  if (count === 0) return;
  if (!confirm(`Are you sure you want to delete ${count} selected photo(s) from the gallery?`)) return;

  const sortedIndices = Array.from(selectedGalleryIndices).sort((a, b) => b - a);
  sortedIndices.forEach(idx => {
    state.data.gallery.splice(idx, 1);
  });
  selectedGalleryIndices.clear();

  const ok = await saveAllDataToServer(`${count} photo(s) removed from gallery.`);
  if (ok) renderGalleryGrid();
};

window.deleteGalleryItem = async function(idx) {
  if (!confirm("Remove this photo from the gallery?")) return;
  state.data.gallery.splice(idx, 1);
  const ok = await saveAllDataToServer("Photo removed from gallery.");
  if (ok) renderGalleryGrid();
};

// Helper to resolve admin image URLs safely across mobile, tablet, and desktop
window.resolveAdminImageUrl = function(src) {
  if (!src) return "images/kunja-34.jpeg";
  let clean = src.replace(/^\.\//, "").trim();
  // Ensure path spaces in folder names are URI encoded e.g. Room A1 -> Room%20A1
  // Split path parts and encode segments
  const parts = clean.split("/");
  const encodedParts = parts.map(part => encodeURIComponent(decodeURIComponent(part)));
  return encodedParts.join("/");
};

// Global fallback image error handler
window.handleAdminImageError = function(imgEl) {
  if (!imgEl) return;
  imgEl.onerror = null;
  imgEl.src = "images/kunja-34.jpeg";
  imgEl.style.opacity = "0.75";
};

// Check Admins Modal with Masked Contact Details and Live Online Indicators
window.openCheckAdminsModal = async function() {
  const modalList = document.getElementById("modalAdminsList");
  const countEl = document.getElementById("modalAdminsCount");
  if (!modalList) return;

  modalList.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--color-text-muted);">Loading admin accounts...</div>`;
  openModal("checkAdminsModal");

  try {
    const res = await fetch("api/auth.php?action=list_admins");
    const json = await res.json();
    if (!res.ok || !json.success) {
      modalList.innerHTML = `<div style="color:#DC2626; padding:1rem;">Failed to load administrators.</div>`;
      return;
    }

    const admins = json.admins || [];
    if (countEl) countEl.textContent = admins.length;

    modalList.innerHTML = admins.map(a => `
      <div class="item-row" style="background:#FFF; padding:1rem; border:1px solid var(--color-border); border-radius:var(--radius-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="online-indicator-dot ${a.online ? 'online' : 'offline'}" title="${a.online ? 'Online now' : 'Offline'}"></span>
            <strong style="font-size:1.02rem; color:var(--color-forest);">
              ${a.name} ${a.is_self ? '<span class="user-pill" style="font-size:0.75rem; margin-left:6px;">You</span>' : ''}
            </strong>
          </div>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">
            ${a.online ? '<span style="color:#059669; font-weight:600;">● Active Now</span>' : (a.created_at ? 'Joined ' + new Date(a.created_at).toLocaleDateString() : '')}
          </span>
        </div>
        <div style="font-size:0.86rem; color:var(--color-text-muted); margin-top:6px; display:flex; flex-direction:column; gap:3px;">
          <div>📧 <strong>Email:</strong> <code>${a.masked_email || a.email}</code></div>
          <div>📱 <strong>Phone:</strong> <code>${a.masked_phone || a.phone}</code></div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    modalList.innerHTML = `<div style="color:#DC2626; padding:1rem;">Network error fetching administrators.</div>`;
  }
};

// Periodic 30s Heartbeat Ping for Live Online Presence
let presenceHeartbeatInterval = null;
function startPresenceHeartbeat() {
  if (presenceHeartbeatInterval) clearInterval(presenceHeartbeatInterval);
  presenceHeartbeatInterval = setInterval(async () => {
    if (!state.authenticated) return;
    try {
      await fetch("api/auth.php?action=heartbeat");
    } catch (e) {}
  }, 30000);
}

// --- CALENDAR & CHANGE LOG SYSTEM ---
let changeLogData = [];
let activeLogDateFilter = "all";
let activeLogAdminFilter = "all";

window.loadChangeLog = async function() {
  const container = document.getElementById("changeLogEntriesList");
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--color-text-muted);">Loading audit change log...</div>`;

  try {
    const res = await fetch("api/auth.php?action=get_changelog");
    const json = await res.json();
    if (res.ok && json.success) {
      changeLogData = json.changelog || [];
      renderChangeLogCalendar();
      renderFilteredChangeLog();
    } else {
      container.innerHTML = `<div style="color:#DC2626; padding:1.5rem;">Failed to load audit change log.</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div style="color:#DC2626; padding:1.5rem;">Network error loading change log.</div>`;
  }
};

function renderChangeLogCalendar() {
  const calContainer = document.getElementById("changeLogCalendarGrid");
  if (!calContainer) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const titleEl = document.getElementById("calMonthTitle");
  if (titleEl) titleEl.textContent = `${monthNames[month]} ${year}`;

  // Map dates to log count
  const dateCounts = {};
  changeLogData.forEach(entry => {
    if (entry.dateKey) {
      dateCounts[entry.dateKey] = (dateCounts[entry.dateKey] || 0) + 1;
    }
  });

  let daysHtml = "";
  // Blank days before 1st of month
  for (let i = 0; i < firstDay; i++) {
    daysHtml += `<div class="cal-day empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const count = dateCounts[dStr] || 0;
    const isSelected = activeLogDateFilter === dStr;
    const isToday = (day === now.getDate());

    daysHtml += `
      <div class="cal-day ${count > 0 ? 'has-events' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" onclick="filterLogByDate('${dStr}')" title="${count} change(s) recorded">
        <span class="cal-day-num">${day}</span>
        ${count > 0 ? `<span class="cal-day-badge">${count}</span>` : ''}
      </div>
    `;
  }

  calContainer.innerHTML = daysHtml;
}

window.filterLogByDate = function(dateKey) {
  activeLogDateFilter = dateKey;
  renderChangeLogCalendar();
  renderFilteredChangeLog();
};

window.resetLogDateFilter = function() {
  activeLogDateFilter = "all";
  renderChangeLogCalendar();
  renderFilteredChangeLog();
};

window.handleLogAdminFilterChange = function(adminVal) {
  activeLogAdminFilter = adminVal;
  renderFilteredChangeLog();
};

function renderFilteredChangeLog() {
  const container = document.getElementById("changeLogEntriesList");
  const filterBadge = document.getElementById("activeDateFilterBadge");
  const countDisplay = document.getElementById("changeLogCountDisplay");
  if (!container) return;

  let filtered = changeLogData.slice();

  if (activeLogDateFilter !== "all") {
    filtered = filtered.filter(item => item.dateKey === activeLogDateFilter);
    if (filterBadge) {
      filterBadge.textContent = `📅 Filtered by: ${activeLogDateFilter}`;
      filterBadge.style.display = "inline-flex";
    }
  } else {
    if (filterBadge) filterBadge.style.display = "none";
  }

  if (activeLogAdminFilter !== "all") {
    filtered = filtered.filter(item => (item.adminName || "").toLowerCase().includes(activeLogAdminFilter.toLowerCase()));
  }

  if (countDisplay) countDisplay.textContent = `${filtered.length} entries`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 2.5rem; text-align: center; color: var(--color-text-muted);">
        No audit changes recorded for this filter selection.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="changelog-item">
      <div class="changelog-item-header">
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <span class="changelog-action-tag">${item.actionType || 'Edit'}</span>
          <strong style="color:var(--color-forest); font-size:0.95rem;">${item.adminMaskedId || item.adminName || 'Admin'}</strong>
        </div>
        <span class="changelog-time">${item.timestamp || ''}</span>
      </div>
      <div class="changelog-item-body">
        ${item.summary || ''}
      </div>
    </div>
  `).join("");
}

// Download Audit Log as .txt file
window.downloadChangeLogTxt = function() {
  if (changeLogData.length === 0) {
    showToast("No change log entries available to download.", true);
    return;
  }

  const dateNow = new Date().toISOString().split("T")[0];
  let text = `==========================================================\n`;
  text += `KUNJA HOMESTAY — OWNER AUDIT & ACTIVITY CHANGE LOG\n`;
  text += `Exported on: ${new Date().toLocaleString()} (IST)\n`;
  text += `Total Recorded Actions: ${changeLogData.length}\n`;
  text += `==========================================================\n\n`;

  changeLogData.forEach((item, idx) => {
    text += `[${idx + 1}] DATE/TIME : ${item.timestamp || item.iso || 'N/A'}\n`;
    text += `    ADMIN     : ${item.adminMaskedId || item.adminName || 'Admin'}\n`;
    text += `    ACTION    : ${item.actionType || 'Update'}\n`;
    text += `    SUMMARY   : ${item.summary || ''}\n`;
    text += `----------------------------------------------------------\n`;
  });

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kunja-homestay-changelog-${dateNow}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Audit change log downloaded as .txt!");
};

window.triggerFolderSync = async function() {
  showToast("Scanning images subfolders...");
  try {
    const res = await fetch("api/sync-folders.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": state.csrfToken
      },
      body: JSON.stringify({ csrf_token: state.csrfToken })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      showToast(json.error || "Sync failed.", true);
    } else {
      showToast(`Sync complete! Added ${json.added_photos || 0} new photos.`);
      await loadHomestayData();
    }
  } catch (err) {
    showToast("Network error syncing folders.", true);
  }
};

// --- VISITOR TRAFFIC & ANALYTICS CONTROLLER ---
window.loadVisitorAnalytics = async function() {
  try {
    const res = await fetch("api/analytics.php?action=stats");
    const json = await res.json();
    if (!res.ok || !json.success) return;

    const sum = json.summary || {};
    const elTodayViews = document.getElementById("statTodayViews");
    const elTodayUniques = document.getElementById("statTodayUniques");
    const elYestViews = document.getElementById("statYestViews");
    const elYestUniques = document.getElementById("statYestUniques");
    const elTotalViews = document.getElementById("statTotalViews");
    const elTotalUniques = document.getElementById("statTotalUniques");

    if (elTodayViews) elTodayViews.textContent = (sum.today_views || 0).toLocaleString();
    if (elTodayUniques) elTodayUniques.textContent = (sum.today_uniques || 0).toLocaleString();
    if (elYestViews) elYestViews.textContent = (sum.yesterday_views || 0).toLocaleString();
    if (elYestUniques) elYestUniques.textContent = (sum.yesterday_uniques || 0).toLocaleString();
    if (elTotalViews) elTotalViews.textContent = (sum.total_views || 0).toLocaleString();
    if (elTotalUniques) elTotalUniques.textContent = (sum.total_uniques || 0).toLocaleString();

    // Render 7-day progress bars
    const weeklyBarsContainer = document.getElementById("analyticsWeeklyBars");
    if (weeklyBarsContainer && Array.isArray(json.last7Days)) {
      const maxViews = Math.max(...json.last7Days.map(d => d.views || 0), 10);
      weeklyBarsContainer.innerHTML = json.last7Days.map(d => {
        const pct = Math.min(100, Math.round((d.views / maxViews) * 100));
        return `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 2px;">
              <span style="font-weight: 600; color: var(--color-forest);">${d.label}</span>
              <span style="color: var(--color-text-muted);">${d.uniques} visitors (${d.views} views)</span>
            </div>
            <div style="background: #F3F4F6; height: 10px; border-radius: 999px; overflow: hidden;">
              <div style="width: ${Math.max(pct, 4)}%; height: 100%; background: var(--color-terracotta); border-radius: 999px; transition: width 0.4s ease;"></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // Render Referrer sources
    const refContainer = document.getElementById("analyticsReferrersList");
    if (refContainer && json.referrers) {
      const refEntries = Object.entries(json.referrers).sort((a, b) => b[1] - a[1]);
      const totalRefs = refEntries.reduce((acc, curr) => acc + curr[1], 0) || 1;
      refContainer.innerHTML = refEntries.map(([source, count]) => {
        const pct = Math.round((count / totalRefs) * 100);
        return `
          <div style="display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.35rem 0.5rem; background: #F9FAFB; border-radius: var(--radius-sm);">
            <span>${source}</span>
            <strong style="color: var(--color-forest);">${count} <span style="font-weight: 400; color: var(--color-text-muted); font-size: 0.75rem;">(${pct}%)</span></strong>
          </div>
        `;
      }).join("");
    }

    // Render Devices breakdown
    const devContainer = document.getElementById("analyticsDevicesList");
    if (devContainer && json.devices) {
      const devEntries = Object.entries(json.devices);
      devContainer.innerHTML = devEntries.map(([device, count]) => `
        <div style="flex: 1; min-width: 90px; text-align: center; background: #F9FAFB; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.65rem 0.5rem;">
          <div style="font-size: 1.25rem;">${device === 'Mobile' ? '📱' : (device === 'Tablet' ? '📟' : '💻')}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">${device}</div>
          <strong style="font-size: 1rem; color: var(--color-forest);">${count}</strong>
        </div>
      `).join("");
    }

    // Render Recent Hits
    const recentContainer = document.getElementById("analyticsRecentHitsList");
    if (recentContainer && Array.isArray(json.recent_hits)) {
      if (json.recent_hits.length === 0) {
        recentContainer.innerHTML = `<div style="text-align: center; color: var(--color-text-muted); font-size: 0.85rem; padding: 1rem;">No recent visits recorded yet.</div>`;
      } else {
        recentContainer.innerHTML = json.recent_hits.map(h => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.6rem; border-bottom: 1px solid #F3F4F6; font-size: 0.82rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span>${h.device === 'Mobile' ? '📱' : (h.device === 'Tablet' ? '📟' : '💻')}</span>
              <span>${h.source}</span>
              ${h.unique ? '<span style="font-size: 0.7rem; background: #DCFCE7; color: #166534; padding: 1px 5px; border-radius: 999px; font-weight: 600;">New</span>' : ''}
            </div>
            <span style="color: var(--color-text-muted); font-size: 0.75rem;">${h.time}</span>
          </div>
        `).join("");
      }
    }
  } catch (e) {}
};
