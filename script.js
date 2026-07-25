const panels = [...document.querySelectorAll(".panel")];
const chapterLabel = document.querySelector("#current-chapter");
const progressBar = document.querySelector("#reading-progress-bar");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
panels[0]?.classList.add("is-active");

let frameRequested = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setPanelMotion(panel, index, rect, viewportCenter) {
  if (reduceMotion) return;

  const image = panel.querySelector(".panel__image");
  if (!image?.naturalWidth || !image.naturalHeight) return;

  const distance = clamp(
    (viewportCenter - (rect.top + rect.height / 2)) / rect.height,
    -1,
    1,
  );
  const panelRatio = rect.width / rect.height;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const direction = index % 2 === 0 ? 1 : -1;

  let containedWidth = rect.width;
  let containedHeight = rect.width / imageRatio;

  if (panelRatio > imageRatio) {
    containedHeight = rect.height;
    containedWidth = rect.height * imageRatio;
  }

  const safeX = Math.max(0, (rect.width - containedWidth) / 2 - 8);
  const safeY = Math.max(0, (rect.height - containedHeight) / 2 - 8);
  const panX = clamp(safeX * 0.32, 0, 28) * distance * direction;
  const panY = clamp(safeY * 0.22, 0, 22) * distance * direction;
  const veil = clamp(Math.abs(distance) * 0.24, 0, 0.24);
  const backdropDrift = clamp(distance * direction * 26, -26, 26);

  panel.style.setProperty("--image-pan-x", `${panX.toFixed(2)}px`);
  panel.style.setProperty("--image-pan-y", `${panY.toFixed(2)}px`);
  panel.style.setProperty("--scene-veil", veil.toFixed(3));
  panel.style.setProperty("--backdrop-drift", `${backdropDrift.toFixed(2)}px`);
}

function updateStoryPosition() {
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? window.scrollY / documentHeight : 0;
  progressBar.style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;

  const viewportCenter = window.innerHeight / 2;
  let activePanel = panels[0];
  let activeDistance = Number.POSITIVE_INFINITY;

  panels.forEach((panel, index) => {
    const rect = panel.getBoundingClientRect();
    const panelCenter = rect.top + rect.height / 2;
    const centerDistance = Math.abs(viewportCenter - panelCenter);

    if (centerDistance < activeDistance) {
      activeDistance = centerDistance;
      activePanel = panel;
    }

    if (rect.bottom < -window.innerHeight || rect.top > window.innerHeight * 2) {
      return;
    }

    setPanelMotion(panel, index, rect, viewportCenter);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel === activePanel);
  });
  chapterLabel.textContent = activePanel?.dataset.chapter ?? "01";

  frameRequested = false;
}

function requestStoryUpdate() {
  if (frameRequested) return;
  frameRequested = true;
  window.requestAnimationFrame(updateStoryPosition);
}

window.addEventListener("scroll", requestStoryUpdate, { passive: true });
window.addEventListener("resize", requestStoryUpdate);
window.addEventListener("load", requestStoryUpdate);

updateStoryPosition();
