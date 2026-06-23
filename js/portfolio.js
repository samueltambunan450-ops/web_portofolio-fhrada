const body = document.body;
const nav = document.querySelector(".nav");
const navLinks = document.querySelector(".nav-links");
const navToggle = document.querySelector(".menu-toggle");
const navItems = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");
const typingTarget = document.querySelector("[data-typing]");
const counters = document.querySelectorAll("[data-count]");
const revealItems = document.querySelectorAll(".reveal");
const heroVisual = document.querySelector(".hero-visual");
const progressBars = document.querySelectorAll(".progress-bar");
const progressIndicator = document.querySelector(".page-progress span");
const backToTopButton = document.querySelector("[data-back-to-top]");
const interactiveCards = document.querySelectorAll(".interactive-card");

const roles = [
  "Web Developer",
  "Frontend Enthusiast",
  "Laravel Learner",
  "Mobile App Collaborator"
];

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

let roleIndex = 0;
let charIndex = 0;
let deleting = false;
let isTicking = false;

function isReducedMotion() {
  return reducedMotionQuery.matches;
}

function canUsePointerEffects() {
  return finePointerQuery.matches && !isReducedMotion();
}

function setMenuState(isOpen) {
  navLinks?.classList.toggle("open", isOpen);
  navToggle?.classList.toggle("active", isOpen);
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("menu-open", isOpen && window.innerWidth <= 840);
}

function closeMenu() {
  setMenuState(false);
}

function updateScrollProgress() {
  if (!progressIndicator) {
    return;
  }

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progressIndicator.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
}

function updateActiveSection() {
  let currentSection = "";

  sections.forEach((section) => {
    const top = section.offsetTop - 180;
    const bottom = top + section.offsetHeight;

    if (window.scrollY >= top && window.scrollY < bottom) {
      currentSection = section.id;
    }
  });

  navItems.forEach((item) => {
    const isActive = item.getAttribute("href") === `#${currentSection}`;
    item.classList.toggle("active", isActive);
  });
}

function handleScrollState() {
  nav?.classList.toggle("scrolled", window.scrollY > 10);
  updateActiveSection();
  updateScrollProgress();
  backToTopButton?.classList.toggle("is-visible", window.scrollY > 520);
}

function onScroll() {
  if (isTicking) {
    return;
  }

  isTicking = true;
  window.requestAnimationFrame(() => {
    handleScrollState();
    isTicking = false;
  });
}

function typeRole() {
  if (!typingTarget) {
    return;
  }

  if (isReducedMotion()) {
    typingTarget.textContent = roles[0];
    return;
  }

  const currentRole = roles[roleIndex];
  charIndex += deleting ? -1 : 1;
  typingTarget.textContent = currentRole.slice(0, charIndex);

  let timeout = deleting ? 45 : 95;

  if (!deleting && charIndex === currentRole.length) {
    timeout = 1400;
    deleting = true;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    timeout = 280;
  }

  window.setTimeout(typeRole, timeout);
}

function animateCounter(element) {
  const target = Number(element.dataset.count || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  function updateCounter(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

function handlePointerMove(event) {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  body.style.setProperty("--pointer-x", `${x}%`);
  body.style.setProperty("--pointer-y", `${y}%`);

  if (!heroVisual || window.innerWidth < 960) {
    return;
  }

  const offsetX = (event.clientX / window.innerWidth - 0.5) * 16;
  const offsetY = (event.clientY / window.innerHeight - 0.5) * 16;
  heroVisual.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
}

function handleCardTilt(event) {
  if (!canUsePointerEffects()) {
    return;
  }

  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
  const rotateX = (0.5 - (event.clientY - rect.top) / rect.height) * 8;
  card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
}

function resetCardTilt(event) {
  event.currentTarget.style.removeProperty("transform");
}

navToggle?.addEventListener("click", () => {
  const shouldOpen = !navLinks?.classList.contains("open");
  setMenuState(Boolean(shouldOpen));
});

navItems.forEach((item) => {
  item.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  if (!navLinks?.classList.contains("open")) {
    return;
  }

  const target = event.target;
  const clickedInsideNav = nav?.contains(target);

  if (!clickedInsideNav) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 840) {
    closeMenu();
  }

  if (!canUsePointerEffects()) {
    heroVisual?.style.removeProperty("transform");
    interactiveCards.forEach((card) => {
      card.style.removeProperty("transform");
    });
  }

  handleScrollState();
});

backToTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: isReducedMotion() ? "auto" : "smooth" });
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      if (isReducedMotion()) {
        const suffix = entry.target.dataset.suffix || "";
        entry.target.textContent = `${entry.target.dataset.count || 0}${suffix}`;
      } else {
        animateCounter(entry.target);
      }

      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.55 }
);

const progressObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const targetProgress = entry.target.dataset.progress || "0";
      entry.target.style.setProperty("--progress", `${targetProgress}%`);
      entry.target.classList.add("is-animated");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.4 }
);

if (isReducedMotion()) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counters.forEach((counter) => {
    const suffix = counter.dataset.suffix || "";
    counter.textContent = `${counter.dataset.count || 0}${suffix}`;
  });
  progressBars.forEach((bar) => {
    bar.style.setProperty("--progress", `${bar.dataset.progress || 0}%`);
    bar.classList.add("is-animated");
  });
} else {
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
    revealObserver.observe(item);
  });

  counters.forEach((counter) => counterObserver.observe(counter));
  progressBars.forEach((bar) => progressObserver.observe(bar));
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", handleScrollState);

document.addEventListener("mousemove", handlePointerMove);
interactiveCards.forEach((card) => {
  card.addEventListener("mousemove", handleCardTilt);
  card.addEventListener("mouseleave", resetCardTilt);
});

typeRole();
