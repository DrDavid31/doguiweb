const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const leadForm = document.querySelector("[data-lead-form]");
const formNote = document.querySelector("[data-form-note]");
const floatingCta = document.querySelector(".floating-cta");

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
  floatingCta?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.55);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

if ("IntersectionObserver" in window) {
  const revealItems = document.querySelectorAll(".section, .finance-band, .contact-section");
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
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();

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
