export const NAV_ITEMS = [
  { type: "section", href: "#inicio", label: "Início" },
  { type: "section", href: "#historia", label: "Nossa História" },
  { type: "section", href: "#galeria", label: "Fotos" },
  { type: "section", href: "#detalhes", label: "O Grande Dia" },
  { type: "section", href: "#contagem", label: "Contagem" },
  { type: "route", to: "/confirmar", label: "Confirmar Presença", cta: true },
  { type: "route", to: "/presentes", label: "Presentes" },
  { type: "section", href: "#mural", label: "Mensagens" },
];

export const NAV_OFFSET = 70;

export function scrollToHash(hash, behavior = "smooth") {
  if (!hash) return;
  const element = document.querySelector(hash);
  if (!element) return;
  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
    behavior,
  });
}

export function goToSection(event, href, onDone) {
  event.preventDefault();
  onDone?.();
  scrollToHash(href);
}

export function homeSectionPath(href) {
  return `/${href}`;
}
