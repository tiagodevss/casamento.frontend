import { useEffect, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";
import { GUEST_SIDES } from "./AdminGuests";

function pct(n, total) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

function StatCard({ icon, label, value, hint, tone = "info" }) {
  return (
    <div className="adm-stat-card">
      <div className={`adm-stat-card-icon adm-stat-card-icon--${tone}`} aria-hidden="true">
        <Icon name={icon} size={18} />
      </div>
      <div className="adm-stat-card-body">
        <p className="adm-stat-card-label">{label}</p>
        <p className="adm-stat-card-value">{value}</p>
        {hint ? <p className="adm-stat-card-hint">{hint}</p> : null}
      </div>
    </div>
  );
}

function StatSection({ title, children, columns }) {
  const gridClass =
    columns === 3 ? "adm-stat-grid adm-stat-grid-3" : "adm-stat-grid";

  return (
    <section className="adm-stat-section">
      <h2 className="adm-stat-section-title">{title}</h2>
      <div className={gridClass}>{children}</div>
    </section>
  );
}

function PresenceBar({ attending, notAttending, pending, total }) {
  if (!total) return null;

  const segments = [
    { key: "attending", value: attending, label: "Vão", tone: "success" },
    { key: "notAttending", value: notAttending, label: "Não vão", tone: "danger" },
    { key: "pending", value: pending, label: "Pendentes", tone: "warning" },
  ].filter((seg) => seg.value > 0);

  return (
    <div className="adm-progress-block" aria-label="Distribuição de presença">
      <div className="adm-progress" role="img" aria-label={`${attending} vão, ${notAttending} não vão, ${pending} pendentes`}>
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`adm-progress-seg adm-progress-seg--${seg.tone}`}
            style={{ width: `${(seg.value / total) * 100}%` }}
            title={`${seg.label}: ${seg.value}`}
          />
        ))}
      </div>
      <ul className="adm-progress-legend">
        {segments.map((seg) => (
          <li key={seg.key}>
            <span className={`adm-progress-dot adm-progress-dot--${seg.tone}`} aria-hidden="true" />
            {seg.label} · {seg.value} ({pct(seg.value, total)}%)
          </li>
        ))}
      </ul>
    </div>
  );
}

function Funnel({ members }) {
  const steps = [
    { key: "total", label: "Cadastrados", value: members.total, icon: "Mail" },
    { key: "sent", label: "Enviados", value: members.inviteSent, icon: "Send" },
    { key: "responded", label: "Respondidos", value: members.responded, icon: "CheckCircle2" },
  ];
  const max = Math.max(members.total, 1);

  return (
    <section className="adm-stat-section">
      <h2 className="adm-stat-section-title">Funil de convidados</h2>
      <div className="adm-funnel adm-card adm-card-pad">
        {steps.map((step, index) => (
          <div key={step.key} className="adm-funnel-step">
            {index > 0 ? (
              <div className="adm-funnel-connector" aria-hidden="true">
                <Icon name="ChevronRight" size={14} />
              </div>
            ) : null}
            <div className="adm-funnel-card">
              <div className="adm-funnel-head">
                <span className="adm-funnel-icon" aria-hidden="true">
                  <Icon name={step.icon} size={15} />
                </span>
                <span className="adm-funnel-label">{step.label}</span>
              </div>
              <p className="adm-funnel-value">{step.value}</p>
              <p className="adm-funnel-pct">{pct(step.value, max)}% dos convidados</p>
              <div className="adm-funnel-bar" aria-hidden="true">
                <div className="adm-funnel-bar-fill" style={{ width: `${(step.value / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Insights({ groups, onNavigateToGuests }) {
  const items = [];

  if (groups.inviteNotSent > 0) {
    items.push({
      key: "not_sent",
      icon: "Send",
      tone: "warning",
      title: `Enviar ${groups.inviteNotSent} ${groups.inviteNotSent === 1 ? "convite" : "convites"}`,
      detail: "Ainda não marcados como enviados",
      action: () => onNavigateToGuests?.({ statusFilter: "not_sent" }),
      actionLabel: "Ver não enviados",
    });
  }

  if (groups.pendingResponse > 0) {
    items.push({
      key: "pending",
      icon: "Clock",
      tone: "info",
      title: `${groups.pendingResponse} aguardando resposta`,
      detail: "Convites sem confirmação de presença",
      action: () => onNavigateToGuests?.({ statusFilter: "pending" }),
      actionLabel: "Ver pendentes",
    });
  }

  return (
    <section className="adm-stat-section">
      <h2 className="adm-stat-section-title">Próximos passos</h2>
      {items.length === 0 ? (
        <div className="adm-card adm-card-pad adm-insight-empty">
          <span className="adm-stat-card-icon adm-stat-card-icon--success" aria-hidden="true">
            <Icon name="CheckCircle2" size={18} />
          </span>
          <div>
            <p className="adm-insight-title">Tudo em dia</p>
            <p className="adm-hint" style={{ margin: 0 }}>
              Todos os convites foram enviados e respondidos.
            </p>
          </div>
        </div>
      ) : (
        <ul className="adm-insight-list">
          {items.map((item) => (
            <li key={item.key} className="adm-card adm-insight-item">
              <span className={`adm-stat-card-icon adm-stat-card-icon--${item.tone}`} aria-hidden="true">
                <Icon name={item.icon} size={18} />
              </span>
              <div className="adm-insight-body">
                <p className="adm-insight-title">{item.title}</p>
                <p className="adm-hint" style={{ margin: 0 }}>
                  {item.detail}
                </p>
              </div>
              {onNavigateToGuests ? (
                <button type="button" className="adm-btn adm-btn-secondary adm-btn-sm" onClick={item.action}>
                  {item.actionLabel}
                  <Icon name="ChevronRight" size={13} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SideBreakdown({ bySide }) {
  if (!bySide) return null;

  return (
    <div className="adm-card adm-card-pad">
      <h2 className="adm-stat-section-title" style={{ marginBottom: "1rem" }}>
        Por lado
      </h2>

      <div className="adm-side-bars">
        {GUEST_SIDES.map(({ value, label }) => {
          const row = bySide[value] ?? {
            groups: 0,
            members: 0,
            responded: 0,
            attending: 0,
            notAttending: 0,
            pending: 0,
          };
          const total = row.members || 0;
          return (
            <div key={value} className="adm-side-bar-row">
              <div className="adm-side-bar-meta">
                <span className="adm-side-bar-label">{label}</span>
                <span className="adm-hint">
                  {row.attending} vão · {row.pending} pend. · {row.members} pessoas
                </span>
              </div>
              {total > 0 ? (
                <div
                  className="adm-progress adm-progress-sm"
                  role="img"
                  aria-label={`${label}: ${row.attending} vão, ${row.notAttending} não vão, ${row.pending} pendentes`}
                >
                  {row.attending > 0 ? (
                    <div
                      className="adm-progress-seg adm-progress-seg--success"
                      style={{ width: `${(row.attending / total) * 100}%` }}
                    />
                  ) : null}
                  {row.notAttending > 0 ? (
                    <div
                      className="adm-progress-seg adm-progress-seg--danger"
                      style={{ width: `${(row.notAttending / total) * 100}%` }}
                    />
                  ) : null}
                  {row.pending > 0 ? (
                    <div
                      className="adm-progress-seg adm-progress-seg--warning"
                      style={{ width: `${(row.pending / total) * 100}%` }}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="adm-progress adm-progress-sm adm-progress-empty" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>

      <div className="adm-side-table-wrap" style={{ marginTop: "1.25rem" }}>
        <table className="adm-side-table">
          <thead>
            <tr>
              <th scope="col">Lado</th>
              <th scope="col">Convites</th>
              <th scope="col">Pessoas</th>
              <th scope="col">Respondidos</th>
              <th scope="col">Vão</th>
              <th scope="col">Não vão</th>
              <th scope="col">Pendentes</th>
            </tr>
          </thead>
          <tbody>
            {GUEST_SIDES.map(({ value, label }) => {
              const row = bySide[value] ?? {
                groups: 0,
                members: 0,
                responded: 0,
                attending: 0,
                notAttending: 0,
                pending: 0,
              };
              return (
                <tr key={value}>
                  <td>{label}</td>
                  <td>{row.groups}</td>
                  <td>{row.members}</td>
                  <td>{row.responded}</td>
                  <td>{row.attending}</td>
                  <td>{row.notAttending}</td>
                  <td>{row.pending}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="adm-dashboard" aria-busy="true" aria-label="Carregando estatísticas">
      <div className="adm-skeleton adm-skeleton-hero" />
      <div className="adm-skeleton adm-skeleton-block" />
      <div className="adm-stat-grid">
        <div className="adm-skeleton adm-skeleton-card" />
        <div className="adm-skeleton adm-skeleton-card" />
        <div className="adm-skeleton adm-skeleton-card" />
      </div>
    </div>
  );
}

function ClickableStatCard({ icon, label, value, hint, tone = "info", onClick }) {
  if (!onClick) {
    return <StatCard icon={icon} label={label} value={value} hint={hint} tone={tone} />;
  }

  return (
    <button type="button" className="adm-stat-card adm-stat-card-button" onClick={onClick}>
      <div className={`adm-stat-card-icon adm-stat-card-icon--${tone}`} aria-hidden="true">
        <Icon name={icon} size={18} />
      </div>
      <div className="adm-stat-card-body">
        <p className="adm-stat-card-label">{label}</p>
        <p className="adm-stat-card-value">{value}</p>
        {hint ? <p className="adm-stat-card-hint">{hint}</p> : null}
      </div>
      <Icon name="ChevronRight" size={16} className="adm-stat-card-chevron" />
    </button>
  );
}

export function AdminDashboard({ onNavigateToGuests, onNavigateToTab }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getGuestStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  if (error && !stats) {
    return (
      <div>
        <p className="adm-error">{error}</p>
        <button type="button" className="adm-btn adm-btn-secondary" onClick={load}>
          <Icon name="RotateCcw" size={14} /> Tentar de novo
        </button>
      </div>
    );
  }

  const { groups, members, party, bySide, messages, diets } = stats;
  const responseRate = pct(members.responded, members.total);
  const attendingRate = pct(members.attending, members.total);
  const messagesCount = messages?.withText ?? 0;
  const dietsCount = diets?.withText ?? 0;

  return (
    <div className="adm-dashboard">
      <div className="adm-dashboard-toolbar">
        <p className="adm-hint" style={{ margin: 0 }}>
          Resumo de convidados, convites e confirmações
        </p>
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={load} disabled={loading}>
          <Icon name="RotateCcw" size={13} /> Atualizar
        </button>
      </div>

      {error && <p className="adm-error">{error}</p>}

      <section className="adm-dash-hero adm-card adm-card-pad" aria-label="Resumo de presença">
        <div className="adm-dash-hero-main">
          <p className="adm-dash-hero-eyebrow">Confirmados para o dia</p>
          <p className="adm-dash-hero-value">{members.attending}</p>
          <p className="adm-dash-hero-sub">
            {members.attending} de {members.total} pessoas · {attendingRate}% do total
          </p>
        </div>
        <div className="adm-dash-hero-side">
          <div className="adm-dash-hero-metric">
            <span className="adm-dash-hero-metric-label">Taxa de confirmação</span>
            <span className="adm-dash-hero-metric-value">{responseRate}%</span>
            <span className="adm-hint">
              {members.responded} de {members.total} pessoas
            </span>
          </div>
          <div className="adm-dash-hero-metric">
            <span className="adm-dash-hero-metric-label">Aguardando</span>
            <span className="adm-dash-hero-metric-value">{members.pendingResponse}</span>
            <span className="adm-hint">pessoas sem resposta</span>
          </div>
        </div>
      </section>

      <Funnel members={members} />

      <StatSection title="Tipos de convite">
        <StatCard
          icon="CalendarHeart"
          label="Somente cerimônia"
          value={members.ceremonyOnly}
          hint="pessoas convidadas apenas para a cerimônia"
          tone="info"
        />
        <StatCard
          icon="PartyPopper"
          label="Cerimônia + festa"
          value={members.ceremonyAndParty}
          hint="pessoas convidadas para os dois momentos"
          tone="info"
        />
      </StatSection>

      <section className="adm-stat-section">
        <h2 className="adm-stat-section-title">Presença (pessoas)</h2>
        <div className="adm-stat-grid adm-stat-grid-3">
          <StatCard icon="Check" label="Vão" value={members.attending} tone="success" />
          <StatCard icon="X" label="Não vão" value={members.notAttending} tone="danger" />
          <StatCard icon="Clock" label="Pendentes" value={members.pending} tone="warning" />
        </div>
        <PresenceBar
          attending={members.attending}
          notAttending={members.notAttending}
          pending={members.pending}
          total={members.total}
        />
      </section>
      {party.invited > 0 ? (
        <StatSection title="Festa">
          <StatCard
            icon="Wine"
            label="Convidados"
            value={party.invited}
            hint="pessoas convidadas para a festa"
            tone="info"
          />
          <StatCard icon="Check" label="Confirmados" value={party.attending} tone="success" />
          <StatCard icon="X" label="Não vão" value={party.notAttending} tone="danger" />
          <StatCard icon="Clock" label="Pendentes" value={party.pending} tone="warning" />
        </StatSection>
      ) : null}

      <StatSection title="Recados e restrições">
        <ClickableStatCard
          icon="MessageCircleHeart"
          label="Recados"
          value={messagesCount}
          hint={messagesCount === 1 ? "mensagem na confirmação" : "mensagens na confirmação"}
          tone="info"
          onClick={onNavigateToTab ? () => onNavigateToTab("messages") : undefined}
        />
        <ClickableStatCard
          icon="UtensilsCrossed"
          label="Restrições"
          value={dietsCount}
          hint={dietsCount === 1 ? "restrição alimentar" : "restrições alimentares"}
          tone="warning"
          onClick={onNavigateToTab ? () => onNavigateToTab("diets") : undefined}
        />
      </StatSection>

      <Insights groups={groups} onNavigateToGuests={onNavigateToGuests} />

      <SideBreakdown bySide={bySide} />
    </div>
  );
}
