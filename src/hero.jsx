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
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        {onHome ? (
          <a href="#inicio" className="nav-brand" onClick={(event) => goToSection(event, "#inicio")}>
            <Icon name="Sparkles" size={18} style={{ color: "var(--blush-400)" }} />
            T <span className="amp">&amp;</span> G
          </a>
        ) : (
          <Link to="/" className="nav-brand">
            <Icon name="Sparkles" size={18} style={{ color: "var(--blush-400)" }} />
            T <span className="amp">&amp;</span> G
          </Link>
        )}
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.href ?? item.to}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
        <button className="nav-toggle" onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open}>
          <Icon name="Menu" size={22} />
          <span className="nav-toggle-label">Menu</span>
        </button>
      </nav>

      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <button
          className="nav-toggle"
          style={{ position: "absolute", top: "1.1rem", right: "1.25rem" }}
          onClick={closeMenu}
          aria-label="Fechar menu"
        >
          <Icon name="X" size={22} />
        </button>
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
      <FloatingLanterns scoped interactive count={7} />
      <div className="hero-grid">
        <div className={`hero-content hero-stagger ${ready ? "ready" : ""}`}>
          <p className="hero-date">{WEDDING.dateLabel}</p>
          <h1 className="hero-names">
            {WEDDING.groom}
            <span className="amp">&amp;</span>
            {WEDDING.bride}
          </h1>
          <p className="hero-sub">O nosso melhor capítulo começa aqui</p>
          <div className="hero-meta">
            <span>
              <b>{WEDDING.timeLabel}</b>
            </span>
            <span className="sep" aria-hidden="true" />
            <span>{WEDDING.venue}</span>
            <span className="sep" aria-hidden="true" />
            <span>Paulínia/SP</span>
          </div>
          <p className="hero-quote">
            Entre lanternas, sonhos e promessas, convidamos você para viver conosco o início da
            nossa maior aventura.
          </p>
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
            <div className="hero-photo-frame hero-photo-frame--main ornate">
              <img
                className="hero-photo-main"
                src="/photos/ensaio-1.jpg"
                alt="Tiago e Gabriela à beira do lago"
                onError={(event) => {
                  event.currentTarget.parentElement.style.display = "none";
                }}
              />
              <span className="corner tl" />
              <span className="corner tr" />
              <span className="corner bl" />
              <span className="corner br" />
            </div>
            <div className="hero-photo-frame hero-photo-frame--accent ornate">
              <img
                className="hero-photo-accent"
                src="/photos/ensaio-4.jpg"
                alt="Tiago e Gabriela mostrando o anel de noivado"
                onError={(event) => {
                  event.currentTarget.parentElement.style.display = "none";
                }}
              />
              <span className="corner tl" />
              <span className="corner tr" />
              <span className="corner bl" />
              <span className="corner br" />
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
