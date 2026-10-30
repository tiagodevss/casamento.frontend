import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../api";

const STATUS_VIEW = {
  READY: { tone: "ok", title: "Ingresso válido", emoji: "🎟️" },
  ALREADY_IN: { tone: "warn", title: "Este QR Code já foi usado", emoji: "⚠️" },
  INVALID: { tone: "bad", title: "Ingresso inválido", emoji: "⛔" },
};

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

/** Tela da porta: abre ao ler o QR Code do convidado com a câmera do celular (admin logado). */
export default function AdminCheckin() {
  const { token } = useParams();
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // True só na leitura em que este aparelho acabou de liberar a entrada.
  const [justAdmitted, setJustAdmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .lookupCheckin(token)
      .then((data) => !cancelled && setState(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const run = useCallback(
    async (action, admitted = false) => {
      setBusy(true);
      setError("");
      try {
        setState(await action(token));
        setJustAdmitted(admitted);
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    },
    [token],
  );

  const view = !state
    ? null
    : justAdmitted && state.status === "ALREADY_IN"
      ? { tone: "ok", title: "Entrada registrada", emoji: "✅" }
      : STATUS_VIEW[state.status];

  return (
    <main className="checkin">
      <h1 className="checkin__heading">Entrada da festa</h1>

      {error && (
        <p className="checkin__card checkin__card--bad" role="alert">
          {error}
        </p>
      )}
      {!error && !state && <p className="checkin__muted">Lendo ingresso...</p>}

      {state && view && (
        <section className={`checkin__card checkin__card--${view.tone}`} aria-live="polite">
          <p className="checkin__status">
            <span aria-hidden="true">{view.emoji}</span> {view.title}
          </p>
          <p className="checkin__name">{state.displayName}</p>
          {state.status !== "INVALID" && (
            <p className="checkin__people">
              {state.peopleCount} {state.peopleCount === 1 ? "pessoa" : "pessoas"}:{" "}
              {state.people.join(", ")}
            </p>
          )}
          {state.status === "INVALID" && (
            <p className="checkin__people">Este convite não tem presença na festa confirmada.</p>
          )}
          {state.status === "ALREADY_IN" && (
            <p className="checkin__people">Entrada registrada em {formatTime(state.checkedInAt)}.</p>
          )}

          {state.status === "READY" && (
            <button
              type="button"
              className="checkin__btn checkin__btn--primary"
              disabled={busy}
              onClick={() => run(api.checkIn, true)}
            >
              {busy ? "Registrando..." : "Liberar entrada"}
            </button>
          )}
          {state.status === "ALREADY_IN" && (
            <button
              type="button"
              className="checkin__btn"
              disabled={busy}
              onClick={() => run(api.undoCheckin)}
            >
              {busy ? "Desfazendo..." : "Desfazer (foi engano)"}
            </button>
          )}
        </section>
      )}
    </main>
  );
}
