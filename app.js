/**
 * Kunja Homestay — Bolpur, Santiniketan
 * Client-Side State, Dynamic Rendering & Interactive Handlers
 * Photography is served from the root images/ directory.
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
      plaqueImage: "images/kunja-57.jpeg"
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
        "images/kunja-10.jpeg",
        "images/kunja-11.jpeg",
        "images/kunja-13.jpeg",
        "images/kunja-14.jpeg"
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
        "images/kunja-20.jpeg",
        "images/kunja-22.jpeg",
        "images/kunja-23.jpeg",
        "images/kunja-24.jpeg",
        "images/kunja-26.jpeg",
        "images/kunja-15.jpeg"
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
        "images/kunja-30.jpeg",
        "images/kunja-42.jpeg",
        "images/kunja-51.jpeg",
        "images/kunja-55.jpeg",
        "images/kunja-43.jpeg",
        "images/kunja-27.jpeg"
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
        "images/kunja-37.jpeg",
        "images/kunja-38.jpeg",
        "images/kunja-41.jpeg",
        "images/kunja-44.jpeg",
        "images/kunja-48.jpeg",
        "images/kunja-54.jpeg"
      ]
    }
  ],

  gallery: [
    {
      id: "gal-01",
      category: "ambiance",
      title: "Golden night ambiance in the open courtyard",
      caption: "Kunja Homestay glowing warmly under the evening sky with garden umbrellas and bonfire lawn.",
      image: "images/kunja-34.jpeg"
    },
    {
      id: "gal-02",
      category: "gatherings",
      title: "Weekend smiles and family gatherings",
      caption: "Guests gathered under our front entrance lodge sign, enjoying unhurried conversations.",
      image: "images/kunja-36.jpeg"
    },
    {
      id: "gal-03",
      category: "rooms",
      title: "Traditional Santiniketan Kantha folk art bedspread",
      caption: "Handcrafted tribal musician motifs adorning the comfortable beds in the Garden Wing.",
      image: "images/kunja-37.jpeg"
    },
    {
      id: "gal-04",
      category: "ambiance",
      title: "Courtyard stone path and blooming flower pots",
      caption: "Lush potted marigolds, petunias, and green foliage lining the pathway in the morning sun.",
      image: "images/kunja-56.jpeg"
    },
    {
      id: "gal-05",
      category: "gatherings",
      title: "Happy family moments on the garden lawn",
      caption: "Multigenerational travelers pausing for a cheerful photograph during morning tea.",
      image: "images/kunja-17.jpeg"
    },
    {
      id: "gal-06",
      category: "gatherings",
      title: "Warm smiles by the garden petunias",
      caption: "A joyful guest enjoying the peaceful floral courtyard in traditional attire.",
      image: "images/kunja-60.jpeg"
    },
    {
      id: "gal-07",
      category: "ambiance",
      title: "Authentic home-cooked Bengali thali feast",
      caption: "Freshly prepared rice, comforting dal, and seasonal vegetables served hot at our dining table.",
      image: "images/kunja-58.jpeg"
    },
    {
      id: "gal-08",
      category: "rooms",
      title: "Sunlit room with morning garden breeze",
      caption: "Natural daylight pouring into the Verandah suite, equipped with an electric kettle and tea station.",
      image: "images/kunja-20.jpeg"
    },
    {
      id: "gal-09",
      category: "gatherings",
      title: "Gentle courtyard visitors & pet companions",
      caption: "Guest relaxing peacefully in an outdoor garden chair holding friendly pet rabbits.",
      image: "images/kunja-64.jpeg"
    },
    {
      id: "gal-10",
      category: "ambiance",
      title: "Bright magenta Bougainvillea blossoms",
      caption: "Colorful flora blooming all year round along the courtyard garden borders.",
      image: "images/kunja-01.jpeg"
    },
    {
      id: "gal-11",
      category: "rooms",
      title: "Clean and spacious family room layout",
      caption: "Multi-bed sleeping arrangements ideal for families visiting Bolpur together.",
      image: "images/kunja-30.jpeg"
    },
    {
      id: "gal-12",
      category: "gatherings",
      title: "Group travelers arriving in Santiniketan",
      caption: "Happy guests pausing for a photo beside their traveler van before exploring Khoai.",
      image: "images/kunja-21.jpeg"
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

let activePropertyId = "all";

// UI Controller on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  // Fetch fresh kunjaData.json with cache busting to reflect real-time owner updates
  fetchKunjaDataAndInit();
  // Privacy-friendly visitor hit logging for owner analytics
  recordVisitorHit();
});

// Privacy-Friendly Visitor Hit Counter
function recordVisitorHit() {
  try {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(navigator.userAgent);
    const deviceType = isTablet ? "Tablet" : (isMobile ? "Mobile" : "Desktop");

    fetch("api/analytics.php?action=track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referrer: document.referrer || "Direct",
        page: window.location.pathname || "/",
        device: deviceType
      }),
      keepalive: true
    }).catch(() => {});
  } catch (e) {}
}

async function fetchKunjaDataAndInit() {
  try {
    const response = await fetch(`kunjaData.json?v=${Date.now()}`, { cache: "no-store" });
    if (response.ok) {
      const remoteData = await response.json();
      if (remoteData && typeof remoteData === "object") {
        Object.assign(kunjaData, remoteData);
      }
    }
  } catch (err) {
    console.warn("Using embedded fallback data for Kunja Homestay:", err);
  }

  // Sync certificate image in government modal
  updateCertificateModalImage();

  // Render Three-Stage Notices (Center Modal + Top Banner + Bottom Banner)
  renderThreeStageNotices();

  // Initialize Hero Multi-Image Showcase Slideshow
  initHeroSlideshow();

  // Render Two Properties & Rooms
  renderPropertiesShowcase();
  renderRooms();
  initAutoRoomSlideshows();

  renderGallery("all");
  renderReviews();
  renderGoogleReviewSection();

  setupObserver();
  initParallaxScroll();
  initRoomSwipes();
  checkUrlParams();
  setupModalBackdropCloses();
}

// Government Recognition Plaque / Certificate Image Sync
function updateCertificateModalImage() {
  const certImg = document.getElementById("govtCertificateImg");
  if (!certImg) return;
  const imageSrc = kunjaData.siteConfig?.recognition?.certificateImage || 
                   kunjaData.siteConfig?.recognition?.plaqueImage || 
                   "images/certificates/kunja-57.jpeg";
  certImg.src = imageSrc;
}

// Three-Stage Maintenance / Notice System with Running Marquee & Media Support
function renderThreeStageNotices() {
  if (!kunjaData.noticeBanner || !kunjaData.noticeBanner.enabled) {
    hideAllNotices();
    return;
  }

  const nb = kunjaData.noticeBanner;
  const now = new Date();

  // Check if notice has expired
  if (nb.toDateTime) {
    const to = new Date(nb.toDateTime);
    if (now > to) {
      hideAllNotices();
      return;
    }
  }

  const formatDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return isoStr;
    }
  };

  let timeText = "";
  if (nb.fromDateTime && nb.toDateTime) {
    timeText = `📅 Scheduled: ${formatDate(nb.fromDateTime)} to ${formatDate(nb.toDateTime)}`;
  } else if (nb.toDateTime) {
    timeText = `📅 Reopening expected on ${formatDate(nb.toDateTime)}`;
  } else if (nb.fromDateTime) {
    timeText = `📅 Effective from ${formatDate(nb.fromDateTime)}`;
  }

  const title = nb.title || "Homestay Notice";
  const message = nb.message || "";
  const mediaSrc = nb.bannerMedia || nb.image || "";

  // 1. Center-Screen Modal on Initial Load (Dismissible per session)
  const centerModal = document.getElementById("noticeCenterModal");
  const isDismissed = sessionStorage.getItem("kunja_notice_dismissed");

  if (centerModal && !isDismissed) {
    const centerTitle = document.getElementById("centerNoticeTitle");
    const centerMsg = document.getElementById("centerNoticeMessage");
    const centerDates = document.getElementById("centerNoticeDates");
    const centerMediaWrap = document.getElementById("centerNoticeMediaWrap");
    const centerMedia = document.getElementById("centerNoticeMedia");

    if (centerTitle) centerTitle.textContent = title;
    if (centerMsg) centerMsg.textContent = message;
    if (centerDates) {
      centerDates.textContent = timeText;
      centerDates.style.display = timeText ? "inline-block" : "none";
    }
    if (centerMediaWrap && centerMedia) {
      if (mediaSrc) {
        centerMedia.src = mediaSrc;
        centerMediaWrap.style.display = "flex";
      } else {
        centerMediaWrap.style.display = "none";
      }
    }
    centerModal.style.display = "flex";
    centerModal.classList.add("active");
  }

  // Helper to build marquee repeated content (duplicated 8 times for smooth infinite loop)
  const buildMarqueeItem = () => `
    <div class="marquee-item">
      <span class="marquee-badge">📢 ${title}</span>
      ${mediaSrc ? `<img src="${mediaSrc}" alt="Notice graphic" class="marquee-media-img">` : ''}
      <span>${message}</span>
      ${timeText ? `<span style="opacity: 0.85; font-size: 0.85em;">(${timeText})</span>` : ''}
      <span class="marquee-separator">•</span>
    </div>
  `;
  const marqueeHtml = Array(8).fill(buildMarqueeItem()).join("");

  // 2. Top Notice Banner (Running Right to Left Marquee)
  const topBanner = document.getElementById("homestayNoticeBanner");
  const topTrack = document.getElementById("topMarqueeTrack");
  if (topBanner && topTrack) {
    topTrack.innerHTML = marqueeHtml;
    topBanner.style.display = "block";
  }

  // 3. End-of-Website Notice Banner (Running Right to Left Marquee)
  const bottomBanner = document.getElementById("homestayNoticeBannerBottom");
  const bottomTrack = document.getElementById("bottomMarqueeTrack");
  if (bottomBanner && bottomTrack) {
    bottomTrack.innerHTML = marqueeHtml;
    bottomBanner.style.display = "block";
  }
}

window.dismissCenterNotice = function() {
  const modal = document.getElementById("noticeCenterModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("active");
  }
  sessionStorage.setItem("kunja_notice_dismissed", "true");
};

function hideAllNotices() {
  const centerModal = document.getElementById("noticeCenterModal");
  const topBanner = document.getElementById("homestayNoticeBanner");
  const bottomBanner = document.getElementById("homestayNoticeBannerBottom");

  if (centerModal) centerModal.style.display = "none";
  if (topBanner) topBanner.style.display = "none";
  if (bottomBanner) bottomBanner.style.display = "none";
}

// Two Properties Showcase Renderer
function renderPropertiesShowcase() {
  const container = document.getElementById("propertiesShowcase");
  const navContainer = document.getElementById("propertyFilterNav");
  if (!container) return;

  const properties = kunjaData.properties || [];
  if (properties.length === 0) {
    container.style.display = "none";
    if (navContainer) navContainer.style.display = "none";
    return;
  }

  container.innerHTML = properties.map(prop => {
    const roomCount = prop.rooms ? prop.rooms.length : 0;
    const isActive = activePropertyId === prop.id;
    return `
      <article class="property-card ${isActive ? 'active' : ''}" onclick="selectProperty('${prop.id}')" tabindex="0" role="button" aria-label="Explore ${prop.name}">
        <div class="property-card-cover">
          <img src="${prop.coverImage || 'images/kunja-34.jpeg'}" alt="${prop.name} exterior at Kunja Homestay" loading="lazy">
          <div class="property-overlay-cta">
            <span class="property-overlay-text">Explore This →</span>
            <span class="property-overlay-sub">${roomCount} Homestay Suite${roomCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div class="property-card-body">
          <span class="property-location-tag">${prop.locationNote || 'Bolpur, Santiniketan'}</span>
          <h3 class="property-title">${prop.name}</h3>
          <p class="property-desc">${prop.description || ''}</p>
          <div class="property-active-badge">
            <span>${isActive ? '✓ Currently Viewing Rooms' : 'Click to View Suites →'}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  if (navContainer) {
    navContainer.innerHTML = `
      <button class="property-filter-btn ${activePropertyId === 'all' ? 'active' : ''}" onclick="selectProperty('all')">
        All Rooms (${getAllRooms().length})
      </button>
      ${properties.map(p => `
        <button class="property-filter-btn ${activePropertyId === p.id ? 'active' : ''}" onclick="selectProperty('${p.id}')">
          ${p.name.split('—')[1]?.trim() || p.name} (${p.rooms ? p.rooms.length : 0})
        </button>
      `).join("")}
    `;
  }
}

window.selectProperty = function(propertyId) {
  activePropertyId = propertyId;
  renderPropertiesShowcase();
  renderRooms();
  initAutoRoomSlideshows();
  initRoomSwipes();

  // Smooth scroll down to rooms grid
  const roomsEl = document.getElementById("roomsContainer");
  if (roomsEl && propertyId !== "all") {
    roomsEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

function getAllRooms() {
  if (kunjaData.properties && kunjaData.properties.length > 0) {
    let all = [];
    kunjaData.properties.forEach(p => {
      if (p.rooms) all = all.concat(p.rooms);
    });
    return all;
  }
  return kunjaData.rooms || [];
}

// Render Rooms & Spaces Filtered by Active Property
function renderRooms() {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  let roomsToRender = [];
  if (activePropertyId === "all") {
    roomsToRender = getAllRooms();
  } else {
    const foundProp = (kunjaData.properties || []).find(p => p.id === activePropertyId);
    roomsToRender = foundProp && foundProp.rooms ? foundProp.rooms : [];
  }

  if (roomsToRender.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--color-text-muted);">No room suites currently listed in this section.</div>`;
    return;
  }

  container.innerHTML = roomsToRender.map(room => `
    <article class="room-card" id="room-${room.id}">
      <div class="room-carousel" data-room-id="${room.id}">
        <span class="room-occupancy-badge">👥 ${room.occupancyTag}</span>
        ${room.images.map((img, idx) => `
          <div class="room-slide-frame ${idx === 0 ? 'active' : ''}" onclick="openImageInLightbox('${img}', '${room.name}', '${room.name} — Kunja Homestay Bolpur')">
            <img src="${img}" alt="${room.name} interior view ${idx + 1} at Kunja Homestay Bolpur Santiniketan" loading="lazy">
          </div>
        `).join("")}
        <div class="room-carousel-nav">
          <button class="room-carousel-btn" aria-label="Previous image" onclick="cycleRoomPhoto('${room.id}', -1, event)">❮</button>
          <button class="room-carousel-btn" aria-label="Next image" onclick="cycleRoomPhoto('${room.id}', 1, event)">❯</button>
        </div>
      </div>
      <div class="room-body">
        <h3 class="room-title">${room.name}</h3>
        ${room.nightlyPrice ? `
          <div class="room-price-row">
            <span class="room-nightly-price">${room.nightlyPrice}</span>
            ${room.seasonLabel ? `<span class="room-season-badge">${room.seasonLabel}</span>` : ''}
          </div>
        ` : ''}
        <p class="room-desc">${room.description}</p>
        <ul class="room-highlights-list">
          ${room.highlights.map(h => `<li class="room-highlight-pill">✓ ${h}</li>`).join("")}
        </ul>
      </div>
    </article>
  `).join("");
}

// Room Photo Cycler
window.cycleRoomPhoto = function(roomId, direction, e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const carousel = document.querySelector(`.room-carousel[data-room-id="${roomId}"]`);
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll(".room-slide-frame"));
  if (slides.length <= 1) return;
  let currentIndex = slides.findIndex(slide => slide.classList.contains("active"));
  if (currentIndex === -1) currentIndex = 0;

  slides[currentIndex].classList.remove("active");
  const nextIndex = (currentIndex + direction + slides.length) % slides.length;
  slides[nextIndex].classList.add("active");
};

// Open standalone image directly in Lightbox
window.openImageInLightbox = function(src, title, caption) {
  const modal = document.getElementById("lightboxModal");
  const imgEl = document.getElementById("lightboxImage");
  if (!modal || !imgEl) return;

  currentLightboxPhoto = {
    id: "custom-" + Date.now(),
    title: title || "Kunja Homestay, Bolpur",
    caption: caption || "Homestay experience in Santiniketan",
    category: "homestay",
    image: src
  };

  imgEl.src = src;
  imgEl.alt = currentLightboxPhoto.title;
  document.getElementById("lightboxCategory").textContent = "MOMENT";
  document.getElementById("lightboxTitle").textContent = currentLightboxPhoto.title;
  document.getElementById("lightboxCaption").textContent = currentLightboxPhoto.caption;

  const nativeBtn = document.getElementById("nativeShareBtn");
  if (nativeBtn) {
    nativeBtn.style.display = navigator.share ? "inline-flex" : "none";
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

// Automatic Room Image Slideshows for All Room Cards
let roomAutoSlideTimers = [];
function initAutoRoomSlideshows() {
  // Clear any existing intervals
  roomAutoSlideTimers.forEach(t => clearInterval(t));
  roomAutoSlideTimers = [];

  document.querySelectorAll(".room-carousel").forEach(carousel => {
    const roomId = carousel.getAttribute("data-room-id");
    const slides = carousel.querySelectorAll(".room-slide-frame");
    if (!roomId || slides.length <= 1) return;

    let timer = setInterval(() => {
      cycleRoomPhoto(roomId, 1);
    }, 3500);

    // Pause on hover or touch
    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", () => {
      clearInterval(timer);
      timer = setInterval(() => cycleRoomPhoto(roomId, 1), 3500);
    });
    carousel.addEventListener("touchstart", () => clearInterval(timer), { passive: true });
    carousel.addEventListener("touchend", () => {
      clearInterval(timer);
      timer = setInterval(() => cycleRoomPhoto(roomId, 1), 3500);
    }, { passive: true });

    roomAutoSlideTimers.push(timer);
  });
}

// Hero Right-Side Multi-Image Slideshow with Smooth Crossfade & Ken Burns
let heroSlideIndex = 0;
let heroSlideTimer = null;
let heroImagesList = [];

function initHeroSlideshow() {
  const wrapper = document.getElementById("heroSlidesWrapper");
  const dotsContainer = document.getElementById("heroDots");
  if (!wrapper) return;

  heroImagesList = kunjaData.siteConfig?.heroImages || [
    {
      src: "images/kunja-34.jpeg",
      caption: "Kunja Homestay Courtyard • Evening ambiance under the quiet Bolpur sky",
      alt: "Kunja Homestay courtyard at night with warm lights and garden lawn"
    },
    {
      src: "images/kunja-56.jpeg",
      caption: "Garden Wing & Verandahs • Fresh air and green surroundings",
      alt: "Kunja Homestay Garden Wing and open lawn"
    },
    {
      src: "images/kunja-35.jpeg",
      caption: "Serene Morning Light • Peaceful garden pathways and seating",
      alt: "Morning atmosphere at Kunja Homestay"
    },
    {
      src: "images/kunja-58.jpeg",
      caption: "Santiniketan Hospitality • Authentic home-cooked meals and tranquil stays",
      alt: "Courtyard pathway and architecture at Kunja Homestay"
    }
  ];

  if (heroImagesList.length === 0) return;

  // Render slides
  wrapper.innerHTML = heroImagesList.map((item, idx) => `
    <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
      <img src="${item.src}" alt="${item.alt || 'Kunja Homestay photograph'}" loading="${idx === 0 ? 'eager' : 'lazy'}">
      <div class="hero-overlay-tag">
        ${item.caption || '<strong>Kunja Homestay</strong> • Bolpur, Santiniketan'}
      </div>
    </div>
  `).join("");

  // Render dots
  if (dotsContainer) {
    dotsContainer.innerHTML = heroImagesList.map((_, idx) => `
      <button class="hero-dot ${idx === 0 ? 'active' : ''}" onclick="goToHeroSlide(${idx})" aria-label="Go to hero slide ${idx + 1}"></button>
    `).join("");
  }

  heroSlideIndex = 0;
  startHeroTimer();

  // Pause on hover
  const container = document.getElementById("heroSlideshow");
  if (container) {
    container.addEventListener("mouseenter", () => clearInterval(heroSlideTimer));
    container.addEventListener("mouseleave", () => startHeroTimer());
    container.addEventListener("touchstart", () => clearInterval(heroSlideTimer), { passive: true });
    container.addEventListener("touchend", () => startHeroTimer(), { passive: true });
  }
}

function startHeroTimer() {
  clearInterval(heroSlideTimer);
  heroSlideTimer = setInterval(() => {
    nextHeroSlide();
  }, 4000);
}

window.nextHeroSlide = function() {
  if (heroImagesList.length <= 1) return;
  goToHeroSlide((heroSlideIndex + 1) % heroImagesList.length);
};

window.prevHeroSlide = function() {
  if (heroImagesList.length <= 1) return;
  goToHeroSlide((heroSlideIndex - 1 + heroImagesList.length) % heroImagesList.length);
};

window.goToHeroSlide = function(idx) {
  heroSlideIndex = idx;
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");

  slides.forEach((s, i) => {
    s.classList.toggle("active", i === idx);
  });
  dots.forEach((d, i) => {
    d.classList.toggle("active", i === idx);
  });
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

// Render Reviews (Only approved === true, sorted highest star rating first, with Owner Replies)
function renderReviews() {
  const container = document.getElementById("reviewsGrid");
  if (!container) return;

  const approvedReviews = (kunjaData.reviews || [])
    .filter(r => r.approved === true)
    .sort((a, b) => {
      const rDiff = (Number(b.rating) || 5) - (Number(a.rating) || 5);
      if (rDiff !== 0) return rDiff;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      return tB - tA;
    });

  if (approvedReviews.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-text-muted);">No guest reviews published yet. Be the first to share your stay experience below!</div>`;
    return;
  }

  container.innerHTML = approvedReviews.map(rev => {
    const starsCount = Math.min(5, Math.max(1, Number(rev.rating) || 5));
    const starsHtml = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);
    const subLabel = rev.property || rev.hometown || "Kunja Homestay Guest";
    return `
      <article class="review-card reveal-on-scroll is-visible">
        <div style="color: #F59E0B; font-size: 1.05rem; letter-spacing: 2px; margin-bottom: 0.5rem;" aria-label="${starsCount} out of 5 stars">${starsHtml}</div>
        ${rev.quote ? `<h3 class="review-quote-headline">“${rev.quote}”</h3>` : ''}
        <p class="review-text">${rev.reviewText}</p>
        <div class="review-author-row">
          <div class="review-avatar">${(rev.guestName || 'G').charAt(0).toUpperCase()}</div>
          <div>
            <div style="font-weight:600; font-size:0.92rem; color:var(--color-forest);">${rev.guestName}</div>
            <div style="font-size:0.8rem; color:var(--color-text-muted);">${subLabel}</div>
          </div>
        </div>
        ${rev.adminReply && rev.adminReply.trim() ? `
          <div class="review-admin-reply">
            <span class="review-admin-reply-label">🏡 Response from Kunja Homestay</span>
            <div>${rev.adminReply}</div>
          </div>
        ` : ''}
      </article>
    `;
  }).join("");
}

// Public Review Form: Star Rating Selector
window.setPublicReviewRating = function(val) {
  const ratingInput = document.getElementById("pubRevRating");
  const label = document.getElementById("pubRevRatingLabel");
  if (ratingInput) ratingInput.value = val;
  if (label) label.textContent = `${val} / 5 Star${val > 1 ? 's' : ''}`;

  document.querySelectorAll("#pubRevStarSelector .star-select-btn").forEach(btn => {
    const bVal = Number(btn.getAttribute("data-val"));
    btn.classList.toggle("active", bVal <= val);
  });
};

// Public Review Form: Submit to api/submit-review.php
window.submitPublicReview = async function(e) {
  e.preventDefault();
  const btn = document.getElementById("pubRevSubmitBtn");
  const feedback = document.getElementById("pubRevFeedback");
  const guestName = document.getElementById("pubRevName").value.trim();
  const property = document.getElementById("pubRevProperty").value;
  const rating = Number(document.getElementById("pubRevRating").value) || 5;
  const reviewText = document.getElementById("pubRevText").value.trim();
  const website = document.getElementById("revHoneypot").value;

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Submitting...";
  }
  if (feedback) feedback.style.display = "none";

  try {
    const res = await fetch("api/submit-review.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestName, property, rating, reviewText, website })
    });
    const json = await res.json();
    if (feedback) {
      feedback.style.display = "block";
      if (res.ok && json.success) {
        feedback.style.background = "#ECFDF5";
        feedback.style.border = "1px solid #A7F3D0";
        feedback.style.color = "#065F46";
        feedback.textContent = json.message || "Thank you! Your review has been submitted and will appear once approved by our team.";
        document.getElementById("publicReviewForm").reset();
        setPublicReviewRating(5);
      } else {
        feedback.style.background = "#FEF2F2";
        feedback.style.border = "1px solid #FCA5A5";
        feedback.style.color = "#991B1B";
        feedback.textContent = json.error || "Could not submit review. Please check your details.";
      }
    }
  } catch (err) {
    if (feedback) {
      feedback.style.display = "block";
      feedback.style.background = "#FEF2F2";
      feedback.style.border = "1px solid #FCA5A5";
      feedback.style.color = "#991B1B";
      feedback.textContent = "Network error submitting review. Please try again.";
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Submit Review";
    }
  }
};

// Render Google Review Card Link (QR Removed)
function renderGoogleReviewSection() {
  const reviewLink = document.getElementById("googleReviewLink");

  const targetUrl = kunjaData.contact?.googleReviewUrl || 
                    "https://www.google.com/travel/search?gsas=1&ts=CAESABorCg0SCwoJL20vMDcxcmo5EhoSFAoHCOoPEAsYHBIHCOoPEAsYHRgBMgIIACoHCgU6A0lOUg&qs=MidDaGtJbktYTXJ2XzR5ZGdtR2cwdlp5OHhNV2hrZURFeFl6UXhFQUVIAA&ap=KigKEgm2PWILgKw3QBFWFcaIUetVQBISCYjyg9WqrTdAEVYVRlKP61VAMAC6AQdyZXZpZXdz&sa=X&hl=en-IN&gl=in&g2lb=4965990%2C72471280%2C72573224%2C72686036%2C72803964%2C72882230%2C73064764%2C121529350%2C121608706%2C121921501%2C121951222%2C122035346%2C122078727%2C122093076%2C122097177%2C122134888%2C122147525%2C122275263%2C122275264&ved=0CAAQ5JsGahcKEwi407Xej5-YAxUAAAAAHQAAAAAQAw";

  if (reviewLink) {
    reviewLink.href = targetUrl;
  }
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
    image: imgUrl || "images/kunja-16.jpeg"
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


// Smooth GPU-Accelerated Parallax on Hero & Mandir Visuals (Disabled on Touch / Reduced Motion)
function initParallaxScroll() {
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (prefersReduced || isTouch) return;

  const targets = document.querySelectorAll(".parallax-target");
  if (!targets.length) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        targets.forEach(el => {
          const speed = parseFloat(el.getAttribute("data-parallax-speed")) || 0.05;
          const rect = el.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const offset = (rect.top - window.innerHeight / 2) * speed;
            el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
