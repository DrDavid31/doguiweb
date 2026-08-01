const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const leadForm = document.querySelector("[data-lead-form]");
const formNote = document.querySelector("[data-form-note]");
const floatingCta = document.querySelector(".floating-cta");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  navLinks.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  if (activeItem) {
    activeItem.link.classList.add("is-active");
    activeItem.link.setAttribute("aria-current", "page");
  }
};

const updateScrollProgress = () => {
  if (!scrollProgress) return;
  const root = document.documentElement;
  const max = root.scrollHeight - root.clientHeight;
  const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  scrollProgress.style.transform = `scaleX(${ratio})`;
};

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
  floatingCta?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.55);
  setActiveNav();
  updateScrollProgress();
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

const scrollToTarget = (target, behavior = "smooth") => {
  const headerHeight = header?.offsetHeight || 0;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 12);
  window.scrollTo({ top, behavior: reduceMotion ? "auto" : behavior });
  setHeaderState();
};

const jumpToInitialHash = () => {
  const target = getHashTarget();
  if (!target) return;

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  scrollToTarget(target, "auto");
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

const countUp = (el, target, duration = 1200) => {
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(target * eased));
    if (progress < 1) window.requestAnimationFrame(step);
    else el.textContent = String(target);
  };
  window.requestAnimationFrame(step);
};

if ("IntersectionObserver" in window) {
  const statEls = document.querySelectorAll(".trust-strip strong");

  if (statEls.length) {
    statEls.forEach((el) => el.classList.add("count-ready"));

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const raw = el.textContent.trim();
          if (!reduceMotion && /^\d+$/.test(raw)) {
            countUp(el, Number(raw));
          }

          el.classList.add("is-counted");
          statObserver.unobserve(el);
        });
      },
      { threshold: 0.6 },
    );

    statEls.forEach((el) => statObserver.observe(el));
  }
}

const getLeadPayload = (formData) => ({
  name: String(formData.get("name") || "").trim(),
  company: String(formData.get("company") || "").trim(),
  email: String(formData.get("email") || "").trim(),
  service: String(formData.get("service") || "").trim(),
  message: String(formData.get("message") || "").trim(),
  website: String(formData.get("website") || "").trim(),
  source: "doguiweb",
});

const openMailFallback = (lead) => {
  const subject = `Solicitud DOGUI - ${lead.service || "Ciberseguridad"}`;
  const bodyLines = [
    `Nombre: ${lead.name}`,
    `Empresa: ${lead.company}`,
    `Correo: ${lead.email}`,
    `Servicio: ${lead.service}`,
    "",
    "Mensaje:",
    lead.message || "Quiero que DOGUI me contacte para definir alcance.",
  ];

  window.location.href = `mailto:ventas@dogui.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    bodyLines.join("\n"),
  )}`;
};

leadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!leadForm.checkValidity()) {
    leadForm.reportValidity();
    return;
  }

  const submitButton = leadForm.querySelector('button[type="submit"]');
  const lead = getLeadPayload(new FormData(leadForm));

  if (formNote) {
    formNote.textContent = "Enviando solicitud...";
  }

  submitButton?.setAttribute("disabled", "true");

  try {
    if (window.DOGUIApiAvailable === false) {
      throw new Error("lead_api_unavailable");
    }

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    if (!response.ok) throw new Error("lead_api_unavailable");

    if (formNote) {
      formNote.textContent = "Listo: recibimos tu solicitud y DOGUI te contactará.";
    }

    leadForm.reset();
  } catch {
    if (formNote) {
      formNote.textContent = "No se encontró el backend; abrimos correo como respaldo.";
    }

    openMailFallback(lead);
  } finally {
    submitButton?.removeAttribute("disabled");
  }
});
