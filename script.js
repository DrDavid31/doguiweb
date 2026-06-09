const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const leadForm = document.querySelector("[data-lead-form]");
const formNote = document.querySelector("[data-form-note]");
const floatingCta = document.querySelector(".floating-cta");
const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
const navTargets = navLinks
  .map((link) => {
    const selector = link.getAttribute("href");
    const target = selector?.startsWith("#") ? document.getElementById(selector.slice(1)) : null;
    return target ? { link, target } : null;
  })
  .filter(Boolean);

const getHashTarget = (hash = window.location.hash) => {
  if (!hash || hash === "#") return null;

  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
};

const setActiveNav = () => {
  const marker = window.scrollY + (header?.offsetHeight || 0) + Math.min(360, window.innerHeight * 0.45);
  let activeItem = null;

  navTargets.forEach((item) => {
    if (item.target.offsetTop <= marker) {
      activeItem = item;
    }
  });

  navLinks.forEach((link) => link.classList.remove("is-active"));
  activeItem?.link.classList.add("is-active");
};

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
  floatingCta?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.55);
  setActiveNav();
};

let scrollTicking = false;
const requestHeaderState = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    setHeaderState();
    scrollTicking = false;
  });
};

const closeNav = () => {
  body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

const scrollToTarget = (target) => {
  const headerHeight = header?.offsetHeight || 0;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 12);
  window.scrollTo({ top, behavior: "auto" });
  setHeaderState();
};

const jumpToInitialHash = () => {
  const target = getHashTarget();
  if (!target) return;

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  scrollToTarget(target);
  root.style.scrollBehavior = previousScrollBehavior;
};

setHeaderState();
window.addEventListener("scroll", requestHeaderState, { passive: true });
window.addEventListener("load", () => {
  window.requestAnimationFrame(jumpToInitialHash);
  window.setTimeout(setHeaderState, 120);
});

navToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!link) return;

  const hash = link.getAttribute("href");
  const target = hash ? getHashTarget(hash) : null;
  if (!target) return;

  event.preventDefault();
  closeNav();
  history.pushState(null, "", hash);
  scrollToTarget(target);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNav();
});

if ("IntersectionObserver" in window) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = reduceMotion
    ? []
    : document.querySelectorAll("main > section:not(.hero):not(.trust-strip)");

  if (revealItems.length) {
    revealItems.forEach((item) => item.classList.add("reveal-ready"));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
}

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!leadForm.checkValidity()) {
    leadForm.reportValidity();
    return;
  }

  const formData = new FormData(leadForm);
  const name = String(formData.get("name") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const service = String(formData.get("service") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const subject = `Solicitud DOGUI - ${service || "Ciberseguridad"}`;
  const bodyLines = [
    `Nombre: ${name}`,
    `Empresa: ${company}`,
    `Correo: ${email}`,
    `Servicio: ${service}`,
    "",
    "Mensaje:",
    message || "Quiero que DOGUI me contacte para definir alcance.",
  ];

  const mailto = `mailto:ventas@dogui.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    bodyLines.join("\n"),
  )}`;

  if (formNote) {
    formNote.textContent = "Listo: se abrio un correo con tu solicitud.";
  }

  window.location.href = mailto;
});
