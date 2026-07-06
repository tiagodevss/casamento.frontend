import { useState } from "react";

import { Icon } from "../effects";
import { useAuth } from "./AuthContext";
import { AdminGuests } from "./AdminGuests";
import { AdminGifts } from "./AdminGifts";

const TABS = [
  { id: "guests", label: "Convidados" },
  { id: "gifts", label: "Presentes" },
];

export function AdminShell() {
  const { session, logout } = useAuth();
  const [tab, setTab] = useState("guests");

  return (
    <div style={{ minHeight: "100vh", padding: "clamp(1.4rem, 4vw, 3rem)" }}>
      <div className="sky-backdrop" />
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.6rem",
          }}
        >
          <div>
            <span className="eyebrow">Painel administrativo</span>
            <h1 className="section-title" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", marginTop: ".3rem" }}>
              {tab === "guests" ? "Convidados" : "Presentes"}
              {session?.name ? ` — ${session.name}` : ""}
            </h1>
          </div>
          <button className="btn btn-ghost" onClick={logout}>
            <Icon name="X" size={16} /> Sair
          </button>
        </div>

        <nav
          className="admin-tabs"
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.8rem",
            flexWrap: "wrap",
          }}
          aria-label="Seções do painel"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`btn ${tab === item.id ? "btn-gold" : "btn-ghost"}`}
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "guests" ? <AdminGuests /> : <AdminGifts />}
      </div>
    </div>
  );
}
