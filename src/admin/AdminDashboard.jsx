import { useEffect, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";
import { GUEST_SIDES } from "./AdminGuests";

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-card-icon" aria-hidden="true">
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

function StatSection({ title, children }) {
  return (
    <section className="adm-stat-section">
      <h2 className="adm-stat-section-title">{title}</h2>
      <div className="adm-stat-grid">{children}</div>
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
      <div className="adm-side-table-wrap">
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

export function AdminDashboard() {
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
    return <p className="adm-hint">Carregando estatísticas...</p>;
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

  const { groups, members, party, bySide } = stats;

  return (
    <div className="adm-dashboard">
      <div className="adm-dashboard-toolbar">
        <p className="adm-hint" style={{ margin: 0 }}>
          Resumo dos convites e confirmações
        </p>
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={load} disabled={loading}>
          <Icon name="RotateCcw" size={13} /> Atualizar
        </button>
      </div>

      {error && <p className="adm-error">{error}</p>}

      <StatSection title="Visão geral">
        <StatCard icon="Users" label="Convidados" value={members.total} hint="Pessoas no total" />
        <StatCard icon="Mail" label="Convites" value={groups.total} hint="Grupos cadastrados" />
        <StatCard
          icon="Send"
          label="Enviados"
          value={groups.inviteSent}
          hint={`${groups.inviteNotSent} ainda não enviados`}
        />
        <StatCard
          icon="CheckCircle2"
          label="RSVPs"
          value={groups.responded}
          hint={`${groups.pendingResponse} pendentes`}
        />
      </StatSection>

      <StatSection title="Presença (pessoas)">
        <StatCard icon="Check" label="Vão" value={members.attending} />
        <StatCard icon="X" label="Não vão" value={members.notAttending} />
        <StatCard icon="Clock" label="Pendentes" value={members.pending} />
      </StatSection>

      <StatSection title="Festa">
        <StatCard icon="Wine" label="Convidados" value={party.invited} hint="Convites com festa" />
        <StatCard icon="Check" label="Confirmados" value={party.attending} />
        <StatCard icon="X" label="Não vão" value={party.notAttending} />
        <StatCard icon="Clock" label="Pendentes" value={party.pending} />
      </StatSection>

      <SideBreakdown bySide={bySide} />
    </div>
  );
}
