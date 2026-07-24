const panels = [...document.querySelectorAll(".panel")];
const chapterLabel = document.querySelector("#current-chapter");
const progressBar = document.querySelector("#reading-progress-bar");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const panelObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-active");
      chapterLabel.textContent = entry.target.dataset.chapter;
    });
  },
  { threshold: 0.48 },
);

panels.forEach((panel) => panelObserver.observe(panel));
panels[0]?.classList.add("is-active");

let frameRequested = false;

function updateStoryPosition() {
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? window.scrollY / documentHeight : 0;
  progressBar.style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;

  if (!reduceMotion) {
    const viewportCenter = window.innerHeight / 2;

    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const panelCenter = rect.top + rect.height / 2;
      const lift = Math.max(-24, Math.min(24, (viewportCenter - panelCenter) * 0.035));
      panel.style.setProperty("--image-lift", `${lift}px`);
    });
  }

  frameRequested = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateStoryPosition);
  },
  { passive: true },
);

updateStoryPosition();
