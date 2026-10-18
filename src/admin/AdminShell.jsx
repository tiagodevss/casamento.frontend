import { useCallback, useState } from "react";

import { Icon } from "../effects";
import { useAuth } from "./AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import { AdminDiets } from "./AdminDiets";
import { AdminGuests } from "./AdminGuests";
import { AdminMessages } from "./AdminMessages";
import { AdminSettings } from "./AdminSettings";
import { AdminCerimonialista } from "./AdminCerimonialista";
import "./admin.css";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutGrid" },
  { id: "guests", label: "Convidados", icon: "Users" },
  { id: "cerimonialista", label: "Cerimonialista", icon: "MessageCircleHeart" },
  { id: "messages", label: "Recados", icon: "MessageCircleHeart" },
  { id: "diets", label: "Restrições", icon: "UtensilsCrossed" },
  { id: "settings", label: "Configurações", icon: "Settings" },
];

export function AdminShell() {
  const { session, logout } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [guestsFilter, setGuestsFilter] = useState(null);
  const activeTab = TABS.find((item) => item.id === tab);

  const navigateToGuests = useCallback((filter = null) => {
    setGuestsFilter(filter);
    setTab("guests");
  }, []);

  const navigateToTab = useCallback((nextTab) => {
    if (nextTab !== "guests") {
      setGuestsFilter(null);
    }
    setTab(nextTab);
  }, []);

  const consumeGuestsFilter = useCallback(() => {
    setGuestsFilter(null);
  }, []);

  const handleTabChange = (nextTab) => {
    navigateToTab(nextTab);
  };

  return (
    <div className="adm">
      <div className="adm-layout">
        <aside className="adm-sidebar">
          <div className="adm-brand">
            <div className="adm-brand-mark">
              <Icon name="LayoutGrid" size={16} />
            </div>
            <span className="adm-brand-name">Painel do casamento</span>
          </div>

          <nav className="adm-nav" aria-label="Seções do painel">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`adm-nav-item ${tab === item.id ? "is-active" : ""}`}
                onClick={() => handleTabChange(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
              >
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="adm-sidebar-footer">
            <button className="adm-btn adm-btn-ghost adm-btn-block" onClick={logout}>
              <Icon name="LogOut" size={15} /> Sair
            </button>
          </div>
        </aside>

        <div className="adm-main">
          <header className="adm-topbar">
            <span className="adm-topbar-title">
              {activeTab?.label}
              {session?.name && <span className="adm-topbar-sub">{session.name}</span>}
            </span>
          </header>

          <div className="adm-content">
            {tab === "dashboard" ? (
              <AdminDashboard
                onNavigateToGuests={navigateToGuests}
                onNavigateToTab={navigateToTab}
              />
            ) : null}
            {tab === "guests" ? (
              <AdminGuests initialFilter={guestsFilter} onFilterConsumed={consumeGuestsFilter} />
            ) : null}
            {tab === "cerimonialista" ? <AdminCerimonialista /> : null}
            {tab === "messages" ? <AdminMessages /> : null}
            {tab === "diets" ? <AdminDiets /> : null}
            {tab === "settings" ? <AdminSettings /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
