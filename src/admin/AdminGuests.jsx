import { useEffect, useMemo, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";
import {
  DEFAULT_INVITE_MESSAGE_TEMPLATE,
  fillInviteMessage,
  inviteConfirmLink,
} from "./inviteMessage";

export const GUEST_SIDES = [
  { value: "GROOM", label: "Noivo" },
  { value: "BRIDE", label: "Noiva" },
  { value: "BOTH", label: "Ambos" },
];

const emptyMember = () => ({ id: undefined, name: "" });

const emptyForm = {
  displayName: "",
  searchNames: "",
  side: "",
  invitedToParty: false,
  phone: "",
  notes: "",
  members: [],
};

function normalizeForCompare(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function sideLabel(side) {
  return GUEST_SIDES.find((item) => item.value === side)?.label ?? side;
}

function toForm(group) {
  const derived = new Set([
    normalizeForCompare(group.displayName),
    ...(group.members ?? []).map((member) => normalizeForCompare(member.name)),
  ]);
  const aliases = (group.searchNames ?? []).filter((name) => !derived.has(name));

  return {
    displayName: group.displayName,
    searchNames: aliases.join(", "),
    side: group.side ?? "",
    invitedToParty: Boolean(group.invitedToParty),
    phone: group.phone ?? "",
    notes: group.notes ?? "",
    members:
      group.members?.length > 0
        ? group.members.map((member) => ({ id: member.id, name: member.name }))
        : [],
  };
}

function toPayload(form) {
  const displayName = form.displayName.trim();
  let members = form.members
    .map((member) => ({
      ...(member.id ? { id: member.id } : {}),
      name: member.name.trim(),
    }))
    .filter((member) => member.name);

  // Só nome de exibição → convite de uma pessoa
  if (members.length === 0 && displayName) {
    members = [{ name: displayName }];
  }

  return {
    displayName,
    searchNames: form.searchNames
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
    side: form.side,
    invitedToParty: Boolean(form.invitedToParty),
    phone: form.phone.trim() || undefined,
    notes: form.notes.trim() || undefined,
    members,
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

function memberBadgeState(attending) {
  if (attending === true) return { label: "Vai", state: true };
  if (attending === false) return { label: "Não vai", state: false };
  return { label: "Pendente", state: null };
}

function GuestGroupForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ? toForm(initial) : emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const updateMemberName = (index, name) => {
    setForm((current) => ({
      ...current,
      members: current.members.map((member, i) => (i === index ? { ...member, name } : member)),
    }));
  };

  const addMember = () => {
    setForm((current) => ({ ...current, members: [...current.members, emptyMember()] }));
  };

  const removeMember = (index) => {
    setForm((current) => ({
      ...current,
      members: current.members.filter((_, i) => i !== index),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const payload = toPayload(form);
    if (!payload.displayName) {
      setError("Preencha o nome de exibição do convite");
      return;
    }
    if (!payload.side) {
      setError("Selecione o lado do convite (noivo, noiva ou ambos)");
      return;
    }
    setSaving(true);
    try {
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
          <label htmlFor="guest-display-name">Nome de exibição</label>
          <input
            id="guest-display-name"
            className="adm-input"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            placeholder="Maria Silva"
          />
        </div>

        <div className="adm-field adm-field-full">
          <label>Pessoas do convite</label>
          <div className="adm-members-list">
            {form.members.map((member, index) => (
              <div className="adm-member-row" key={member.id ?? `new-${index}`}>
                <input
                  className="adm-input"
                  value={member.name}
                  onChange={(event) => updateMemberName(index, event.target.value)}
                  placeholder={index === 0 ? "Maria Silva" : "João Silva"}
                  aria-label={`Nome da pessoa ${index + 1}`}
                />
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => removeMember(index)}
                  aria-label={`Remover pessoa ${index + 1}`}
                >
                  <Icon name="Trash2" size={13} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="adm-btn adm-btn-secondary adm-btn-sm" onClick={addMember}>
            <Icon name="Plus" size={13} /> Adicionar pessoa
          </button>
          <span className="adm-hint">
            Opcional. Se não adicionar ninguém, o convite será de uma pessoa com o nome de exibição.
          </span>
        </div>

        <div className="adm-field adm-field-full">
          <label htmlFor="guest-aliases">Apelidos / grafias alternativas (opcional)</label>
          <input
            id="guest-aliases"
            className="adm-input"
            value={form.searchNames}
            onChange={(event) => updateField("searchNames", event.target.value)}
            placeholder="Mariazinha, Joãozinho"
          />
          <span className="adm-hint">Os nomes das pessoas já entram na busca automaticamente.</span>
        </div>

        <div className="adm-field">
          <label htmlFor="guest-side">Lado</label>
          <select
            id="guest-side"
            className="adm-select"
            value={form.side}
            onChange={(event) => updateField("side", event.target.value)}
            required
          >
            <option value="" disabled>
              Selecione…
            </option>
            {GUEST_SIDES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="adm-field">
          <label htmlFor="guest-phone">Telefone</label>
          <input
            id="guest-phone"
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
          <label htmlFor="guest-notes">Notas</label>
          <input
            id="guest-notes"
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
  const [copied, setCopied] = useState(null);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_INVITE_MESSAGE_TEMPLATE);
  const [sideFilter, setSideFilter] = useState("all");
  const [sentFilter, setSentFilter] = useState("all");
  const [togglingSent, setTogglingSent] = useState(null);

  const load = async () => {
    try {
      const [guestData, settings] = await Promise.all([
        api.listGuestGroups(),
        api.getSettings().catch(() => null),
      ]);
      setGroups(guestData);
      if (settings?.inviteMessageTemplate) {
        setMessageTemplate(settings.inviteMessageTemplate);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const filteredGroups = useMemo(() => {
    if (!groups) return null;
    return groups.filter((group) => {
      if (sideFilter !== "all" && group.side !== sideFilter) return false;
      if (sentFilter === "sent" && !group.inviteSent) return false;
      if (sentFilter === "not_sent" && group.inviteSent) return false;
      return true;
    });
  }, [groups, sideFilter, sentFilter]);

  const inviteLink = (groupId) => inviteConfirmLink(groupId);

  const copyText = async (text, feedback) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(feedback);
    } catch {
      setError("Não foi possível copiar. Tente selecionar o texto manualmente.");
      window.prompt("Copie o texto:", text);
    }
  };

  const copyLink = (group) => {
    copyText(inviteLink(group.id), { id: group.id, kind: "link" });
  };

  const copyMessage = (group) => {
    const link = inviteLink(group.id);
    const message = fillInviteMessage(messageTemplate, {
      displayName: group.displayName,
      members: group.members ?? [],
      link,
    });
    copyText(message, { id: group.id, kind: "message" });
  };

  const toggleInviteSent = async (group) => {
    const next = !group.inviteSent;
    setTogglingSent(group.id);
    setError("");
    setGroups((current) =>
      current?.map((item) => (item.id === group.id ? { ...item, inviteSent: next } : item)),
    );
    try {
      const saved = await api.updateGuestGroup(group.id, { inviteSent: next });
      setGroups((current) =>
        current?.map((item) => (item.id === saved.id ? { ...item, ...saved } : item)),
      );
    } catch (err) {
      setGroups((current) =>
        current?.map((item) => (item.id === group.id ? { ...item, inviteSent: group.inviteSent } : item)),
      );
      setError(err.message);
    } finally {
      setTogglingSent(null);
    }
  };

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
          <Icon name="Plus" size={16} /> Novo convite
        </button>
      )}

      {creating && <GuestGroupForm onCancel={() => setCreating(false)} onSaved={handleSaved} />}

      {error && <p className="adm-error">{error}</p>}

      {groups === null && !error && <p className="adm-hint">Carregando...</p>}

      {groups && groups.length === 0 && <div className="adm-card adm-empty">Nenhum convite cadastrado ainda.</div>}

      {groups && groups.length > 0 && !creating && !editing && (
        <div className="adm-filters" style={{ marginBottom: "0.9rem" }}>
          <label className="adm-filter">
            <span>Lado</span>
            <select className="adm-select" value={sideFilter} onChange={(e) => setSideFilter(e.target.value)}>
              <option value="all">Todos</option>
              {GUEST_SIDES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-filter">
            <span>Envio</span>
            <select className="adm-select" value={sentFilter} onChange={(e) => setSentFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="sent">Enviados</option>
              <option value="not_sent">Não enviados</option>
            </select>
          </label>
        </div>
      )}

      {filteredGroups && filteredGroups.length === 0 && groups.length > 0 && (
        <div className="adm-card adm-empty">Nenhum convite corresponde aos filtros.</div>
      )}

      {filteredGroups && filteredGroups.length > 0 && (
        <div className="adm-card">
          <div className="adm-list">
            {filteredGroups.map((group, index) =>
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
                      <div className="adm-row-title">
                        {group.displayName}{" "}
                        <span className="adm-badge adm-badge-info">{sideLabel(group.side)}</span>
                      </div>
                      <p className="adm-row-meta">
                        {group.members?.length ?? 0}{" "}
                        {(group.members?.length ?? 0) === 1 ? "pessoa" : "pessoas"}
                        {group.members?.length
                          ? `: ${group.members.map((member) => member.name).join(", ")}`
                          : ""}
                      </p>
                      {group.phone && <p className="adm-row-meta">{group.phone}</p>}
                      <p className="adm-row-meta">
                        {group.invitedToParty ? "Inclui convite para a festa" : "Somente cerimônia"}
                      </p>
                      <label className="adm-field-checkbox adm-invite-sent-toggle">
                        <input
                          type="checkbox"
                          checked={Boolean(group.inviteSent)}
                          disabled={togglingSent === group.id}
                          onChange={() => toggleInviteSent(group)}
                        />
                        Convite enviado
                      </label>
                      <div className="adm-invite-link-row">
                        <input
                          className="adm-input"
                          readOnly
                          value={inviteLink(group.id)}
                          title={inviteLink(group.id)}
                          aria-label={`Link de confirmação de ${group.displayName}`}
                          onFocus={(event) => event.target.select()}
                        />
                        <button
                          type="button"
                          className="adm-btn adm-btn-ghost adm-btn-sm"
                          onClick={() => copyLink(group)}
                        >
                          <Icon
                            name={copied?.id === group.id && copied?.kind === "link" ? "Check" : "Copy"}
                            size={13}
                          />
                          {copied?.id === group.id && copied?.kind === "link" ? "Link copiado!" : "Copiar link"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="adm-row-side">
                    <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {(group.members ?? []).map((member) => {
                        const badge = memberBadgeState(member.attending);
                        return (
                          <RsvpBadge
                            key={member.id}
                            label={`${member.name}: ${badge.label}`}
                            state={badge.state}
                          />
                        );
                      })}
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
                      <button
                        type="button"
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        onClick={() => copyMessage(group)}
                      >
                        <Icon
                          name={
                            copied?.id === group.id && copied?.kind === "message" ? "Check" : "MessageCircleHeart"
                          }
                          size={13}
                        />
                        {copied?.id === group.id && copied?.kind === "message"
                          ? "Mensagem copiada!"
                          : "Copiar mensagem"}
                      </button>
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
