/**
 * Kunja Homestay — Owner Desk Administration Controller
 * Manages authentication, CSRF tokens, properties/rooms, reviews, google ratings, photos, certificates, and folder syncing.
 */

let state = {
  authenticated: false,
  setupRequired: false,
  username: null,
  csrfToken: null,
  isDefaultPassword: false,
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

// Check session status on page load
async function checkAuthStatus() {
  try {
    const res = await fetch("api/auth.php?action=status");
    const json = await res.json();
    state.authenticated = !!json.authenticated;
    state.setupRequired = !!json.setup_required;
    state.csrfToken = json.csrf_token || null;
    state.username = json.username || null;
    state.isDefaultPassword = !!json.is_default_password;

    renderAuthViews();

    if (state.authenticated) {
      await loadHomestayData();
    }
  } catch (err) {
    console.error("Auth check failed:", err);
    renderAuthViews();
  }
}

// Toggle between Login/Setup View and Dashboard View
function renderAuthViews() {
  const loginView = document.getElementById("loginView");
  const dashView = document.getElementById("dashboardView");
  const userGroup = document.getElementById("headerUserGroup");
  const defaultPwBanner = document.getElementById("defaultPasswordBanner");
  const displayUser = document.getElementById("displayUsername");
  const loginForm = document.getElementById("loginForm");
  const setupForm = document.getElementById("setupForm");
  const formTitle = document.getElementById("authFormTitle");
  const formSubtitle = document.getElementById("authFormSubtitle");

  if (state.authenticated) {
    if (loginView) loginView.style.display = "none";
    if (dashView) dashView.style.display = "block";
    if (userGroup) userGroup.style.display = "flex";
    if (displayUser) displayUser.textContent = `👤 ${state.username || 'Owner'}`;
    if (defaultPwBanner) defaultPwBanner.style.display = state.isDefaultPassword ? "flex" : "none";
  } else {
    if (loginView) loginView.style.display = "flex";
    if (dashView) dashView.style.display = "none";
    if (userGroup) userGroup.style.display = "none";

    if (state.setupRequired) {
      if (formTitle) formTitle.textContent = "Initial Setup";
      if (formSubtitle) formSubtitle.textContent = "Create your owner credentials";
      if (loginForm) loginForm.style.display = "none";
      if (setupForm) setupForm.style.display = "block";
    } else {
      if (formTitle) formTitle.textContent = "Owner Sign In";
      if (formSubtitle) formSubtitle.textContent = "Kunja Homestay Management Portal";
      if (loginForm) loginForm.style.display = "block";
      if (setupForm) setupForm.style.display = "none";
    }
  }
}

// Handle First-Time Setup
async function handleInitialSetup(e) {
  e.preventDefault();
  const username = document.getElementById("setupUsername").value.trim();
  const password = document.getElementById("setupPassword").value;
  const confirm = document.getElementById("setupPasswordConfirm").value;
  const errorEl = document.getElementById("loginError");
  const submitBtn = document.getElementById("setupSubmitBtn");

  errorEl.style.display = "none";

  if (password !== confirm) {
    errorEl.textContent = "Passwords do not match. Please verify and try again.";
    errorEl.style.display = "block";
    return;
  }

  if (password.length < 8) {
    errorEl.textContent = "Password must be at least 8 characters long.";
    errorEl.style.display = "block";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Securing Account...";

  try {
    const res = await fetch("api/auth.php?action=setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      errorEl.textContent = json.error || "Setup failed. Please try again.";
      errorEl.style.display = "block";
    } else {
      state.authenticated = true;
      state.setupRequired = false;
      state.username = json.username;
      state.csrfToken = json.csrf_token;
      state.isDefaultPassword = false;
      renderAuthViews();
      await loadHomestayData();
      showToast("Master credentials saved! Welcome to Kunja Desk.");
    }
  } catch (err) {
    errorEl.textContent = "Network error. Please try again.";
    errorEl.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create & Secure My Account →";
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginSubmitBtn");

  errorEl.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = "Verifying...";

  try {
    const res = await fetch("api/auth.php?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      errorEl.textContent = json.error || "Login failed. Please check your credentials.";
      errorEl.style.display = "block";
    } else {
      state.authenticated = true;
      state.username = json.username;
      state.csrfToken = json.csrf_token;
      state.isDefaultPassword = !!json.is_default_password;
      renderAuthViews();
      await loadHomestayData();
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

// Handle Logout
async function handleLogout() {
  try {
    await fetch("api/auth.php?action=logout", { method: "POST" });
  } catch (e) {}
  state.authenticated = false;
  state.username = null;
  state.csrfToken = null;
  renderAuthViews();
  showToast("Logged out successfully.");
}

// Switch Tab
window.switchTab = function(tabName) {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach(el => el.style.display = "none");

  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach(btn => btn.classList.remove("active"));

  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.style.display = "block";

  const clickedBtn = Array.from(buttons).find(b => b.getAttribute("onclick").includes(tabName));
  if (clickedBtn) clickedBtn.classList.add("active");
};

// Modal helpers
window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("open");
};

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("open");
}

// Load homestay data from kunjaData.json with cache busting
async function loadHomestayData() {
  try {
    const res = await fetch(`kunjaData.json?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load data");
    state.data = await res.json();

    populateNoticeBannerForm();
    renderPropertiesManager();
    renderCertificateSection();
    renderGoogleReviewForm();
    renderReviewsList();
    renderGalleryGrid();
  } catch (err) {
    showToast("Failed to load homestay configuration.", true);
  }
}

// Save entire state back to server
async function saveAllDataToServer(successMsg) {
  try {
    // Keep flat rooms array in sync with properties
    if (state.data.properties && Array.isArray(state.data.properties)) {
      let flatRooms = [];
      state.data.properties.forEach(p => {
        if (p.rooms && Array.isArray(p.rooms)) {
          flatRooms = flatRooms.concat(p.rooms);
        }
      });
      state.data.rooms = flatRooms;
    }

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
    }

    showToast(successMsg || "Changes saved & backed up successfully!");
    return true;
  } catch (err) {
    showToast("Network error while saving.", true);
    return false;
  }
}

// One-Click Folder Auto-Sync
window.triggerFolderSync = async function() {
  showToast("Scanning images/ subdirectories...");
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
    if (json.success) {
      showToast(json.message || "Folder sync complete!");
      await loadHomestayData();
    } else {
      showToast(json.error || "Folder sync failed.", true);
    }
  } catch (err) {
    showToast("Error during folder sync.", true);
  }
};

// --- NOTICE BANNER LOGIC ---
function populateNoticeBannerForm() {
  if (!state.data) return;
  const nb = state.data.noticeBanner || { enabled: false, title: "", message: "", fromDateTime: "", toDateTime: "" };
  state.data.noticeBanner = nb;

  document.getElementById("noticeEnabled").checked = !!nb.enabled;
  document.getElementById("noticeTitle").value = nb.title || "";
  document.getElementById("noticeMessage").value = nb.message || "";
  document.getElementById("noticeFromDate").value = nb.fromDateTime || "";
  document.getElementById("noticeToDate").value = nb.toDateTime || "";

  updateNoticePreview();
}

window.updateNoticePreview = function() {
  const enabled = document.getElementById("noticeEnabled").checked;
  const title = document.getElementById("noticeTitle").value || "Notice Title";
  const message = document.getElementById("noticeMessage").value || "Notice message will appear here...";
  const from = document.getElementById("noticeFromDate").value;
  const to = document.getElementById("noticeToDate").value;

  const box = document.getElementById("noticePreviewBox");
  const prevTitle = document.getElementById("prevTitle");
  const prevMessage = document.getElementById("prevMessage");
  const prevDates = document.getElementById("prevDates");

  prevTitle.textContent = title;
  prevMessage.textContent = message;

  if (from || to) {
    prevDates.textContent = `📅 Window: ${from ? new Date(from).toLocaleString() : 'Immediate'} → ${to ? new Date(to).toLocaleString() : 'Indefinite'}`;
  } else {
    prevDates.textContent = "";
  }

  box.style.opacity = enabled ? "1" : "0.5";
};

window.saveNoticeBanner = async function(e) {
  e.preventDefault();
  if (!state.data) return;

  state.data.noticeBanner = {
    enabled: document.getElementById("noticeEnabled").checked,
    title: document.getElementById("noticeTitle").value.trim(),
    message: document.getElementById("noticeMessage").value.trim(),
    fromDateTime: document.getElementById("noticeFromDate").value,
    toDateTime: document.getElementById("noticeToDate").value
  };

  await saveAllDataToServer("Three-stage notice settings saved successfully!");
};

// --- TWO PROPERTIES & ROOMS MANAGER ---
function renderPropertiesManager() {
  const container = document.getElementById("propertiesManagerList");
  if (!container || !state.data) return;

  const properties = state.data.properties || [];
  if (properties.length === 0) {
    container.innerHTML = `<p style="color:var(--color-text-muted);">No properties configured.</p>`;
    return;
  }

  container.innerHTML = properties.map((prop, pIdx) => `
    <div class="prop-admin-box">
      <div class="prop-admin-header">
        <div style="display:flex; gap:1.25rem; align-items:center;">
          <img src="${prop.coverImage || 'images/kunja-34.jpeg'}" alt="${prop.name}" style="width:110px; height:80px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--color-terracotta);">${prop.locationNote || 'Santiniketan'}</span>
            <h3 style="color:var(--color-forest); font-size:1.25rem; margin-top:2px;">${prop.name}</h3>
            <p style="font-size:0.85rem; color:var(--color-text-muted); max-width:650px;">${prop.description || ''}</p>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <button class="btn btn-outline" style="padding:0.4rem 0.85rem;" onclick="openEditPropertyModal(${pIdx})">✏️ Edit Property</button>
          <button class="btn btn-forest" style="padding:0.4rem 0.85rem;" onclick="openAddRoomModal(${pIdx})">+ Add Room</button>
        </div>
      </div>

      <div style="margin-top:1rem;">
        <h4 style="font-size:0.95rem; color:var(--color-forest); margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.04em;">
          Suites in this property (${prop.rooms ? prop.rooms.length : 0})
        </h4>
        <div class="item-list">
          ${(prop.rooms || []).map((room, rIdx) => `
            <div class="item-row">
              <div class="item-row-header">
                <div>
                  <strong style="color:var(--color-forest); font-size:1.05rem;">${room.name}</strong>
                  <span style="margin-left:0.5rem; font-size:0.75rem; background:#EBF4EE; color:var(--color-forest); padding:0.2rem 0.5rem; border-radius:4px; font-weight:600;">
                    ${room.occupancyTag}
                  </span>
                </div>
                <div style="display:flex; align-items:center; gap:0.75rem; margin-top:0.4rem;">
                  <span style="font-weight:700; color:var(--color-terracotta);">${room.nightlyPrice || 'Tariff not set'}</span>
                  <span style="font-size:0.8rem; background:#F1E9DF; padding:0.2rem 0.5rem; border-radius:4px;">${room.seasonLabel || 'Standard Tariff'}</span>
                  <button class="btn btn-outline" style="padding:0.3rem 0.65rem;" onclick="openEditRoomModal(${pIdx}, ${rIdx})">Edit Room</button>
                  <button class="btn btn-danger" style="padding:0.3rem 0.65rem;" onclick="deleteRoom(${pIdx}, ${rIdx})">Delete</button>
                </div>
              </div>
              <p style="font-size:0.88rem; color:var(--color-text-muted);">${room.description}</p>
              
              <!-- Room Photos Management -->
              <div style="margin-top:0.35rem;">
                <div style="font-size:0.78rem; font-weight:700; color:var(--color-forest); margin-bottom:0.25rem;">
                  Room Photographs (${(room.images || []).length}):
                </div>
                <div class="room-thumbs-strip">
                  ${(room.images || []).map((img, imgIdx) => `
                    <div class="room-thumb-item" title="${img}">
                      <img src="${img}" alt="photo">
                      <button class="room-thumb-del" onclick="deleteRoomPhoto(${pIdx}, ${rIdx}, ${imgIdx})" title="Delete photo">✕</button>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `).join("");
}

// Edit Property Modal
window.openEditPropertyModal = function(pIdx) {
  const prop = state.data.properties[pIdx];
  if (!prop) return;

  document.getElementById("editPropIndex").value = pIdx;
  document.getElementById("editPropName").value = prop.name || "";
  document.getElementById("editPropLocation").value = prop.locationNote || "";
  document.getElementById("editPropDesc").value = prop.description || "";
  document.getElementById("editPropExistingCover").value = prop.coverImage || "";
  document.getElementById("editPropCoverFile").value = "";

  openModal("propertyModal");
};

window.savePropertyEdit = async function(e) {
  e.preventDefault();
  const pIdx = parseInt(document.getElementById("editPropIndex").value, 10);
  const prop = state.data.properties[pIdx];
  if (!prop) return;

  const submitBtn = document.getElementById("propSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  prop.name = document.getElementById("editPropName").value.trim();
  prop.locationNote = document.getElementById("editPropLocation").value.trim();
  prop.description = document.getElementById("editPropDesc").value.trim();

  const fileInput = document.getElementById("editPropCoverFile");
  if (fileInput.files && fileInput.files[0]) {
    const formData = new FormData();
    formData.append("photo", fileInput.files[0]);
    formData.append("csrf_token", state.csrfToken);
    formData.append("subfolder", prop.id === "building-1" ? "building-1/exterior" : "building-2/exterior");

    try {
      const upRes = await fetch("api/upload-image.php", {
        method: "POST",
        headers: { "X-CSRF-Token": state.csrfToken },
        body: formData
      });
      const upJson = await upRes.json();
      if (upJson.success) {
        prop.coverImage = upJson.imagePath;
      }
    } catch (err) {
      console.error(err);
    }
  }

  const ok = await saveAllDataToServer(`Updated ${prop.name}`);
  submitBtn.disabled = false;
  submitBtn.textContent = "Save Property Changes";
  if (ok) {
    closeModal("propertyModal");
    renderPropertiesManager();
  }
};

// Add or Edit Room
window.openAddRoomModal = function(pIdx) {
  document.getElementById("roomModalTitle").textContent = "Add Room Suite";
  document.getElementById("editRoomPropIdx").value = pIdx;
  document.getElementById("editRoomIdx").value = "";
  document.getElementById("editRoomForm").reset();
  openModal("roomModal");
};

window.openEditRoomModal = function(pIdx, rIdx) {
  const room = state.data.properties[pIdx].rooms[rIdx];
  if (!room) return;

  document.getElementById("roomModalTitle").textContent = "Edit Room Details";
  document.getElementById("editRoomPropIdx").value = pIdx;
  document.getElementById("editRoomIdx").value = rIdx;
  document.getElementById("editRoomName").value = room.name || "";
  document.getElementById("editRoomPrice").value = room.nightlyPrice || "₹2,500 / night";
  document.getElementById("editRoomSeason").value = room.seasonLabel || "Standard Tariff";
  document.getElementById("editRoomOccupancy").value = room.occupancyTag || "Perfect for 2 people";
  document.getElementById("editRoomDesc").value = room.description || "";
  document.getElementById("editRoomHighlights").value = (room.highlights || []).join(", ");
  document.getElementById("roomNewPhotoFile").value = "";

  openModal("roomModal");
};

window.saveRoomEdit = async function(e) {
  e.preventDefault();
  const pIdx = parseInt(document.getElementById("editRoomPropIdx").value, 10);
  const rIdxVal = document.getElementById("editRoomIdx").value;
  const isEdit = rIdxVal !== "";
  const prop = state.data.properties[pIdx];
  if (!prop) return;

  const submitBtn = document.getElementById("roomSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  let room = isEdit ? prop.rooms[parseInt(rIdxVal, 10)] : {
    id: "room-" + Date.now(),
    images: ["images/kunja-10.jpeg"]
  };

  room.name = document.getElementById("editRoomName").value.trim();
  room.nightlyPrice = document.getElementById("editRoomPrice").value.trim();
  room.seasonLabel = document.getElementById("editRoomSeason").value.trim();
  room.occupancyTag = document.getElementById("editRoomOccupancy").value;
  room.description = document.getElementById("editRoomDesc").value.trim();
  room.highlights = document.getElementById("editRoomHighlights").value.split(",").map(s => s.trim()).filter(Boolean);

  const fileInput = document.getElementById("roomNewPhotoFile");
  if (fileInput.files && fileInput.files[0]) {
    const formData = new FormData();
    formData.append("photo", fileInput.files[0]);
    formData.append("csrf_token", state.csrfToken);
    formData.append("subfolder", prop.id === "building-1" ? "building-1/room-1" : "building-2/room-1");

    try {
      const upRes = await fetch("api/upload-image.php", {
        method: "POST",
        headers: { "X-CSRF-Token": state.csrfToken },
        body: formData
      });
      const upJson = await upRes.json();
      if (upJson.success) {
        if (!room.images) room.images = [];
        room.images.push(upJson.imagePath);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!isEdit) {
    if (!prop.rooms) prop.rooms = [];
    prop.rooms.push(room);
  }

  const ok = await saveAllDataToServer(`Saved room ${room.name}`);
  submitBtn.disabled = false;
  submitBtn.textContent = "Save Room Changes";
  if (ok) {
    closeModal("roomModal");
    renderPropertiesManager();
  }
};

window.deleteRoom = async function(pIdx, rIdx) {
  if (!confirm("Are you sure you want to delete this room suite?")) return;
  state.data.properties[pIdx].rooms.splice(rIdx, 1);
  const ok = await saveAllDataToServer("Room suite removed.");
  if (ok) renderPropertiesManager();
};

window.deleteRoomPhoto = async function(pIdx, rIdx, imgIdx) {
  if (!confirm("Remove this photo from the room suite?")) return;
  const room = state.data.properties[pIdx].rooms[rIdx];
  if (room.images.length <= 1) {
    alert("Each room suite requires at least one photograph.");
    return;
  }
  room.images.splice(imgIdx, 1);
  const ok = await saveAllDataToServer("Photo removed from room.");
  if (ok) renderPropertiesManager();
};

// --- CERTIFICATE UPLOAD ---
function renderCertificateSection() {
  if (!state.data) return;
  const certPath = state.data.siteConfig?.recognition?.certificateImage || 
                   state.data.siteConfig?.recognition?.plaqueImage || 
                   "images/certificates/kunja-57.jpeg";
  const imgEl = document.getElementById("certPreviewDisplay");
  if (imgEl) imgEl.src = certPath;
}

window.uploadCertificateImage = async function() {
  const fileInput = document.getElementById("certUploadFile");
  if (!fileInput.files || !fileInput.files[0]) {
    alert("Please select a certificate image file first.");
    return;
  }

  const btn = document.getElementById("certUploadBtn");
  btn.disabled = true;
  btn.textContent = "Uploading...";

  const formData = new FormData();
  formData.append("photo", fileInput.files[0]);
  formData.append("csrf_token", state.csrfToken);
  formData.append("subfolder", "certificates");

  try {
    const res = await fetch("api/upload-image.php", {
      method: "POST",
      headers: { "X-CSRF-Token": state.csrfToken },
      body: formData
    });
    const json = await res.json();
    if (json.success) {
      if (!state.data.siteConfig.recognition) state.data.siteConfig.recognition = {};
      state.data.siteConfig.recognition.certificateImage = json.imagePath;
      await saveAllDataToServer("Recognition Certificate updated successfully!");
      renderCertificateSection();
      fileInput.value = "";
    } else {
      showToast(json.error || "Certificate upload failed.", true);
    }
  } catch (err) {
    showToast("Error uploading certificate.", true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Save & Replace Certificate";
  }
};

// --- GOOGLE REVIEW & TESTIMONIALS ---
function renderGoogleReviewForm() {
  if (!state.data) return;
  const url = state.data.contact?.googleReviewUrl || "";
  document.getElementById("adminGoogleReviewUrl").value = url;
}

window.saveGoogleReviewUrl = async function(e) {
  e.preventDefault();
  if (!state.data) return;
  state.data.contact.googleReviewUrl = document.getElementById("adminGoogleReviewUrl").value.trim();
  await saveAllDataToServer("Google Review URL updated successfully!");
};

function renderReviewsList() {
  const container = document.getElementById("reviewsList");
  if (!container || !state.data || !state.data.reviews) return;

  container.innerHTML = state.data.reviews.map((rev, idx) => `
    <div class="item-row">
      <div class="item-row-header">
        <div>
          <strong style="color:var(--color-forest); font-size:1.05rem;">${rev.guestName}</strong>
          <span style="color:var(--color-text-muted); font-size:0.85rem;">(${rev.hometown})</span>
        </div>
        <div style="display:flex; gap:0.5rem; margin-top:0.4rem;">
          <button class="btn btn-outline" style="padding:0.3rem 0.65rem;" onclick="openReviewModal(${idx})">Edit</button>
          <button class="btn btn-danger" style="padding:0.3rem 0.65rem;" onclick="deleteReview(${idx})">Delete</button>
        </div>
      </div>
      <div style="font-style:italic; font-weight:600; color:var(--color-forest); font-family:var(--font-serif);">
        "${rev.quote}"
      </div>
      <p style="font-size:0.88rem; color:var(--color-text-muted);">${rev.reviewText}</p>
    </div>
  `).join("");
}

window.openReviewModal = function(reviewIndex = null) {
  const isEdit = reviewIndex !== null && typeof reviewIndex === "number";
  document.getElementById("reviewModalTitle").textContent = isEdit ? "Edit Guest Review" : "Add New Guest Review";
  document.getElementById("editReviewId").value = isEdit ? reviewIndex : "";

  if (isEdit) {
    const rev = state.data.reviews[reviewIndex];
    document.getElementById("reviewGuestName").value = rev.guestName;
    document.getElementById("reviewHometown").value = rev.hometown;
    document.getElementById("reviewQuote").value = rev.quote;
    document.getElementById("reviewText").value = rev.reviewText;
  } else {
    document.getElementById("reviewForm").reset();
  }

  openModal("reviewModal");
};

window.saveReview = async function(e) {
  e.preventDefault();
  const idVal = document.getElementById("editReviewId").value;
  const isEdit = idVal !== "";

  const reviewObj = {
    id: isEdit ? state.data.reviews[parseInt(idVal, 10)].id : `rev-${Date.now()}`,
    guestName: document.getElementById("reviewGuestName").value.trim(),
    hometown: document.getElementById("reviewHometown").value.trim(),
    quote: document.getElementById("reviewQuote").value.trim(),
    reviewText: document.getElementById("reviewText").value.trim()
  };

  if (isEdit) {
    state.data.reviews[parseInt(idVal, 10)] = reviewObj;
  } else {
    if (!state.data.reviews) state.data.reviews = [];
    state.data.reviews.unshift(reviewObj);
  }

  const ok = await saveAllDataToServer(isEdit ? "Review updated." : "New review added.");
  if (ok) {
    closeModal("reviewModal");
    renderReviewsList();
  }
};

window.deleteReview = async function(idx) {
  if (!confirm("Are you sure you want to delete this guest review?")) return;
  state.data.reviews.splice(idx, 1);
  const ok = await saveAllDataToServer("Review deleted.");
  if (ok) renderReviewsList();
};

// --- GALLERY & PHOTOS LOGIC ---
function renderGalleryGrid() {
  const container = document.getElementById("galleryGrid");
  if (!container || !state.data || !state.data.gallery) return;

  container.innerHTML = state.data.gallery.map((item, idx) => `
    <div class="gallery-admin-card">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="gallery-admin-card-body">
        <div>
          <span style="font-size:0.72rem; text-transform:uppercase; font-weight:700; color:var(--color-terracotta);">
            ${item.category}
          </span>
          <h4 style="font-size:0.95rem; margin-top:0.2rem; color:var(--color-forest);">${item.title}</h4>
          <p style="font-size:0.8rem; color:var(--color-text-muted); margin-top:0.25rem;">${item.caption || ''}</p>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:0.75rem; border-top:1px solid var(--color-border-subtle); padding-top:0.5rem;">
          <button class="btn btn-outline" style="padding:0.25rem 0.55rem; font-size:0.8rem;" onclick="openEditPhotoModal(${idx})">Edit Post</button>
          <button class="btn btn-danger" style="padding:0.25rem 0.55rem; font-size:0.8rem;" onclick="deleteGalleryItem(${idx})">Delete</button>
        </div>
      </div>
    </div>
  `).join("");
}

window.openPhotoUploadModal = function() {
  document.getElementById("photoModalTitle").textContent = "Upload New Photo";
  document.getElementById("editPhotoId").value = "";
  document.getElementById("existingPhotoPath").value = "";
  document.getElementById("photoUploadGroup").style.display = "block";
  document.getElementById("photoFile").required = true;
  document.getElementById("photoForm").reset();
  openModal("photoModal");
};

window.openEditPhotoModal = function(idx) {
  const item = state.data.gallery[idx];
  if (!item) return;

  document.getElementById("photoModalTitle").textContent = "Edit Photo Details";
  document.getElementById("editPhotoId").value = idx;
  document.getElementById("existingPhotoPath").value = item.image;
  document.getElementById("photoUploadGroup").style.display = "none";
  document.getElementById("photoFile").required = false;

  document.getElementById("photoCategory").value = item.category || "ambiance";
  document.getElementById("photoTitle").value = item.title || "";
  document.getElementById("photoCaption").value = item.caption || "";

  openModal("photoModal");
};

window.savePhotoPost = async function(e) {
  e.preventDefault();
  const idVal = document.getElementById("editPhotoId").value;
  const isEdit = idVal !== "";
  const submitBtn = document.getElementById("photoSubmitBtn");

  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";

  let imagePath = document.getElementById("existingPhotoPath").value;

  try {
    if (!isEdit) {
      const fileInput = document.getElementById("photoFile");
      if (!fileInput.files || !fileInput.files[0]) {
        showToast("Please choose an image file to upload.", true);
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Photo Entry";
        return;
      }

      const formData = new FormData();
      formData.append("photo", fileInput.files[0]);
      formData.append("csrf_token", state.csrfToken);
      formData.append("subfolder", "gallery");

      const uploadRes = await fetch("api/upload-image.php", {
        method: "POST",
        headers: { "X-CSRF-Token": state.csrfToken },
        body: formData
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.success) {
        showToast(uploadJson.error || "Image upload failed.", true);
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Photo Entry";
        return;
      }

      imagePath = uploadJson.imagePath;
    }

    const galleryItem = {
      id: isEdit ? state.data.gallery[parseInt(idVal, 10)].id : `gal-${Date.now()}`,
      category: document.getElementById("photoCategory").value,
      title: document.getElementById("photoTitle").value.trim(),
      caption: document.getElementById("photoCaption").value.trim(),
      image: imagePath
    };

    if (isEdit) {
      state.data.gallery[parseInt(idVal, 10)] = galleryItem;
    } else {
      if (!state.data.gallery) state.data.gallery = [];
      state.data.gallery.unshift(galleryItem);
    }

    const ok = await saveAllDataToServer(isEdit ? "Photo post updated." : "New photo added to gallery!");
    if (ok) {
      closeModal("photoModal");
      renderGalleryGrid();
    }
  } catch (err) {
    showToast("Error processing photo.", true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Photo Entry";
  }
};

window.deleteGalleryItem = async function(idx) {
  if (!confirm("Are you sure you want to remove this photo from the gallery?")) return;
  state.data.gallery.splice(idx, 1);
  const ok = await saveAllDataToServer("Photo removed from gallery.");
  if (ok) renderGalleryGrid();
};

// --- ACCOUNT SECURITY LOGIC ---
window.handleSecurityUpdate = async function(e) {
  e.preventDefault();
  const currentPassword = document.getElementById("secCurrentPassword").value;
  const newUsername = document.getElementById("secNewUsername").value.trim();
  const newPassword = document.getElementById("secNewPassword").value;

  try {
    const res = await fetch("api/auth.php?action=update_security", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": state.csrfToken
      },
      body: JSON.stringify({
        csrf_token: state.csrfToken,
        current_password: currentPassword,
        new_username: newUsername,
        new_password: newPassword
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      showToast(json.error || "Failed to update security settings.", true);
    } else {
      showToast("Security credentials updated successfully!");
      state.isDefaultPassword = false;
      if (newUsername) state.username = newUsername;
      renderAuthViews();
      document.getElementById("securityForm").reset();
    }
  } catch (err) {
    showToast("Network error updating credentials.", true);
  }
};
