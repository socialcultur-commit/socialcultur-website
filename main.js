const canvas = document.getElementById("interactive-grid");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let particles = [];
const mouse = { x: -1000, y: -1000 };

function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

function initCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  particles = [];

  const spacing = window.innerWidth < 768 ? 48 : 32;
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      particles.push({ x, y, size: 1.5, color: "rgba(245, 245, 242, 0.08)" });
    }
  }
}

function drawCanvas() {
  ctx.clearRect(0, 0, width, height);
  const defaultColor = isDarkTheme() ? "rgba(245, 245, 242, 0.08)" : "rgba(13, 13, 13, 0.06)";

  particles.forEach((particle) => {
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 150;

    if (distance < maxDistance) {
      const ratio = 1 - distance / maxDistance;
      particle.color = dx > 0
        ? `rgba(142, 95, 217, ${0.1 + ratio})`
        : `rgba(1, 193, 170, ${0.1 + ratio})`;
      particle.size = 2 + ratio * 3;
    } else {
      particle.color = defaultColor;
      particle.size = 1.5;
    }

    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawCanvas);
}

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener("touchmove", (event) => {
  if (!event.touches.length) return;
  mouse.x = event.touches[0].clientX;
  mouse.y = event.touches[0].clientY;
});

window.addEventListener("touchend", () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

window.addEventListener("resize", initCanvas);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("active");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const narrativeSection = document.querySelector(".narrative-section");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function mapProgress(progress, start, end) {
  return clamp((progress - start) / (end - start));
}

function updateNarrativeScrollEffects() {
  if (!narrativeSection) return;

  if (reduceMotion.matches) {
    narrativeSection.style.setProperty("--story-opacity", "0.06");
    narrativeSection.style.setProperty("--story-y", "-34px");
    narrativeSection.style.setProperty("--story-scale", "0.94");
    narrativeSection.style.setProperty("--headline-opacity", "1");
    narrativeSection.style.setProperty("--headline-y", "0px");
    narrativeSection.style.setProperty("--copy-opacity", "1");
    narrativeSection.style.setProperty("--copy-y", "0px");
    return;
  }

  const rect = narrativeSection.getBoundingClientRect();
  const scrollableDistance = Math.max(narrativeSection.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-rect.top / scrollableDistance);
  const storyExit = mapProgress(progress, 0.34, 0.5);
  const headlineEntry = mapProgress(progress, 0.44, 0.58);
  const copyEntry = mapProgress(progress, 0.56, 0.68);

  narrativeSection.style.setProperty("--story-opacity", String(1 - storyExit * 0.934));
  narrativeSection.style.setProperty("--story-y", `${-72 * storyExit}px`);
  narrativeSection.style.setProperty("--story-scale", String(1 - storyExit * 0.08));
  narrativeSection.style.setProperty("--headline-opacity", String(headlineEntry));
  narrativeSection.style.setProperty("--headline-y", `${34 * (1 - headlineEntry)}px`);
  narrativeSection.style.setProperty("--copy-opacity", String(copyEntry));
  narrativeSection.style.setProperty("--copy-y", `${26 * (1 - copyEntry)}px`);
}

const mobileMenu = document.getElementById("mobile-menu");
const mobileMenuButton = document.getElementById("mobile-menu-btn");
const menuIcon = document.getElementById("menu-icon");

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuIcon.textContent = "menu";
  document.body.style.overflow = "";
}

mobileMenuButton?.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  menuIcon.textContent = isOpen ? "close" : "menu";
  document.body.style.overflow = isOpen ? "hidden" : "";
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

const trackedSections = [...document.querySelectorAll("#services, #models, #contact")];
const navLinks = [...document.querySelectorAll('.desktop-links a[href^="#"], .mobile-menu a[href^="#"]:not(.pill-button)')];

function setActiveNavigation(sectionId = null) {
  navLinks.forEach((link) => {
    const isActive = Boolean(sectionId) && link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function updateActiveNavigation() {
  const activationLine = window.innerHeight * 0.38;
  let currentSection = null;

  trackedSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= activationLine) {
      currentSection = section;
    }
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
    currentSection = trackedSections[trackedSections.length - 1];
  }

  setActiveNavigation(currentSection?.id);
}

function setActiveNavigationFromHash() {
  const sectionId = window.location.hash.replace("#", "");
  if (sectionId === "hero") {
    setActiveNavigation();
    return true;
  }
  if (!trackedSections.some((section) => section.id === sectionId)) return false;
  setActiveNavigation(sectionId);
  return true;
}

let navigationFrame = 0;
window.addEventListener("scroll", () => {
  if (navigationFrame) return;
  navigationFrame = requestAnimationFrame(() => {
    updateActiveNavigation();
    updateNarrativeScrollEffects();
    navigationFrame = 0;
  });
}, { passive: true });

window.addEventListener("resize", () => {
  updateActiveNavigation();
  updateNarrativeScrollEffects();
});
window.addEventListener("hashchange", setActiveNavigationFromHash);
if (typeof reduceMotion.addEventListener === "function") {
  reduceMotion.addEventListener("change", updateNarrativeScrollEffects);
} else {
  reduceMotion.addListener(updateNarrativeScrollEffects);
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const sectionId = link.getAttribute("href").slice(1);
    setActiveNavigation(sectionId);
  });
});

const contactForm = document.getElementById("contact-form");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Briefing Protocol Initiated. Welcome to SocialCultur.");
});

initCanvas();
drawCanvas();
if (!setActiveNavigationFromHash()) updateActiveNavigation();
updateNarrativeScrollEffects();
