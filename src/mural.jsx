import { Link, useLocation } from "react-router-dom";

import { WEDDING } from "./data";
import { FloatingLanterns, MiniLantern } from "./effects";
import { ContactHelp } from "./ContactHelp";
import { NAV_ITEMS, goToSection, homeSectionPath } from "./navigation";

function FooterLink({ item }) {
  const location = useLocation();
  const onHome = location.pathname === "/";

  if (item.type === "route") {
    return <Link to={item.to}>{item.label}</Link>;
  }

  if (onHome) {
    return (
      <a href={item.href} onClick={(event) => goToSection(event, item.href)}>
        {item.label}
      </a>
    );
  }

  return <Link to={homeSectionPath(item.href)}>{item.label}</Link>;
}

export function Footer() {
  return (
    <footer className="footer lantern-zone">
      <FloatingLanterns scoped count={4} interactive={false} />
      <div className="reveal">
        <MiniLantern size={56} />
      </div>
      <div className="f-names reveal d1" style={{ marginTop: "1.4rem" }}>
        {WEDDING.groom} <span className="amp">&amp;</span> {WEDDING.bride}
      </div>
      <p className="f-quote reveal d2">Obrigado por fazer parte desse momento com a gente.</p>
      <div className="f-links reveal d2">
        {NAV_ITEMS.map((item) => (
          <FooterLink key={item.href ?? item.to} item={item} />
        ))}
      </div>
      <div className="f-date reveal d2">{WEDDING.dateLabel} · Paulínia / SP</div>
      <ContactHelp context="geral" compact />
      <div className="f-credit reveal d3">
        {WEDDING.namesDisplay} · {new Date().getFullYear()}
      </div>
    </footer>
  );
}
