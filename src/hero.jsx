import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { WEDDING } from "./data";
import { FloatingLanterns, Icon } from "./effects";
import { NAV_ITEMS, goToSection, homeSectionPath } from "./navigation";

function NavLink({ item, onNavigate, className = "", style }) {
  const location = useLocation();
  const onHome = location.pathname === "/";

  if (item.type === "route") {
    const active = location.pathname === item.to;
    return (
      <Link
        to={item.to}
        className={`${item.cta ? "cta" : ""} ${active ? "active" : ""} ${className}`.trim()}
        style={style}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  }

  const sectionPath = homeSectionPath(item.href);

  if (onHome) {
    return (
      <a
        href={item.href}
        className={`${item.cta ? "cta" : ""} ${className}`.trim()}
        style={style}
        onClick={(event) => goToSection(event, item.href, onNavigate)}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      to={sectionPath}
      className={`${item.cta ? "cta" : ""} ${className}`.trim()}
      style={style}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";

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

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* Fora da home o fundo é claro; o estado "scrolled" (barra escura) garante contraste do logo e dos links */}
      <nav className={`navbar ${scrolled || !onHome ? "scrolled" : ""}`}>

        <Link to="/" className="nav-brand">
          T <span className="amp">&amp;</span> G
        </Link>
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href ?? item.to}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
        <button
          className="nav-toggle"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <Icon name={open ? "X" : "Menu"} size={22} />
          <span className="nav-toggle-label">{open ? "Fechar" : "Menu"}</span>
        </button>
      </nav>

      <div className={`mobile-menu ${open ? "open" : ""}`} {...(open ? {} : { inert: "" })}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href ?? item.to}
            item={item}
            onNavigate={closeMenu}
            style={item.cta ? { color: "var(--blush-400)" } : undefined}
          />
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
    <header className="hero lantern-zone" id="inicio">
      <FloatingLanterns scoped interactive={false} count={4} textColumn="left" />
      <div className="hero-grid">
        <div className={`hero-content hero-stagger ${ready ? "ready" : ""}`}>
          <p className="hero-kicker">Convite de casamento</p>
          <p className="hero-date">{WEDDING.dateLabel}</p>
          <h1 className="hero-names">
            {WEDDING.groom}
            <span className="amp">&amp;</span>
            {WEDDING.bride}
          </h1>
          <p className="hero-sub">Vamos celebrar esse dia com você.</p>
          <p className="hero-intro">
            Depois de tantos capítulos importantes, chegou a hora de reunir quem faz parte da
            nossa história para o nosso sim.
          </p>
          <div className="hero-meta">
            <span className="hero-meta-item">
              <span className="hero-meta-label">Cerimônia</span>
              <b>{WEDDING.timeLabel}</b>
            </span>
            <span className="hero-meta-item">
              <span className="hero-meta-label">Local</span>
              <b>{WEDDING.venue}</b>
            </span>
            <span className="hero-meta-item">
              <span className="hero-meta-label">Cidade</span>
              <b>Paulínia/SP</b>
            </span>
          </div>
          <div className="hero-ctas">
            <Link to="/confirmar" className="btn btn-gold">
              <Icon name="Heart" size={18} /> Confirmar presença
            </Link>
            <Link to="/presentes" className="btn btn-ghost">
              <Icon name="Gift" size={18} /> Ver lista de presentes
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-inner">
            <div className="hero-photo-frame hero-photo-frame--main">
              <img
                className="hero-photo-main"
                src="/photos/ensaio-1.jpg"
                alt="Tiago e Gabriela à beira do lago"
                onError={(event) => {
                  event.currentTarget.parentElement.style.display = "none";
                }}
              />
            </div>
            <div className="hero-photo-frame hero-photo-frame--accent">
              <img
                className="hero-photo-accent"
                src="/photos/ensaio-4.jpg"
                alt="Tiago e Gabriela mostrando o anel de noivado"
                onError={(event) => {
                  event.currentTarget.parentElement.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-hint">
        <span>Role para começar</span>
        <Icon name="ChevronDown" size={18} />
      </div>
    </header>
  );
}
