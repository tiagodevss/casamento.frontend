import { useEffect, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";

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

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function RsvpBadge({ label, state }) {
  const variant = state === true ? "adm-badge-success" : state === false ? "adm-badge-danger" : "adm-badge-neutral";
  return <span className={`adm-badge ${variant}`}>{label}</span>;
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
    <form className="adm-card adm-card-pad" style={{ marginBottom: "1rem" }} onSubmit={submit} noValidate>
      <div className="adm-form-grid">
        <div className="adm-field adm-field-full">
          <label>Nome de exibição</label>
          <input
            className="adm-input"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            placeholder="Família Silva"
          />
        </div>
        <div className="adm-field adm-field-full">
          <label>Nomes de busca (separados por vírgula)</label>
          <input
            className="adm-input"
            value={form.searchNames}
            onChange={(event) => updateField("searchNames", event.target.value)}
            placeholder="Maria Silva, João Silva"
          />
        </div>
        <div className="adm-field">
          <label>Telefone</label>
          <input
            className="adm-input"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="(19) 99999-9999"
          />
        </div>
        <div className="adm-field">
          <label>Convite extra</label>
          <label className="adm-field-checkbox">
            <input
              type="checkbox"
              checked={form.invitedToParty}
              onChange={(event) => updateField("invitedToParty", event.target.checked)}
            />
            Convidado para a festa
          </label>
        </div>
        <div className="adm-field adm-field-full">
          <label>Notas</label>
          <input
            className="adm-input"
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Observações internas"
          />
        </div>
      </div>
      {error && (
        <span className="adm-error" style={{ display: "block", marginTop: "0.75rem" }}>
          {error}
        </span>
      )}
      <div style={{ display: "flex", gap: ".6rem", marginTop: "1.1rem" }}>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
          <Icon name="Check" size={16} /> {saving ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function AdminGuests() {
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
    <>
      {!creating && !editing && (
        <button className="adm-btn adm-btn-primary" style={{ marginBottom: "1.1rem" }} onClick={() => setCreating(true)}>
          <Icon name="Plus" size={16} /> Novo convidado
        </button>
      )}

      {creating && <GuestGroupForm onCancel={() => setCreating(false)} onSaved={handleSaved} />}

      {error && <p className="adm-error">{error}</p>}

      {groups === null && !error && <p className="adm-hint">Carregando...</p>}

      {groups && groups.length === 0 && <div className="adm-card adm-empty">Nenhum convidado cadastrado ainda.</div>}

      {groups && groups.length > 0 && (
        <div className="adm-card">
          <div className="adm-list">
            {groups.map((group, index) =>
              editing?.id === group.id ? (
                <div key={group.id} style={{ padding: "0 0.5rem" }}>
                  <GuestGroupForm initial={group} onCancel={() => setEditing(null)} onSaved={handleSaved} />
                </div>
              ) : (
                <div
                  key={group.id}
                  className="adm-row"
                  style={index > 0 ? { borderTop: "1px solid var(--adm-border)" } : undefined}
                >
                  <div className="adm-row-main">
                    <span className="adm-avatar">{initials(group.displayName)}</span>
                    <div>
                      <div className="adm-row-title">{group.displayName}</div>
                      <p className="adm-row-meta">{group.searchNames.join(", ")}</p>
                      {group.phone && <p className="adm-row-meta">{group.phone}</p>}
                      <p className="adm-row-meta">
                        {group.invitedToParty ? "Inclui convite para a festa" : "Somente cerimônia"}
                      </p>
                    </div>
                  </div>
                  <div className="adm-row-side">
                    <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <RsvpBadge
                        label={
                          group.rsvpResponse
                            ? group.rsvpResponse.attending
                              ? "Cerimônia confirmada"
                              : "Cerimônia: não vai"
                            : "Cerimônia: sem resposta"
                        }
                        state={group.rsvpResponse ? group.rsvpResponse.attending : null}
                      />
                      {group.invitedToParty && (
                        <RsvpBadge
                          label={
                            group.rsvpResponse?.partyAttending === true
                              ? "Festa confirmada"
                              : group.rsvpResponse?.partyAttending === false
                                ? "Festa: não vai"
                                : "Festa: sem resposta"
                          }
                          state={group.rsvpResponse?.partyAttending ?? null}
                        />
                      )}
                    </div>
                    <div className="adm-row-actions">
                      <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setEditing(group)}>
                        <Icon name="Pencil" size={13} /> Editar
                      </button>
                      <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(group)}>
                        <Icon name="Trash2" size={13} /> Remover
                      </button>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </>
  );
}
