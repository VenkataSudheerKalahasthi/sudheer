/**
 * premium.js — interaction layer for the redesign (ES module).
 * Does not replace script.js; it only adds behaviour on top of it.
 */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- 1. Hero buttons reuse the existing page navigation ---------- */
document.querySelectorAll("[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const label = btn.dataset.goto.toLowerCase();
    const link = [...document.querySelectorAll("[data-nav-link]")]
      .find((l) => l.textContent.trim().toLowerCase() === label);
    if (link) link.click();
  });
});

/* ---------- 2. Scroll / page reveal (IntersectionObserver) ---------- */
function setupReveal() {
  if (reduceMotion) return;
  document.documentElement.classList.add("js-motion");
  const groups = [
    [".about-copy > header, .about-copy .about-text, .about-actions, .about-avatar-wrap", 0],
    [".service-title, .service-item", 1],
    [".testimonials-title, .testimonials-item", 1],
    [".resume .article-title, .timeline .h3, .timeline-item, .skills-title, .skills-item", 1],
    [".portfolio .article-title, .filter-list, .project-item", 1],
    [".contact .article-title, .contact-form, .form-title, .mapbox", 1],
  ];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  groups.forEach(([selector]) => {
    const seen = new Map();
    document.querySelectorAll(selector).forEach((el) => {
      const parent = el.parentElement;
      const i = Math.min(seen.get(parent) || 0, 5);      // stagger capped at 5 steps
      seen.set(parent, i + 1);
      el.style.setProperty("--i", i);
      el.classList.add("reveal");
      io.observe(el);
    });
  });
}

/* ---------- 3. Project card tilt (desktop, small angle, eased back) ---------- */
function setupTilt() {
  if (reduceMotion || !finePointer) return;
  document.querySelectorAll(".project-item > a").forEach((card) => {
    const MAX = 7;                                          // degrees
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add("is-tilting");
      card.style.setProperty("--ry", `${(x * MAX * 2).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * MAX * 2).toFixed(2)}deg`);
      card.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(0)}%`);
      card.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(0)}%`);
      card.style.setProperty("--px", `${(x * -8).toFixed(1)}px`);
      card.style.setProperty("--py", `${(y * -8).toFixed(1)}px`);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      ["--rx", "--ry", "--px", "--py"].forEach((p) => card.style.removeProperty(p));
    });
  });
}

/* ---------- 4. Lazy-load the 3D scene only when About is near the viewport ---------- */
function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

function setupScene() {
  const stage = document.querySelector("[data-about-stage]");
  if (!stage) return;
  if (!hasWebGL()) { stage.dataset.state = "unsupported"; return; }
  stage.dataset.state = "loading";

  let started = false;
  const boot = async () => {
    if (started) return;
    started = true;
    try {
      const { createAboutScene } = await import("./about-3d-scene.js");
      createAboutScene(stage, { onState: (s) => { stage.dataset.state = s; } });
    } catch (err) {
      console.warn("[about-3d] scene failed to load:", err);
      stage.dataset.state = "unsupported";
    }
  };
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); boot(); }
  }, { rootMargin: "200px" });
  io.observe(stage);
}

setupReveal();
setupTilt();
setupScene();
