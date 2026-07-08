const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");
const closeButton = document.querySelector(".lightbox-close");
const prevButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");
const galleryButtons = [...document.querySelectorAll(".photo-button")];
const workCards = [...document.querySelectorAll(".work-card")];
const workToggles = [...document.querySelectorAll(".work-toggle")];
const infoBlock = document.querySelector(".info-block");
const homeSection = document.querySelector(".home-index");
const overviewSection = document.querySelector(".work-overview");
const imageSections = [...document.querySelectorAll(".image-sequence")];
let activeImageIndex = 0;
let activeGallery = galleryButtons;

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

function openGallery(galleryName, startButton = null) {
  const selectedGallery = getGalleryByName(galleryName);

  if (!selectedGallery.length) {
    return;
  }

  activeGallery = selectedGallery;
  const startIndex = startButton ? Math.max(activeGallery.indexOf(startButton), 0) : 0;
  showImage(startIndex);
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
    activeGallery = workCards;
    showImage(index);
    lightbox.hidden = false;
    (activeGallery.length > 1 ? nextButton : closeButton).focus();
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

closeButton.addEventListener("click", closeLightbox);
prevButton.addEventListener("click", showPreviousImage);
nextButton.addEventListener("click", showNextImage);

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
