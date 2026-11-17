/**
 * Kunja Homestay — Bolpur, Santiniketan
 * Client-Side State, Dynamic Rendering & Interactive Handlers
 * All photography loaded directly from bundled public assets (/public/images/)
 */

const kunjaData = {
  siteConfig: {
    name: "Kunja Homestay",
    tagline: "A Quiet Home in Bolpur, Santiniketan",
    location: "Bolpur, Santiniketan, Birbhum, West Bengal",
    recognition: {
      isRecognized: true,
      authority: "Department of Tourism, Government of West Bengal",
      badgeText: "Officially Recognized by the Department of Tourism, Government of West Bengal",
      shortBadge: "Govt. of West Bengal Recognized Homestay",
      plaqueImage: "public/images/photo_57.jpeg"
    },
    features: {
      enableAvailabilityCalendar: false,
      enableRoomSelection: false,
      enablePhotoSharing: true,
      enableGuestReviewSubmission: true
    }
  },

  contact: {
    phoneDisplay: "+91 90646 29141",
    phoneHref: "tel:+919064629141",
    whatsappNumber: "919064629141",
    whatsappDirectUrl: "https://wa.me/919064629141",
    googleMapsUrl: "https://www.google.com/maps/place/Kunja+Homestay+Eco+Resort/@23.6760972,87.678792,17z",
    coordinates: {
      latitude: 23.6760972,
      longitude: 87.678792
    },
    address: "Kunja Homestay Eco Resort, Bolpur, Santiniketan, Birbhum, West Bengal",
    directions: [
      {
        from: "Bolpur Shantiniketan Railway Station",
        details: "Easily reachable by local e-rickshaw (toto) or cab—a short, scenic ride through Bolpur town."
      },
      {
        from: "Prantik Railway Station",
        details: "Just a brief toto ride away, convenient for trains arriving from Howrah and Sealdah."
      },
      {
        from: "By Road",
        details: "Smooth highway access via NH-19 / Panagarh–Morgram route toward Bolpur, with direct pin navigation on Google Maps."
      }
    ]
  },

  rooms: [
    {
      id: "courtyard-double",
      name: "The Courtyard Double Room",
      occupancyTag: "Perfect for 2 people",
      description: "Designed for couples, solo travelers, or two friends looking for calm and privacy. Natural daylight, clean linen, comfortable bedding, and quiet surroundings make it easy to rest well after a day out in Santiniketan.",
      highlights: [
        "Attached clean bath",
        "Airy windows",
        "Morning tea service",
        "Peaceful garden access"
      ],
      images: [
        "public/images/photo_10.jpeg",
        "public/images/photo_11.jpeg",
        "public/images/photo_13.jpeg",
        "public/images/photo_14.jpeg"
      ]
    },
    {
      id: "verandah-twin",
      name: "The Verandah Twin Room",
      occupancyTag: "Perfect for 2 people",
      description: "A bright, welcoming room with easy access to the sit-out area—ideal for reading a book, enjoying morning coffee, or listening to birdsong in the early hours of Bolpur.",
      highlights: [
        "Attached clean bath",
        "Cozy seating corner",
        "Natural ventilation",
        "Home-cooked meal options"
      ],
      images: [
        "public/images/photo_20.jpeg",
        "public/images/photo_22.jpeg",
        "public/images/photo_23.jpeg",
        "public/images/photo_24.jpeg",
        "public/images/photo_26.jpeg",
        "public/images/photo_15.jpeg"
      ]
    },
    {
      id: "spacious-family",
      name: "The Spacious Family Room",
      occupancyTag: "Perfect for family",
      description: "Generous floor space with comfortable sleeping arrangements so parents and children can stay together without feeling crowded. Opens out toward the open courtyard where kids have room to move freely.",
      highlights: [
        "Spacious layout",
        "Attached clean bath",
        "Family-friendly comfort",
        "Freshly cooked homely meals"
      ],
      images: [
        "public/images/photo_30.jpeg",
        "public/images/photo_42.jpeg",
        "public/images/photo_51.jpeg",
        "public/images/photo_55.jpeg",
        "public/images/photo_43.jpeg",
        "public/images/photo_27.jpeg"
      ]
    },
    {
      id: "garden-family-suite",
      name: "The Garden Wing Family Suite",
      occupancyTag: "Perfect for family",
      description: "Thoughtfully arranged for families traveling with children or elders who value ground-level ease, quiet nights, and relaxed common spaces for evening conversations. Dressed in handcrafted Santiniketan folk textiles.",
      highlights: [
        "Extra room to unwind",
        "Attached clean bath",
        "Quiet surroundings",
        "Easy access to dining & garden"
      ],
      images: [
        "public/images/photo_37.jpeg",
        "public/images/photo_38.jpeg",
        "public/images/photo_41.jpeg",
        "public/images/photo_44.jpeg",
        "public/images/photo_48.jpeg",
        "public/images/photo_54.jpeg"
      ]
    }
  ],

  gallery: [
    {
      id: "gal-01",
      category: "ambiance",
      title: "Golden night ambiance in the open courtyard",
      caption: "Kunja Homestay glowing warmly under the evening sky with garden umbrellas and bonfire lawn.",
      image: "public/images/photo_34.jpeg"
    },
    {
      id: "gal-02",
      category: "gatherings",
      title: "Weekend smiles and family gatherings",
      caption: "Guests gathered under our front entrance lodge sign, enjoying unhurried conversations.",
      image: "public/images/photo_36.jpeg"
    },
    {
      id: "gal-03",
      category: "rooms",
      title: "Traditional Santiniketan Kantha folk art bedspread",
      caption: "Handcrafted tribal musician motifs adorning the comfortable beds in the Garden Wing.",
      image: "public/images/photo_37.jpeg"
    },
    {
      id: "gal-04",
      category: "ambiance",
      title: "Courtyard stone path and blooming flower pots",
      caption: "Lush potted marigolds, petunias, and green foliage lining the pathway in the morning sun.",
      image: "public/images/photo_56.jpeg"
    },
    {
      id: "gal-05",
      category: "gatherings",
      title: "Happy family moments on the garden lawn",
      caption: "Multigenerational travelers pausing for a cheerful photograph during morning tea.",
      image: "public/images/photo_17.jpeg"
    },
    {
      id: "gal-06",
      category: "gatherings",
      title: "Warm smiles by the garden petunias",
      caption: "A joyful guest enjoying the peaceful floral courtyard in traditional attire.",
      image: "public/images/photo_60.jpeg"
    },
    {
      id: "gal-07",
      category: "ambiance",
      title: "Authentic home-cooked Bengali thali feast",
      caption: "Freshly prepared rice, comforting dal, and seasonal vegetables served hot at our dining table.",
      image: "public/images/photo_58.jpeg"
    },
    {
      id: "gal-08",
      category: "rooms",
      title: "Sunlit room with morning garden breeze",
      caption: "Natural daylight pouring into the Verandah suite, equipped with an electric kettle and tea station.",
      image: "public/images/photo_20.jpeg"
    },
    {
      id: "gal-09",
      category: "gatherings",
      title: "Gentle courtyard visitors & pet companions",
      caption: "Guest relaxing peacefully in an outdoor garden chair holding friendly pet rabbits.",
      image: "public/images/photo_64.jpeg"
    },
    {
      id: "gal-10",
      category: "ambiance",
      title: "Bright magenta Bougainvillea blossoms",
      caption: "Colorful flora blooming all year round along the courtyard garden borders.",
      image: "public/images/photo_01.jpeg"
    },
    {
      id: "gal-11",
      category: "rooms",
      title: "Clean and spacious family room layout",
      caption: "Multi-bed sleeping arrangements ideal for families visiting Bolpur together.",
      image: "public/images/photo_30.jpeg"
    },
    {
      id: "gal-12",
      category: "gatherings",
      title: "Group travelers arriving in Santiniketan",
      caption: "Happy guests pausing for a photo beside their traveler van before exploring Khoai.",
      image: "public/images/photo_21.jpeg"
    }
  ],

  reviews: [
    {
      id: "rev-1",
      guestName: "Ananya & Subhojit Sen",
      hometown: "Kolkata",
      quote: "Felt like visiting relatives in Santiniketan, not staying at a commercial property.",
      reviewText: "We came from Kolkata for a two-day break and loved every bit of our stay at Kunja Homestay. The rooms were spotless, the surroundings were super peaceful, and the morning tea in the open space was the highlight of our trip. Sonajhuri is just a short toto ride away."
    },
    {
      id: "rev-2",
      guestName: "Debashis Chatterjee & Family",
      hometown: "Durgapur",
      quote: "Wonderful for a family trip with elderly parents.",
      reviewText: "Traveling with senior citizens means you worry about food and comfort, and the hosts took care of everything with so much warmth. Simple, fresh home-cooked Bengali food, clean bathrooms, and zero noise at night. Our parents didn't want to leave!"
    },
    {
      id: "rev-3",
      guestName: "Rituparna Das",
      hometown: "Salt Lake, Kolkata",
      quote: "Warm hosts, clean rooms, and true Bolpur charm.",
      reviewText: "If you want to experience the real, quiet side of Shantiniketan away from crowded main-road hotels, this is the place. The hosts helped us arrange a local toto for sightseeing and guided us on the best time to visit Khoai. Looking forward to coming back during Poush Mela."
    },
    {
      id: "rev-4",
      guestName: "Sourav & Meghna Banerjee",
      hometown: "Howrah",
      quote: "Our kids had space to play while we finally got to relax.",
      reviewText: "We stayed here as a family of four and had such a joyful time. The open surroundings are safe and green, the rooms are airy, and the hospitality is genuinely heartfelt. Having a West Bengal Tourism recognized homestay also gave us complete peace of mind while planning."
    }
  ]
};

// UI Controller on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initImageResilience();
  renderRooms();
  renderGallery("all");
  renderReviews();
  setupObserver();
  initRoomSwipes();
  checkUrlParams();
  setupModalBackdropCloses();
});

// Resilient Image Fallback: Automatically falls back between public/images, images, and assets/images
function initImageResilience() {
  document.addEventListener("error", (e) => {
    if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === "img") {
      const img = e.target;
      const src = img.getAttribute("src") || img.src;
      if (!img.dataset.fallbackCount) {
        img.dataset.fallbackCount = "1";
        if (src.includes("public/images/")) {
          img.src = src.replace("public/images/", "images/");
        } else if (src.includes("assets/images/")) {
          img.src = src.replace("assets/images/", "public/images/");
        } else if (src.includes("/images/")) {
          img.src = src.replace("/images/", "public/images/");
        }
      } else if (img.dataset.fallbackCount === "1") {
        img.dataset.fallbackCount = "2";
        if (img.src.includes("images/")) {
          img.src = img.src.replace("images/", "assets/images/");
        }
      }
    }
  }, true);
}

// Render Rooms & Spaces (No booking buttons, no room selector)
function renderRooms() {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  container.innerHTML = kunjaData.rooms.map(room => `
    <article class="room-card" id="room-${room.id}">
      <div class="room-carousel" data-room-id="${room.id}">
        <span class="room-occupancy-badge">👥 ${room.occupancyTag}</span>
        ${room.images.map((img, idx) => `
          <img src="${img}" alt="${room.name} interior view ${idx + 1} at Kunja Homestay Bolpur Santiniketan" class="${idx === 0 ? 'active' : ''}" loading="lazy">
        `).join("")}
        <div class="room-carousel-nav">
          <button class="room-carousel-btn" aria-label="Previous image" onclick="cycleRoomPhoto('${room.id}', -1)">❮</button>
          <button class="room-carousel-btn" aria-label="Next image" onclick="cycleRoomPhoto('${room.id}', 1)">❯</button>
        </div>
      </div>
      <div class="room-body">
        <h3 class="room-title">${room.name}</h3>
        <p class="room-desc">${room.description}</p>
        <ul class="room-highlights-list">
          ${room.highlights.map(h => `<li class="room-highlight-pill">✓ ${h}</li>`).join("")}
        </ul>
      </div>
    </article>
  `).join("");
}

// Room Photo Cycler
window.cycleRoomPhoto = function(roomId, direction) {
  const carousel = document.querySelector(`.room-carousel[data-room-id="${roomId}"]`);
  if (!carousel) return;

  const images = Array.from(carousel.querySelectorAll("img"));
  const currentIndex = images.findIndex(img => img.classList.contains("active"));
  if (currentIndex === -1) return;

  images[currentIndex].classList.remove("active");
  const nextIndex = (currentIndex + direction + images.length) % images.length;
  images[nextIndex].classList.add("active");
};

// Touch swipe handler for room carousels on Android mobile
function initRoomSwipes() {
  document.querySelectorAll(".room-carousel").forEach(carousel => {
    let touchStartX = 0;
    let touchEndX = 0;
    const roomId = carousel.getAttribute("data-room-id");

    carousel.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          cycleRoomPhoto(roomId, 1);
        } else {
          cycleRoomPhoto(roomId, -1);
        }
      }
    }, { passive: true });
  });
}

// Render Filterable Gallery
function renderGallery(category = "all") {
  const container = document.getElementById("galleryGrid");
  if (!container) return;

  let filtered = kunjaData.gallery;
  if (category === "ambiance") {
    filtered = kunjaData.gallery.filter(i => i.category === "ambiance");
  } else if (category === "rooms") {
    filtered = kunjaData.gallery.filter(i => i.category === "rooms");
  } else if (category === "gatherings") {
    filtered = kunjaData.gallery.filter(i => i.category === "gatherings");
  }

  container.innerHTML = filtered.map(item => `
    <div class="gallery-item" onclick="openLightbox('${item.id}')">
      <img src="${item.image}" alt="${item.caption}" loading="lazy">
      <div class="gallery-overlay-caption">
        <span style="font-size:0.72rem; text-transform:uppercase; color:var(--color-ochre); letter-spacing:0.08em;">${item.category}</span>
        <h4 style="color:#FFF; font-size:1.1rem; font-family:var(--font-serif); margin-top:0.25rem;">${item.title}</h4>
        <p style="font-size:0.82rem; opacity:0.9; margin-top:0.2rem;">${item.caption}</p>
      </div>
    </div>
  `).join("");
}

window.filterGallery = function(category, btnElement) {
  document.querySelectorAll(".gallery-tab-btn").forEach(btn => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  renderGallery(category);
};

// Lightbox with Working Share Features
let currentLightboxPhoto = null;

window.openLightbox = function(photoId) {
  const photo = kunjaData.gallery.find(item => item.id === photoId);
  if (!photo) return;

  currentLightboxPhoto = photo;
  const modal = document.getElementById("lightboxModal");
  const imgEl = document.getElementById("lightboxImage");

  imgEl.src = photo.image;
  imgEl.alt = photo.title;
  document.getElementById("lightboxCategory").textContent = photo.category.toUpperCase();
  document.getElementById("lightboxTitle").textContent = photo.title;
  document.getElementById("lightboxCaption").textContent = photo.caption;

  const nativeBtn = document.getElementById("nativeShareBtn");
  if (nativeBtn) {
    if (navigator.share) {
      nativeBtn.style.display = "inline-flex";
    } else {
      nativeBtn.style.display = "none";
    }
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeLightbox = function() {
  const modal = document.getElementById("lightboxModal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "";
};

// Social Share: Native / More Apps
window.shareCurrentPhoto = async function() {
  if (!currentLightboxPhoto) return;
  const pageUrl = window.location.href.split("?")[0].split("#")[0] + `?moment=${currentLightboxPhoto.id}#moments`;
  const shareData = {
    title: `${currentLightboxPhoto.title} | Kunja Homestay, Bolpur`,
    text: `Take a look at this peaceful moment from Kunja Homestay in Santiniketan: "${currentLightboxPhoto.title}"`,
    url: pageUrl
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast("Shared successfully!");
    } catch (e) {
      if (e.name !== "AbortError") copyShareLink();
    }
  } else {
    copyShareLink();
  }
};

// Social Share: WhatsApp
window.shareWhatsApp = function() {
  if (!currentLightboxPhoto) return;
  const pageUrl = window.location.href.split("?")[0].split("#")[0] + `?moment=${currentLightboxPhoto.id}#moments`;
  const text = encodeURIComponent(`Take a look at this photo from Kunja Homestay, Bolpur (Govt. of West Bengal Recognized): "${currentLightboxPhoto.title}"\n${pageUrl}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
};

// Social Share: SMS / Native Message
window.shareSMS = function() {
  if (!currentLightboxPhoto) return;
  const pageUrl = window.location.href.split("?")[0].split("#")[0] + `?moment=${currentLightboxPhoto.id}#moments`;
  const text = encodeURIComponent(`Take a look at this photo from Kunja Homestay, Bolpur: "${currentLightboxPhoto.title}" — ${pageUrl}`);
  window.location.href = `sms:?body=${text}`;
};

// Social Share: Facebook
window.shareFacebook = function() {
  if (!currentLightboxPhoto) return;
  const pageUrl = encodeURIComponent(window.location.href.split("?")[0].split("#")[0] + `?moment=${currentLightboxPhoto.id}#moments`);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`, "_blank");
};

// Social Share: Copy Link with 2-second "Copied!" feedback
window.copyShareLink = function() {
  if (!currentLightboxPhoto) return;
  const pageUrl = window.location.href.split("?")[0].split("#")[0] + `?moment=${currentLightboxPhoto.id}#moments`;
  const copyBtn = document.getElementById("copyShareBtn");

  const setCopiedState = () => {
    if (copyBtn) {
      const origHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = "✓ Copied!";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.innerHTML = origHtml;
        copyBtn.classList.remove("copied");
      }, 2000);
    }
    showToast("Link copied to clipboard!");
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(pageUrl).then(setCopiedState).catch(() => {
      fallbackCopy(pageUrl, setCopiedState);
    });
  } else {
    fallbackCopy(pageUrl, setCopiedState);
  }
};

function fallbackCopy(text, callback) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    if (callback) callback();
  } catch (err) {
    showToast("Link: " + text);
  }
  document.body.removeChild(ta);
}

// Render Reviews
function renderReviews() {
  const container = document.getElementById("reviewsGrid");
  if (!container) return;

  container.innerHTML = kunjaData.reviews.map(rev => `
    <article class="review-card">
      <h3 class="review-quote-headline">“${rev.quote}”</h3>
      <p class="review-text">${rev.reviewText}</p>
      <div class="review-author-row">
        <div class="review-avatar">${rev.guestName.charAt(0)}</div>
        <div>
          <div style="font-weight:600; font-size:0.92rem; color:var(--color-forest);">${rev.guestName}</div>
          <div style="font-size:0.8rem; color:var(--color-text-muted);">${rev.hometown}</div>
        </div>
      </div>
    </article>
  `).join("");
}

// "Write a Review" Submission Handler
window.submitGuestReview = function(e) {
  e.preventDefault();
  const name = document.getElementById("revGuestName").value.trim();
  const hometown = document.getElementById("revHometown").value.trim();
  const quote = document.getElementById("revQuote").value.trim();
  const text = document.getElementById("revText").value.trim();

  if (!name || !text) {
    alert("Please provide your name and your review.");
    return;
  }

  const newReview = {
    id: "rev-" + Date.now(),
    guestName: name,
    hometown: hometown || "Traveler",
    quote: quote || "A truly memorable and peaceful stay.",
    reviewText: text
  };

  kunjaData.reviews.unshift(newReview);
  renderReviews();
  closeModal("reviewModal");
  e.target.reset();
  showToast("Thank you! Your words have been added to our guestbook.");
};

// "Share Your Memory" Submission Handler
window.submitGuestMemory = function(e) {
  e.preventDefault();
  const author = document.getElementById("memAuthor").value.trim();
  const title = document.getElementById("memTitle").value.trim();
  const caption = document.getElementById("memCaption").value.trim();
  const imgUrl = document.getElementById("memImgUrl").value.trim();

  if (!title || !caption) {
    alert("Please enter a title and a short caption.");
    return;
  }

  const newMoment = {
    id: "gal-" + Date.now(),
    category: "gatherings",
    title: title,
    caption: `${caption} (Shared by ${author || "Guest"})`,
    image: imgUrl || "public/images/photo_16.jpeg"
  };

  kunjaData.gallery.unshift(newMoment);
  renderGallery("all");
  closeModal("memoryModal");
  e.target.reset();
  showToast("Your memory has been added to our gallery!");
};

// "Text Us With Your Details" WhatsApp Message Builder (STRICTLY NO ROOM SELECTION)
window.sendWhatsAppInquiry = function(e) {
  if (e) e.preventDefault();

  const name = document.getElementById("inqGuestName")?.value.trim() || "";
  const occupancy = document.getElementById("inqOccupancy")?.value.trim() || "2 guests";
  const dates = document.getElementById("inqDates")?.value.trim() || "Upcoming weekend";
  const budget = document.getElementById("inqBudget")?.value.trim() || "Standard tariff";
  const notes = document.getElementById("inqNotes")?.value.trim() || "";

  let msg = `Namaskar Kunja Homestay! I would like to inquire about a stay in Santiniketan:\n\n`;
  if (name) msg += `• Name: ${name}\n`;
  msg += `• Occupancy: ${occupancy}\n`;
  msg += `• Preferred Dates: ${dates}\n`;
  msg += `• Approximate Budget: ${budget}\n`;
  if (notes) msg += `• Notes: ${notes}\n`;
  msg += `\nPlease let me know your availability and how we may arrange our visit. Thank you!`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/919064629141?text=${encoded}`, "_blank");
};

// Direct WhatsApp trigger with default message
window.triggerDirectWhatsApp = function() {
  const msg = encodeURIComponent("Namaskar Kunja Homestay! I would like to inquire about staying at your homestay in Bolpur, Santiniketan.");
  window.open(`https://wa.me/919064629141?text=${msg}`, "_blank");
};

// Scroll smoothly to WhatsApp Inquiry section from sticky bar
window.scrollToInquiry = function(e) {
  if (e) e.preventDefault();
  const inqSec = document.getElementById("inquire");
  if (inqSec) {
    inqSec.scrollIntoView({ behavior: "smooth" });
    const firstInput = document.getElementById("inqGuestName");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 650);
    }
  } else {
    window.open("https://wa.me/919064629141", "_blank");
  }
};

// Modal helpers
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
};

window.toggleMobileDrawer = function() {
  const drawer = document.getElementById("mobileDrawer");
  const overlay = document.getElementById("mobileDrawerOverlay");
  if (!drawer || !overlay) return;

  const isOpen = drawer.classList.contains("open");
  if (isOpen) {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  } else {
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
};

// Setup Backdrop & Keyboard Click Closes
function setupModalBackdropCloses() {
  const modals = ["lightboxModal", "govtPlaqueModal", "memoryModal", "reviewModal"];
  modals.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (e) => {
        if (e.target === el) {
          if (id === "lightboxModal") closeLightbox();
          else closeModal(id);
        }
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeLightbox();
      closeModal("govtPlaqueModal");
      closeModal("memoryModal");
      closeModal("reviewModal");
      const drawer = document.getElementById("mobileDrawer");
      if (drawer && drawer.classList.contains("open")) {
        toggleMobileDrawer();
      }
    }
  });
}

// Auto-open moment from URL if query param ?moment=ID exists
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const momentId = params.get("moment");
  if (momentId) {
    setTimeout(() => {
      openLightbox(momentId);
    }, 450);
  }
}

// Toast notification
function showToast(message) {
  let toast = document.getElementById("kunjaToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "kunjaToast";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> ${message}`;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// Scroll reveal
function setupObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));
}
