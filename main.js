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

const contactForm = document.getElementById("contact-form");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Briefing Protocol Initiated. Welcome to SocialCultur.");
});

initCanvas();
drawCanvas();
