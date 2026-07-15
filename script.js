const siteNav = document.querySelector(".site-nav");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");
const closeButton = document.querySelector(".lightbox-close");
const prevButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");
const mobileCount = document.querySelector(".lightbox-count");
const groupNextButton = document.querySelector(".lightbox-group-next");
const galleryButtons = [...document.querySelectorAll(".photo-button")];
const workCards = [...document.querySelectorAll(".work-card")];
const visibleWorkCards = workCards.filter((card) => !card.classList.contains("work-card-hidden"));
const workToggles = [...document.querySelectorAll(".work-toggle")];
const infoBlock = document.querySelector(".info-block");
const homeSection = document.querySelector(".home-index");
const overviewSection = document.querySelector(".work-overview");
const imageSections = [...document.querySelectorAll(".image-sequence")];
let activeImageIndex = 0;
let activeGallery = galleryButtons;
let activeGroupIndex = 0;
let activeGroups = [{ items: galleryButtons }];
let touchStartX = 0;
let touchStartY = 0;
let lightboxImageLoadToken = 0;
const preloadedLightboxSources = new Set();

function updateLightboxMetrics() {
  if (lightbox.hidden || !lightboxImage.complete || !lightboxImage.naturalWidth) {
    return;
  }

  requestAnimationFrame(() => {
    const imageRect = lightboxImage.getBoundingClientRect();

    if (!imageRect.width) {
      return;
    }

    lightbox.style.setProperty("--lightbox-image-left", `${imageRect.left}px`);
    lightbox.style.setProperty("--lightbox-image-width", `${imageRect.width}px`);
    lightbox.style.setProperty("--lightbox-image-right", `${window.innerWidth - imageRect.right}px`);
  });
}

function updateLightboxImageOrientation() {
  const isLandscape = lightboxImage.naturalWidth >= lightboxImage.naturalHeight;
  lightbox.classList.toggle("lightbox-landscape", isLandscape);
  lightbox.classList.toggle("lightbox-portrait", !isLandscape);
  updateLightboxMetrics();
}

function getLightboxImageSource(item) {
  const image = item?.querySelector("img");
  return image ? image.dataset.fullSrc || image.src : "";
}

function preloadLightboxImage(index) {
  if (activeGallery.length <= 1) {
    return;
  }

  const item = activeGallery[(index + activeGallery.length) % activeGallery.length];
  const src = getLightboxImageSource(item);

  if (!src || preloadedLightboxSources.has(src)) {
    return;
  }

  preloadedLightboxSources.add(src);
  const preload = new Image();
  preload.decoding = "async";
  preload.src = src;
}

function preloadNearbyLightboxImages() {
  preloadLightboxImage(activeImageIndex - 1);
  preloadLightboxImage(activeImageIndex + 1);
}

function setWorkCardImageFit(card) {
  const image = card.querySelector("img");

  if (!image || !image.naturalWidth || !image.naturalHeight) {
    return;
  }

  card.classList.toggle("work-card-landscape", image.naturalWidth > image.naturalHeight);
}

workCards.forEach((card) => {
  const image = card.querySelector("img");

  if (!image) {
    return;
  }

  if (image.complete) {
    setWorkCardImageFit(card);
  } else {
    image.addEventListener("load", () => setWorkCardImageFit(card), { once: true });
  }
});

function hideImages() {
  imageSections.forEach((section) => {
    section.hidden = true;
  });
}

function setPageView(viewName) {
  document.body.classList.remove("home-view", "works-view", "info-view");
  document.body.classList.add(`${viewName}-view`);
}

function showHome() {
  setPageView("home");
  homeSection.hidden = false;
  overviewSection.hidden = true;
  hideImages();
  infoBlock.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showWorks() {
  setPageView("works");
  homeSection.hidden = true;
  overviewSection.hidden = false;
  hideImages();
  infoBlock.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showInfo() {
  setPageView("info");
  homeSection.hidden = true;
  overviewSection.hidden = true;
  hideImages();
  infoBlock.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

if (window.location.hash === "#info") {
  showInfo();
} else if (window.location.hash === "#works") {
  showWorks();
} else {
  showWorks();
}

document.querySelectorAll('[data-view-link="home"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    closeLightbox();
    showHome();
    history.replaceState(null, "", "#top");
  });
});

document.querySelectorAll('[data-view-link="info"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showInfo();
    history.replaceState(null, "", "#info");
  });
});

document.querySelectorAll('[data-view-link="works"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    closeLightbox();
    showWorks();
    history.replaceState(null, "", "#works");
  });
});

workToggles.forEach((toggle) => {
  const list = document.getElementById(toggle.getAttribute("aria-controls"));
  toggle.addEventListener("click", () => {
    if (!list) {
      toggle.setAttribute("aria-expanded", "false");
      return;
    }

    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    list.hidden = isOpen;
  });
});

function updateNavVisibility() {
  const hasMultipleImages = activeGallery.length > 1;
  prevButton.hidden = !hasMultipleImages;
  nextButton.hidden = !hasMultipleImages;

  if (mobileCount) {
    const hasMultipleImages = activeGallery.length > 1;
    mobileCount.textContent = hasMultipleImages ? `${activeImageIndex + 1}/${activeGallery.length}` : "";
    mobileCount.hidden = !hasMultipleImages;
    lightbox.classList.toggle("has-image-count", hasMultipleImages);
  }

  if (groupNextButton) {
    groupNextButton.hidden = activeGroups.length <= 1;
  }
}

function showImage(index) {
  activeImageIndex = (index + activeGallery.length) % activeGallery.length;
  const button = activeGallery[activeImageIndex];
  const image = button.querySelector("img");
  const nextSrc = getLightboxImageSource(button);
  const loadToken = ++lightboxImageLoadToken;

  lightbox.classList.add("lightbox-loading");
  lightbox.classList.remove("lightbox-landscape", "lightbox-portrait");
  lightboxImage.onload = () => {
    if (loadToken !== lightboxImageLoadToken) {
      return;
    }

    lightbox.classList.remove("lightbox-loading");
    updateLightboxImageOrientation();
    preloadNearbyLightboxImages();
  };
  lightboxImage.src = nextSrc;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = button.dataset.caption || image.alt || "";
  if (lightboxImage.complete && lightboxImage.naturalWidth) {
    lightboxImage.onload();
  } else {
    updateLightboxMetrics();
  }
  updateNavVisibility();
}

function getGalleryByName(galleryName) {
  if (galleryName === "field-notes") {
    return [...document.querySelectorAll("#field-notes .photo-button")];
  }

  return galleryButtons.filter((item) => item.dataset.gallery === galleryName);
}

function buildGroups(items) {
  const groups = [];
  const groupMap = new Map();

  items.forEach((item) => {
    const groupName = item.dataset.workGroup || item.dataset.gallery || item.getAttribute("href") || String(groups.length);

    if (!groupMap.has(groupName)) {
      const group = { name: groupName, items: [] };
      groupMap.set(groupName, group);
      groups.push(group);
    }

    groupMap.get(groupName).items.push(item);
  });

  return groups;
}

function getWorkGroupName(item) {
  return item.dataset.workGroup || item.getAttribute("href") || "";
}

function buildWorkGroups() {
  return visibleWorkCards.map((cover) => {
    const groupName = getWorkGroupName(cover);
    const items = workCards.filter((item) => getWorkGroupName(item) === groupName);
    return {
      cover,
      name: groupName,
      items: items.length ? items : [cover],
    };
  });
}

function setActiveGroup(groups, groupIndex, imageIndex = 0) {
  activeGroups = groups.length ? groups : [{ items: activeGallery }];
  activeGroupIndex = (groupIndex + activeGroups.length) % activeGroups.length;
  activeGallery = activeGroups[activeGroupIndex].items;
  showImage(Math.min(imageIndex, activeGallery.length - 1));
}

function openGallery(galleryName, startButton = null) {
  const selectedGallery = getGalleryByName(galleryName);

  if (!selectedGallery.length) {
    return;
  }

  const startIndex = startButton ? Math.max(selectedGallery.indexOf(startButton), 0) : 0;
  setActiveGroup([{ name: galleryName, items: selectedGallery }], 0, startIndex);
  lightbox.hidden = false;
  updateLightboxMetrics();
  (activeGallery.length > 1 ? nextButton : closeButton).focus();
}

galleryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const galleryName = button.dataset.gallery || "";
    openGallery(galleryName, button);
  });
});

document.querySelectorAll("[data-open-gallery]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const galleryName = link.dataset.openGallery || "";
    showWorks();
    openGallery(galleryName);
    history.replaceState(null, "", link.getAttribute("href"));
  });
});

visibleWorkCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    const groups = buildWorkGroups();
    const groupIndex = groups.findIndex((group) => group.cover === card);
    const imageIndex = Math.max(groups[groupIndex].items.indexOf(card), 0);
    setActiveGroup(groups, groupIndex, imageIndex);
    lightbox.hidden = false;
    updateLightboxMetrics();
    closeButton.focus();
    history.replaceState(null, "", card.getAttribute("href"));
  });
});

function closeLightbox() {
  lightboxImageLoadToken += 1;
  lightbox.hidden = true;
  lightboxImage.onload = null;
  lightboxImage.removeAttribute("src");
  lightbox.classList.remove("lightbox-loading", "lightbox-landscape", "lightbox-portrait");
}

function showPreviousImage() {
  showImage(activeImageIndex - 1);
}

function showNextImage() {
  showImage(activeImageIndex + 1);
}

function showNextGroup() {
  if (activeGroups.length <= 1) {
    return;
  }

  setActiveGroup(activeGroups, activeGroupIndex + 1, 0);
  const activeItem = activeGallery[0];
  const href = activeItem?.getAttribute("href");

  if (href) {
    history.replaceState(null, "", href);
  }
}

function showSwipeImage(delta) {
  const nextIndex = activeImageIndex + delta;

  if (nextIndex < 0 || nextIndex >= activeGallery.length) {
    return;
  }

  showImage(nextIndex);
}

closeButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", showPreviousImage);
nextButton.addEventListener("click", showNextImage);
groupNextButton?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  showNextGroup();
});

lightbox.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

lightbox.addEventListener("touchend", (event) => {
  if (lightbox.hidden || !event.changedTouches.length) {
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) {
    return;
  }

  showSwipeImage(deltaX < 0 ? 1 : -1);
}, { passive: true });

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) {
    closeLightbox();
  }

  if (event.key === "ArrowLeft" && !lightbox.hidden) {
    showPreviousImage();
  }

  if (event.key === "ArrowRight" && !lightbox.hidden) {
    showNextImage();
  }
});

window.addEventListener("resize", updateLightboxMetrics);
window.visualViewport?.addEventListener("resize", updateLightboxMetrics);
