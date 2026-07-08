const menuButton = document.querySelector(".menu-button");
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

menuButton?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

function hideImages() {
  imageSections.forEach((section) => {
    section.hidden = true;
  });
}

function showHome() {
  homeSection.hidden = false;
  overviewSection.hidden = true;
  hideImages();
  infoBlock.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showWorks() {
  homeSection.hidden = true;
  overviewSection.hidden = false;
  hideImages();
  infoBlock.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showInfo() {
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
  showHome();
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
    mobileCount.textContent = `${activeImageIndex + 1}/${activeGallery.length}`;
  }

  if (groupNextButton) {
    groupNextButton.hidden = activeGroups.length <= 1;
  }
}

function showImage(index) {
  activeImageIndex = (index + activeGallery.length) % activeGallery.length;
  const button = activeGallery[activeImageIndex];
  const image = button.querySelector("img");
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = button.dataset.caption || image.alt || "";
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

workCards.forEach((card, index) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    const groups = buildGroups(workCards);
    const groupIndex = groups.findIndex((group) => group.items.includes(card));
    const imageIndex = Math.max(groups[groupIndex].items.indexOf(card), 0);
    setActiveGroup(groups, groupIndex, imageIndex);
    lightbox.hidden = false;
    closeButton.focus();
    history.replaceState(null, "", card.getAttribute("href"));
  });
});

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
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
groupNextButton?.addEventListener("click", showNextGroup);

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
