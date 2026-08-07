import { useEffect, useMemo, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";
import { DEFAULT_INVITE_MESSAGE_TEMPLATE, fillInviteMessage, giftListLink } from "./inviteMessage";

const PREVIEW = {
  displayName: "Família Silva",
  members: [{ name: "Maria" }, { name: "João" }],
  link: `${typeof window !== "undefined" ? window.location.origin : "https://exemplo.com"}/?convite=exemplo`,
  giftLink: giftListLink(
    "exemplo",
    typeof window !== "undefined" ? window.location.origin : "https://exemplo.com",
  ),
};

export function AdminSettings() {
  const [template, setTemplate] = useState(DEFAULT_INVITE_MESSAGE_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getSettings();
        if (!cancelled) setTemplate(data.inviteMessageTemplate ?? DEFAULT_INVITE_MESSAGE_TEMPLATE);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!saved) return undefined;
    const timer = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [saved]);

  const preview = useMemo(() => fillInviteMessage(template, PREVIEW), [template]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api.updateSettings({ inviteMessageTemplate: template });
      setTemplate(data.inviteMessageTemplate);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="adm-hint">Carregando configurações...</p>;
  }

  return (
    <form className="adm-card adm-card-pad" onSubmit={submit} noValidate>
      <div className="adm-field adm-field-full">
        <label htmlFor="invite-message-template">Mensagem pronta do convite</label>
        <textarea
          id="invite-message-template"
          className="adm-textarea"
          rows={8}
          value={template}
          onChange={(event) => setTemplate(event.target.value)}
          placeholder="Olá, {{nome}}! Confirmem aqui: {{link}}"
        />
        <span className="adm-hint">
          Variáveis: <code>{"{{nome}}"}</code>, <code>{"{{link}}"}</code>, <code>{"{{presentes}}"}</code>,{" "}
          <code>{"{{pessoas}}"}</code>. A mensagem precisa incluir <code>{"{{link}}"}</code>.
        </span>
      </div>

      <div className="adm-field adm-field-full" style={{ marginTop: "1.25rem" }}>
        <label>Pré-visualização</label>
        <pre className="adm-message-preview">{preview || "—"}</pre>
      </div>

      {error && (
        <span className="adm-error" style={{ display: "block", marginTop: "0.85rem" }}>
          {error}
        </span>
      )}

      <div style={{ display: "flex", gap: ".6rem", marginTop: "1.1rem", alignItems: "center" }}>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
          <Icon name="Check" size={16} /> {saving ? "Salvando..." : "Salvar"}
        </button>
        {saved && <span className="adm-hint">Configurações salvas.</span>}
      </div>
    </form>
  );
}
