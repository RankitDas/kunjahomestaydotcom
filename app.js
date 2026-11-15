/**
 * Kunja Homestay — Bolpur, Santiniketan
 * Client-Side State, Dynamic Rendering & Interactive Handlers
 * All photography loaded directly from real local assets (/assets/images/)
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
      plaqueImage: "assets/images/photo_57.jpeg"
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
        "assets/images/photo_10.jpeg",
        "assets/images/photo_11.jpeg",
        "assets/images/photo_13.jpeg",
        "assets/images/photo_14.jpeg"
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
        "assets/images/photo_20.jpeg",
        "assets/images/photo_22.jpeg",
        "assets/images/photo_23.jpeg",
        "assets/images/photo_24.jpeg",
        "assets/images/photo_26.jpeg",
        "assets/images/photo_15.jpeg"
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
        "assets/images/photo_30.jpeg",
        "assets/images/photo_42.jpeg",
        "assets/images/photo_51.jpeg",
        "assets/images/photo_55.jpeg",
        "assets/images/photo_43.jpeg",
        "assets/images/photo_27.jpeg"
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
        "assets/images/photo_37.jpeg",
        "assets/images/photo_38.jpeg",
        "assets/images/photo_41.jpeg",
        "assets/images/photo_44.jpeg",
        "assets/images/photo_48.jpeg",
        "assets/images/photo_54.jpeg"
      ]
    }
  ],

  gallery: [
    {
      id: "gal-01",
      category: "ambiance",
      title: "Golden night ambiance in the open courtyard",
      caption: "Kunja Homestay glowing warmly under the evening sky with garden umbrellas and bonfire lawn.",
      image: "assets/images/photo_34.jpeg"
    },
    {
      id: "gal-02",
      category: "gatherings",
      title: "Weekend smiles and family gatherings",
      caption: "Guests gathered under our front entrance lodge sign, enjoying unhurried conversations.",
      image: "assets/images/photo_36.jpeg"
    },
    {
      id: "gal-03",
      category: "rooms",
      title: "Traditional Santiniketan Kantha folk art bedspread",
      caption: "Handcrafted tribal musician motifs adorning the comfortable beds in the Garden Wing.",
      image: "assets/images/photo_37.jpeg"
    },
    {
      id: "gal-04",
      category: "ambiance",
      title: "Courtyard stone path and blooming flower pots",
      caption: "Lush potted marigolds, petunias, and green foliage lining the pathway in the morning sun.",
      image: "assets/images/photo_56.jpeg"
    },
    {
      id: "gal-05",
      category: "gatherings",
      title: "Happy family moments on the garden lawn",
      caption: "Multigenerational travelers pausing for a cheerful photograph during morning tea.",
      image: "assets/images/photo_17.jpeg"
    },
    {
      id: "gal-06",
      category: "gatherings",
      title: "Warm smiles by the garden petunias",
      caption: "A joyful guest enjoying the peaceful floral courtyard in traditional attire.",
      image: "assets/images/photo_60.jpeg"
    },
    {
      id: "gal-07",
      category: "ambiance",
      title: "Authentic home-cooked Bengali thali feast",
      caption: "Freshly prepared rice, comforting dal, and seasonal vegetables served hot at our dining table.",
      image: "assets/images/photo_58.jpeg"
    },
    {
      id: "gal-08",
      category: "rooms",
      title: "Sunlit room with morning garden breeze",
      caption: "Natural daylight pouring into the Verandah suite, equipped with an electric kettle and tea station.",
      image: "assets/images/photo_20.jpeg"
    },
    {
      id: "gal-09",
      category: "gatherings",
      title: "Gentle courtyard visitors & pet companions",
      caption: "Guest relaxing peacefully in an outdoor garden chair holding friendly pet rabbits.",
      image: "assets/images/photo_64.jpeg"
    },
    {
      id: "gal-10",
      category: "ambiance",
      title: "Bright magenta Bougainvillea blossoms",
      caption: "Colorful flora blooming all year round along the courtyard garden borders.",
      image: "assets/images/photo_01.jpeg"
    },
    {
      id: "gal-11",
      category: "rooms",
      title: "Clean and spacious family room layout",
      caption: "Multi-bed sleeping arrangements ideal for families visiting Bolpur together.",
      image: "assets/images/photo_30.jpeg"
    },
    {
      id: "gal-12",
      category: "gatherings",
      title: "Group travelers arriving in Santiniketan",
      caption: "Happy guests pausing for a photo beside their traveler van before exploring Khoai.",
      image: "assets/images/photo_21.jpeg"
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
  renderRooms();
  renderGallery("all");
  renderReviews();
  setupObserver();
});

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
  document.getElementById("lightboxImage").src = photo.image;
  document.getElementById("lightboxImage").alt = photo.title;
  document.getElementById("lightboxCategory").textContent = photo.category.toUpperCase();
  document.getElementById("lightboxTitle").textContent = photo.title;
  document.getElementById("lightboxCaption").textContent = photo.caption;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeLightbox = function() {
  document.getElementById("lightboxModal").classList.remove("active");
  document.body.style.overflow = "";
};

window.shareCurrentPhoto = async function() {
  if (!currentLightboxPhoto) return;
  const shareData = {
    title: `${currentLightboxPhoto.title} | Kunja Homestay, Bolpur, Santiniketan`,
    text: `Take a look at this cozy moment from Kunja Homestay in Santiniketan: "${currentLightboxPhoto.title}"`,
    url: window.location.href.split("#")[0] + `?moment=${currentLightboxPhoto.id}#gallery`
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

window.shareWhatsApp = function() {
  if (!currentLightboxPhoto) return;
  const url = encodeURIComponent(window.location.href.split("#")[0] + `?moment=${currentLightboxPhoto.id}#gallery`);
  const text = encodeURIComponent(`Take a look at this peaceful moment from Kunja Homestay, Bolpur (Govt. of West Bengal Recognized): ${currentLightboxPhoto.title} `);
  window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, "_blank");
};

window.shareFacebook = function() {
  if (!currentLightboxPhoto) return;
  const url = encodeURIComponent(window.location.href.split("#")[0] + `?moment=${currentLightboxPhoto.id}#gallery`);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
};

window.copyShareLink = function() {
  if (!currentLightboxPhoto) return;
  const url = window.location.href.split("#")[0] + `?moment=${currentLightboxPhoto.id}#gallery`;
  navigator.clipboard.writeText(url).then(() => {
    showToast("Link copied to clipboard!");
  }).catch(() => {
    showToast("Link: " + url);
  });
};

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
    image: imgUrl || "assets/images/photo_16.jpeg"
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
