import { useEffect, useState } from "react";

import { WEDDING } from "./data";
import { Icon } from "./effects";

const NAV_ITEMS = [
  { href: "#inicio", label: "Início" },
  { href: "#historia", label: "Nossa História" },
  { href: "#galeria", label: "Fotos" },
  { href: "#detalhes", label: "O Grande Dia" },
  { href: "#mural", label: "Mensagens" },
  { href: "#presentes", label: "Presentes" },
  { href: "#rsvp", label: "Confirmar Presença", cta: true },
];

function goToSection(event, href, onDone) {
  event.preventDefault();
  onDone?.();
  const element = document.querySelector(href);
  if (element) {
    window.scrollTo({
      top: element.getBoundingClientRect().top + window.scrollY - 70,
      behavior: "smooth",
    });
  }
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <a href="#inicio" className="nav-brand" onClick={(event) => goToSection(event, "#inicio")}>
          <Icon name="Sparkles" size={18} style={{ color: "var(--gold-400)" }} />
          T <span className="amp">&amp;</span> G
        </a>
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={item.cta ? "cta" : ""}
                onClick={(event) => goToSection(event, item.href)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <button className="nav-toggle" onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Icon name="Menu" size={22} />
        </button>
      </nav>

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <button
          className="nav-toggle"
          style={{ position: "absolute", top: "1.1rem", right: "1.25rem" }}
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        >
          <Icon name="X" size={22} />
        </button>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => goToSection(event, item.href, () => setOpen(false))}
            style={item.cta ? { color: "var(--gold-300)" } : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}

export function HeroScene() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(id);
  }, []);

  return (
    <header className="hero" id="inicio">
      <div className="tower" />
      <div className={`hero-stagger ${ready ? "ready" : ""}`}>
        <div className="hero-eyebrow">
          <span className="eyebrow">Vamos nos casar</span>
        </div>
        <div>
          <h1 className="hero-names gold-text shimmer-text">
            {WEDDING.groom}
            <span className="amp">&amp;</span>
            {WEDDING.bride}
          </h1>
        </div>
        <p className="hero-sub">O nosso melhor capítulo começa aqui</p>
        <div className="hero-meta">
          <span>
            <b>{WEDDING.dateLabel}</b>
          </span>
          <span className="sep" />
          <span>
            <b>{WEDDING.timeLabel}</b>
          </span>
          <span className="sep" />
          <span>
            {WEDDING.venue} · Paulínia/SP
          </span>
        </div>
        <p className="hero-quote">
          Entre lanternas, sonhos e promessas, convidamos você para viver conosco o início da
          nossa maior aventura.
        </p>
        <div className="hero-ctas">
          <a href="#rsvp" className="btn btn-gold" onClick={(event) => goToSection(event, "#rsvp")}>
            <Icon name="Heart" size={18} /> Confirmar presença
          </a>
          <a
            href="#presentes"
            className="btn btn-ghost"
            onClick={(event) => goToSection(event, "#presentes")}
          >
            <Icon name="Gift" size={18} /> Ver lista de presentes
          </a>
        </div>
      </div>
      <div className="scroll-hint">
        <span>Role para começar</span>
        <Icon name="ChevronDown" size={18} />
      </div>
    </header>
  );
}
