import { useEffect, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const emptyForm = {
  displayName: "",
  searchNames: "",
  invitedToParty: false,
  phone: "",
  notes: "",
};

function toForm(group) {
  return {
    displayName: group.displayName,
    searchNames: group.searchNames.join(", "),
    invitedToParty: Boolean(group.invitedToParty),
    phone: group.phone ?? "",
    notes: group.notes ?? "",
  };
}

function toPayload(form) {
  return {
    displayName: form.displayName.trim(),
    searchNames: form.searchNames
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
    invitedToParty: Boolean(form.invitedToParty),
    phone: form.phone.trim() || undefined,
    notes: form.notes.trim() || undefined,
  };
}

function GuestGroupForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ? toForm(initial) : emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.displayName.trim() || !form.searchNames.trim()) {
      setError("Preencha nome de exibição e ao menos um nome de busca");
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      const saved = initial
        ? await api.updateGuestGroup(initial.id, payload)
        : await api.createGuestGroup(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="glass" style={{ padding: "1.6rem", marginBottom: "1.6rem" }} onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field full">
          <label>Nome de exibição</label>
          <input
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            placeholder="Família Silva"
          />
        </div>
        <div className="field full">
          <label>Nomes de busca (separados por vírgula)</label>
          <input
            value={form.searchNames}
            onChange={(event) => updateField("searchNames", event.target.value)}
            placeholder="Maria Silva, João Silva"
          />
        </div>
        <div className="field">
          <label>Telefone</label>
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="(19) 99999-9999"
          />
        </div>
        <div className="field">
          <label style={{ marginBottom: ".5rem" }}>Convite extra</label>
          <label style={{ display: "flex", alignItems: "center", gap: ".6rem", color: "var(--text-dim)" }}>
            <input
              type="checkbox"
              checked={form.invitedToParty}
              onChange={(event) => updateField("invitedToParty", event.target.checked)}
            />
            Convidado para a festa
          </label>
        </div>
        <div className="field full">
          <label>Notas</label>
          <input
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Observações internas"
          />
        </div>
      </div>
      <span className="err-msg">{error}</span>
      <div style={{ display: "flex", gap: ".8rem", marginTop: "1.2rem" }}>
        <button type="submit" className="btn btn-gold" disabled={saving}>
          <Icon name="Check" size={16} /> {saving ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function AdminDashboard() {
  const { session, logout } = useAuth();
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const data = await api.listGuestGroups();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (group) => {
    if (!confirm(`Remover o convite de "${group.displayName}"?`)) return;
    try {
      await api.deleteGuestGroup(group.id);
      setGroups((current) => current.filter((item) => item.id !== group.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaved = (saved) => {
    setGroups((current) => {
      if (!current) return [saved];
      const exists = current.some((item) => item.id === saved.id);
      return exists ? current.map((item) => (item.id === saved.id ? { ...item, ...saved } : item)) : [...current, saved];
    });
    setEditing(null);
    setCreating(false);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "clamp(1.4rem, 4vw, 3rem)" }}>
      <div className="sky-backdrop" />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.6rem" }}>
          <div>
            <span className="eyebrow">Painel administrativo</span>
            <h1 className="section-title" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", marginTop: ".3rem" }}>
              Convidados{session?.name ? ` — ${session.name}` : ""}
            </h1>
          </div>
          <button className="btn btn-ghost" onClick={logout}>
            <Icon name="LogOut" size={16} /> Sair
          </button>
        </div>

        {!creating && !editing && (
          <button className="btn btn-gold" style={{ marginBottom: "1.6rem" }} onClick={() => setCreating(true)}>
            <Icon name="Plus" size={16} /> Novo convidado
          </button>
        )}

        {creating && (
          <GuestGroupForm onCancel={() => setCreating(false)} onSaved={handleSaved} />
        )}

        {error && <p className="err-msg">{error}</p>}

        {groups === null && !error && <p style={{ color: "var(--text-dim)" }}>Carregando...</p>}

        {groups && (
          <div style={{ display: "grid", gap: "1rem" }}>
            {groups.map((group) =>
              editing?.id === group.id ? (
                <GuestGroupForm
                  key={group.id}
                  initial={group}
                  onCancel={() => setEditing(null)}
                  onSaved={handleSaved}
                />
              ) : (
                <div key={group.id} className="glass" style={{ padding: "1.2rem 1.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".8rem" }}>
                    <div>
                      <strong style={{ color: "var(--cream)", fontSize: "1.05rem" }}>{group.displayName}</strong>
                      <p style={{ color: "var(--text-dim)", margin: ".3rem 0 0", fontSize: ".85rem" }}>
                        {group.searchNames.join(", ")}
                      </p>
                      <p style={{ color: "var(--text-dim)", margin: ".2rem 0 0", fontSize: ".8rem" }}>
                        {group.phone ?? ""}
                      </p>
                      <p style={{ color: "var(--text-dim)", margin: ".25rem 0 0", fontSize: ".78rem" }}>
                        {group.invitedToParty ? "Inclui convite para a festa" : "Somente cerimônia"}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ".5rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ".3rem" }}>
                        <span
                          style={{
                            fontSize: ".75rem",
                            color: group.rsvpResponse
                              ? group.rsvpResponse.attending
                                ? "var(--gold-400)"
                                : "var(--rose)"
                              : "var(--text-dim)",
                          }}
                        >
                          {group.rsvpResponse
                            ? group.rsvpResponse.attending
                              ? "Cerimônia confirmada"
                              : "Cerimônia: não vai"
                            : "Cerimônia: sem resposta"}
                        </span>
                        {group.invitedToParty && (
                          <span
                            style={{
                              fontSize: ".72rem",
                              color:
                                group.rsvpResponse?.partyAttending === true
                                  ? "var(--gold-400)"
                                  : group.rsvpResponse?.partyAttending === false
                                    ? "var(--rose)"
                                    : "var(--text-dim)",
                            }}
                          >
                            {group.rsvpResponse?.partyAttending === true
                              ? "Festa confirmada"
                              : group.rsvpResponse?.partyAttending === false
                                ? "Festa: não vai"
                                : "Festa: sem resposta"}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: ".5rem" }}>
                        <button className="btn btn-ghost" onClick={() => setEditing(group)}>
                          <Icon name="Pencil" size={14} /> Editar
                        </button>
                        <button className="btn btn-ghost" onClick={() => remove(group)}>
                          <Icon name="Trash2" size={14} /> Remover
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
