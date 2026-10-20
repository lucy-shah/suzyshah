// Photography cameras: each camera opens its shoot below the row.
const cameras = [...document.querySelectorAll(".cam")];

function closeShoots() {
  cameras.forEach(camera => {
    camera.setAttribute("aria-expanded", "false");
    document.getElementById(camera.getAttribute("aria-controls")).hidden = true;
  });
}

cameras.forEach(camera => camera.addEventListener("click", () => {
  const wasOpen = camera.getAttribute("aria-expanded") === "true";
  closeShoots();
  if (wasOpen) return;
  const shoot = document.getElementById(camera.getAttribute("aria-controls"));
  camera.setAttribute("aria-expanded", "true");
  shoot.hidden = false;
  shoot.scrollIntoView({ behavior: "smooth", block: "start" });
}));
document.querySelectorAll("[data-close-shoot]").forEach(button => button.addEventListener("click", () => {
  const camera = cameras.find(cam => cam.getAttribute("aria-controls") === button.closest(".ph-shoot").id);
  closeShoots();
  camera.focus();
}));

// Lightbox: click a photo to view it large, arrow through the photos in the same group.
const lightbox = document.querySelector(".ph-lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("figcaption");
let group = [];
let currentPhoto = 0;

function showPhoto(index) {
  currentPhoto = (index + group.length) % group.length;
  const photo = group[currentPhoto];
  lightboxImage.src = photo.dataset.full;
  lightboxImage.alt = photo.querySelector("img").alt;
  lightboxCaption.textContent = `${photo.dataset.caption} · ${currentPhoto + 1} of ${group.length}`;
}

document.querySelectorAll(".ph-photo").forEach(photo => photo.addEventListener("click", () => {
  group = [...photo.closest(".ph-grid").querySelectorAll(".ph-photo")];
  showPhoto(group.indexOf(photo));
  lightbox.showModal();
}));
lightbox.querySelectorAll("[data-ph-step]").forEach(button => {
  button.addEventListener("click", () => showPhoto(currentPhoto + Number(button.dataset.phStep)));
});
lightbox.querySelector("[data-ph-close]").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener("keydown", event => {
  if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
  if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
});

// Sideways scrolling rows (films, screenplays, shoots): a "← • • • →" bar under
// each row shows where you are. It only appears when the row has more than fits.
document.querySelectorAll(".h-scroll").forEach(row => {
  const wrap = document.createElement("div");
  wrap.className = "h-scroll-wrap";
  row.before(wrap);
  wrap.append(row);
  const items = [...row.children];
  const bar = document.createElement("div");
  bar.className = "h-scroll-bar";
  const arrow = direction => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "h-scroll-btn";
    button.setAttribute("aria-label", direction < 0 ? "Scroll left" : "Scroll right");
    button.textContent = direction < 0 ? "←" : "→";
    button.addEventListener("click", () => row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: "smooth" }));
    return button;
  };
  const prev = arrow(-1);
  const next = arrow(1);
  const dots = items.map((item, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "h-scroll-dot";
    dot.setAttribute("aria-label", `Go to item ${index + 1} of ${items.length}`);
    dot.addEventListener("click", () => row.scrollTo({ left: item.offsetLeft - row.offsetLeft - 6, behavior: "smooth" }));
    return dot;
  });
  const hint = document.createElement("span");
  hint.className = "h-scroll-hint scribble";
  hint.textContent = "scroll for more";
  bar.append(prev, ...dots, next, hint);
  wrap.append(bar);

  const update = () => {
    const max = row.scrollWidth - row.clientWidth;
    bar.hidden = max <= 4;
    prev.disabled = row.scrollLeft <= 4;
    next.disabled = row.scrollLeft >= max - 4;
    hint.hidden = row.scrollLeft > 4;
    const left = row.scrollLeft;
    const right = left + row.clientWidth;
    items.forEach((item, index) => {
      const start = item.offsetLeft - row.offsetLeft;
      const visible = start + item.offsetWidth / 2 > left && start + item.offsetWidth / 2 < right;
      dots[index].classList.toggle("on", visible);
    });
  };
  row.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
});
