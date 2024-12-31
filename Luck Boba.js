// Select all gallery images
const images = document.querySelectorAll(
  ".bobaheader img, .bobaheader-three img, .bobaheader-four img, .bobaheader-five img, .bobaheader-six img, .bobaheaderig img "
);
const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox.querySelector("img");
const close = lightbox.querySelector(".lightbox-close");
const prev = lightbox.querySelector(".lightbox-prev");
const next = lightbox.querySelector(".lightbox-next");
let currentImageIndex = 0;

function showImage(index) {
  currentImageIndex = index;
  lightboxImg.src = images[index].src;
  lightboxImg.alt = images[index].alt;
  lightbox.classList.add("active");
  updateNavigation();
}

function updateNavigation() {
  prev.style.display = currentImageIndex > 0 ? "block" : "none";
  next.style.display = currentImageIndex < images.length - 1 ? "block" : "none";
}

// Add click handlers to all gallery images
images.forEach((img, index) => {
  img.style.cursor = "pointer";
  img.addEventListener("click", () => showImage(index));
});

// Close lightbox when clicking close button
close.addEventListener("click", () => {
  lightbox.classList.remove("active");
});

// Previous image
prev.addEventListener("click", () => {
  if (currentImageIndex > 0) showImage(currentImageIndex - 1);
});

// Next image
next.addEventListener("click", () => {
  if (currentImageIndex < images.length - 1) showImage(currentImageIndex + 1);
});

// Close lightbox when clicking outside image
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.classList.remove("active");
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;

  switch (e.key) {
    case "Escape":
      lightbox.classList.remove("active");
      break;
    case "ArrowLeft":
      if (currentImageIndex > 0) showImage(currentImageIndex - 1);
      break;
    case "ArrowRight":
      if (currentImageIndex < images.length - 1)
        showImage(currentImageIndex + 1);
      break;
  }
});
s;
