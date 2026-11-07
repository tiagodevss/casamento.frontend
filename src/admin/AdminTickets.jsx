import { useCallback, useEffect, useMemo, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Ainda não entraram" },
  { id: "entered", label: "Já entraram" },
];

function normalizeForCompare(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function ticketMessage(ticket) {
  return `Oi! 🥂💛 Aqui está o QR Code de entrada de vocês na nossa festa:\n\n🎟️ ${ticket.ticketUrl}\n\nAbram o link e mostrem o QR Code na entrada da chácara (pode ser um print da tela). Cada QR Code vale uma única entrada. 💍`;
}

/** Lista dos ingressos da festa: quem tem QR Code, o link e quem já entrou. */
export function AdminTickets() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sendingId, setSendingId] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setData(await api.listTickets());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tickets = useMemo(() => {
    if (!data) return [];
    const needle = normalizeForCompare(query);
    return data.tickets.filter((ticket) => {
      if (filter === "entered" && ticket.status !== "ALREADY_IN") return false;
      if (filter === "pending" && ticket.status !== "READY") return false;
      if (!needle) return true;
      return normalizeForCompare([ticket.displayName, ...ticket.people].join(" ")).includes(needle);
    });
  }, [data, query, filter]);

  const copyLink = async (ticket) => {
    try {
      await navigator.clipboard.writeText(ticket.ticketUrl);
      setNotice(`Link de “${ticket.displayName}” copiado.`);
    } catch {
      window.prompt("Copie o link do ingresso:", ticket.ticketUrl);
    }
  };

  const sendLink = async (ticket) => {
    const ok = window.confirm(
      `Enviar o link do ingresso por WhatsApp para “${ticket.displayName}”?`,
    );
    if (!ok) return;
    setSendingId(ticket.id);
    setError("");
    setNotice("");
    try {
      await api.sendGuestCommunication(ticket.id, ticketMessage(ticket));
      setNotice(`Link enviado para “${ticket.displayName}”.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingId("");
    }
  };

  if (!data && !error) {
    return (
      <div className="adm-card adm-empty" aria-busy="true">
        Carregando ingressos…
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="adm-guests">
      <div className="adm-dashboard-toolbar">
        <p className="adm-hint" style={{ margin: 0 }}>
          Ingressos (QR Code) de quem confirmou a festa. Na portaria, leia o QR Code com a câmera
          do celular, logado no painel.
        </p>
        <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm" onClick={load}>
          <Icon name="RotateCcw" size={13} /> Atualizar
        </button>
      </div>

      {error ? <p className="adm-error">{error}</p> : null}
      {notice ? (
        <p className="adm-hint" role="status">
          {notice}
        </p>
      ) : null}

      {summary ? (
        <div className="adm-stat-grid">
          <StatCard
            icon="Ticket"
            label="Ingressos válidos"
            value={summary.groups}
            hint={`${summary.people} ${summary.people === 1 ? "pessoa" : "pessoas"}`}
            tone="info"
          />
          <StatCard
            icon="CheckCircle2"
            label="Já entraram"
            value={`${summary.enteredPeople} de ${summary.people}`}
            hint={`${summary.enteredGroups} de ${summary.groups} convites`}
            tone="success"
          />
          {summary.invalidGroups > 0 ? (
            <StatCard
              icon="CircleAlert"
              label="Ingressos inválidos"
              value={summary.invalidGroups}
              hint="Têm token, mas não confirmaram a festa"
              tone="warning"
            />
          ) : null}
        </div>
      ) : null}

      <div className="adm-guests-controls">
        <label className="adm-search-field">
          <Icon name="Search" size={15} />
          <input
            className="adm-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por convite ou pessoa…"
            aria-label="Buscar por convite ou pessoa"
          />
        </label>
        <select
          className="adm-select"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filtrar ingressos"
        >
          {FILTERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {data && tickets.length === 0 ? (
        <div className="adm-card adm-empty adm-empty-rich">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name="Ticket" size={20} />
          </span>
          <h2>Nenhum ingresso encontrado</h2>
          <p>
            {query || filter !== "all"
              ? "Nenhum resultado para os filtros atuais."
              : "Os ingressos aparecem aqui quando os convidados confirmam a festa."}
          </p>
        </div>
      ) : null}

      {tickets.length > 0 ? (
        <>
          <div className="adm-table-meta">
            <span>
              {tickets.length} {tickets.length === 1 ? "convite" : "convites"}
            </span>
          </div>
          <div className="adm-card adm-table-card">
            <div className="adm-table-wrap">
              <table className="adm-data-table">
                <thead>
                  <tr>
                    <th scope="col">Convite</th>
                    <th scope="col">Pessoas</th>
                    <th scope="col">Entrada</th>
                    <th scope="col" className="adm-col-actions">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <span className="adm-row-title">{ticket.displayName}</span>
                      </td>
                      <td>
                        <span className="adm-row-meta">
                          {ticket.peopleCount} {ticket.peopleCount === 1 ? "pessoa" : "pessoas"}
                          {ticket.people.length > 0 ? `: ${ticket.people.join(", ")}` : ""}
                        </span>
                      </td>
                      <td>
                        {ticket.status === "ALREADY_IN" ? (
                          <span className="adm-badge adm-badge-success">
                            Entrou {formatTime(ticket.checkedInAt)}
                          </span>
                        ) : ticket.status === "READY" ? (
                          <span className="adm-badge adm-badge-neutral">Aguardando</span>
                        ) : (
                          <span className="adm-badge adm-badge-danger">Inválido</span>
                        )}
                      </td>
                      <td className="adm-col-actions">
                        <div className="adm-row-actions">
                          <button
                            type="button"
                            className="adm-btn adm-btn-ghost adm-btn-sm"
                            onClick={() => copyLink(ticket)}
                          >
                            <Icon name="Copy" size={13} /> Copiar link
                          </button>
                          <a
                            className="adm-btn adm-btn-ghost adm-btn-sm"
                            href={ticket.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icon name="ExternalLink" size={13} /> Abrir
                          </a>
                          {ticket.hasPhone && ticket.status !== "INVALID" ? (
                            <button
                              type="button"
                              className="adm-btn adm-btn-secondary adm-btn-sm"
                              disabled={sendingId === ticket.id}
                              onClick={() => sendLink(ticket)}
                            >
                              <Icon name="Send" size={13} />{" "}
                              {sendingId === ticket.id ? "Enviando…" : "Reenviar"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
