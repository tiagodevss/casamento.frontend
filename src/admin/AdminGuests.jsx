import { useEffect, useMemo, useState } from "react";

import { Icon } from "../effects";
import { api } from "../api";
import { GuestRsvpEditor } from "./GuestRsvpEditor";
import {
  DEFAULT_INVITE_MESSAGE_TEMPLATE,
  fillInviteMessage,
  giftListLink,
  inviteConfirmLink,
} from "./inviteMessage";

export const GUEST_SIDES = [
  { value: "GROOM", label: "Noivo" },
  { value: "BRIDE", label: "Noiva" },
  { value: "BOTH", label: "Ambos" },
];

const PAGE_SIZE = 20;

const emptyMember = () => ({ id: undefined, name: "", isChild: false });

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
        ? group.members.map((member) => ({
            id: member.id,
            name: member.name,
            isChild: Boolean(member.isChild),
          }))
        : [],
  };
}

function toPayload(form) {
  const displayName = form.displayName.trim();
  let members = form.members
    .map((member) => ({
      ...(member.id ? { id: member.id } : {}),
      name: member.name.trim(),
      isChild: Boolean(member.isChild),
    }))
    .filter((member) => member.name);

  if (members.length === 0 && displayName) {
    members = [{ name: displayName, isChild: false }];
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

function phoneDigits(phone) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return digits;
}

function memberRsvpSummary(members) {
  const list = members ?? [];
  if (list.length === 0) return { label: "—", state: "neutral" };

  let attending = 0;
  let declining = 0;
  let pending = 0;
  for (const member of list) {
    if (member.attending === true) attending += 1;
    else if (member.attending === false) declining += 1;
    else pending += 1;
  }

  if (pending === list.length) return { label: "Pendente", state: "neutral" };
  if (attending === list.length) return { label: "Vão", state: "success" };
  if (declining === list.length) return { label: "Não vão", state: "danger" };
  if (pending === 0) return { label: `${attending} vão · ${declining} não`, state: "mixed" };
  return {
    label: `${attending} vão · ${pending} pend.`,
    state: attending > 0 ? "mixed" : "neutral",
  };
}

function partyRsvpLabel(group) {
  if (!group.invitedToParty) return null;
  const value = group.rsvpResponse?.partyAttending;
  if (value === true) return { label: "Festa ok", state: "success" };
  if (value === false) return { label: "Festa não", state: "danger" };
  return { label: "Festa pend.", state: "neutral" };
}

function RsvpBadge({ label, state }) {
  const variant =
    state === "success" || state === true
      ? "adm-badge-success"
      : state === "danger" || state === false
        ? "adm-badge-danger"
        : state === "mixed"
          ? "adm-badge-info"
          : "adm-badge-neutral";
  return <span className={`adm-badge ${variant}`}>{label}</span>;
}

function buildInviteMessage(group, messageTemplate) {
  const link = inviteConfirmLink(group.id);
  return fillInviteMessage(messageTemplate, {
    displayName: group.displayName,
    members: group.members ?? [],
    link,
    giftLink: giftListLink(group.id),
  });
}

function GuestGroupForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ? toForm(initial) : emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const formId = initial?.id ?? "new";

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const updateMemberName = (index, name) => {
    setForm((current) => ({
      ...current,
      members: current.members.map((member, i) => (i === index ? { ...member, name } : member)),
    }));
  };

  const updateMemberIsChild = (index, isChild) => {
    setForm((current) => ({
      ...current,
      members: current.members.map((member, i) => (i === index ? { ...member, isChild } : member)),
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
    <form className="adm-card adm-card-pad adm-guest-form" onSubmit={submit} noValidate>
      <div className="adm-guest-form-header">
        <h2 className="adm-guest-form-title">{initial ? "Editar convite" : "Novo convite"}</h2>
        <p className="adm-hint">Nome de exibição, pessoas do grupo e dados para envio.</p>
      </div>

      <div className="adm-form-grid">
        <div className="adm-field adm-field-full">
          <label htmlFor={`guest-display-name-${formId}`}>Nome de exibição</label>
          <input
            id={`guest-display-name-${formId}`}
            className="adm-input"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            placeholder="Maria Silva"
            autoFocus
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
                <label className="adm-field-checkbox adm-member-child-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(member.isChild)}
                    onChange={(event) => updateMemberIsChild(index, event.target.checked)}
                  />
                  Criança
                </label>
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
          <label htmlFor={`guest-aliases-${formId}`}>Apelidos / grafias alternativas (opcional)</label>
          <input
            id={`guest-aliases-${formId}`}
            className="adm-input"
            value={form.searchNames}
            onChange={(event) => updateField("searchNames", event.target.value)}
            placeholder="Mariazinha, Joãozinho"
          />
          <span className="adm-hint">Os nomes das pessoas já entram na busca automaticamente.</span>
        </div>

        <div className="adm-field">
          <label htmlFor={`guest-side-${formId}`}>Lado</label>
          <select
            id={`guest-side-${formId}`}
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
          <label htmlFor={`guest-phone-${formId}`}>Telefone</label>
          <input
            id={`guest-phone-${formId}`}
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
          <label htmlFor={`guest-notes-${formId}`}>Notas</label>
          <input
            id={`guest-notes-${formId}`}
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

      <div className="adm-guest-form-actions">
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

function SummaryChip({ active, count, label, onClick, tone = "default" }) {
  return (
    <button
      type="button"
      className={`adm-summary-chip ${active ? "is-active" : ""} adm-summary-chip-${tone}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <strong>{count}</strong>
      <span>{label}</span>
    </button>
  );
}

function QuickAction({ label, icon, onClick, disabled, tone = "ghost", showLabel = false, labelText }) {
  return (
    <button
      type="button"
      className={`adm-btn adm-btn-${tone} adm-btn-sm adm-quick-action ${showLabel ? "has-label" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <Icon name={icon} size={14} />
      {showLabel ? <span className="adm-quick-action-label">{labelText ?? label}</span> : null}
    </button>
  );
}

export function AdminGuests({ initialFilter = null, onFilterConsumed }) {
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_INVITE_MESSAGE_TEMPLATE);
  const [query, setQuery] = useState("");
  const [sideFilter, setSideFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [togglingSent, setTogglingSent] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

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
    if (!initialFilter) return;
    if (initialFilter.statusFilter) setStatusFilter(initialFilter.statusFilter);
    if (initialFilter.sideFilter) setSideFilter(initialFilter.sideFilter);
    if (typeof initialFilter.query === "string") setQuery(initialFilter.query);
    setPage(1);
    onFilterConsumed?.();
  }, [initialFilter, onFilterConsumed]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    setPage(1);
  }, [query, sideFilter, statusFilter]);

  const summary = useMemo(() => {
    if (!groups) return null;
    let total = 0;
    let notSent = 0;
    let sent = 0;
    let pending = 0;
    let responded = 0;
    let ceremonyOnly = 0;
    let ceremonyAndParty = 0;

    for (const group of groups) {
      const memberCount = group.members?.length ?? 0;
      total += memberCount;

      if (group.inviteSent) sent += memberCount;
      else notSent += memberCount;

      if (group.rsvpResponse) responded += memberCount;
      else pending += memberCount;

      if (group.invitedToParty) ceremonyAndParty += memberCount;
      else ceremonyOnly += memberCount;
    }

    return { total, notSent, sent, pending, responded, ceremonyOnly, ceremonyAndParty };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (!groups) return null;
    const needle = normalizeForCompare(query);

    return groups.filter((group) => {
      if (sideFilter !== "all" && group.side !== sideFilter) return false;

      if (statusFilter === "not_sent" && group.inviteSent) return false;
      if (statusFilter === "sent" && !group.inviteSent) return false;
      if (statusFilter === "pending" && group.rsvpResponse) return false;
      if (statusFilter === "responded" && !group.rsvpResponse) return false;
      if (statusFilter === "ceremony_only" && group.invitedToParty) return false;
      if (statusFilter === "party" && !group.invitedToParty) return false;

      if (!needle) return true;

      const haystack = [
        group.displayName,
        group.phone,
        group.notes,
        ...(group.members ?? []).map((member) => member.name),
        ...(group.searchNames ?? []),
      ]
        .filter(Boolean)
        .map(normalizeForCompare)
        .join(" ");

      return haystack.includes(needle);
    });
  }, [groups, query, sideFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil((filteredGroups?.length ?? 0) / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageGroups = useMemo(() => {
    if (!filteredGroups) return null;
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredGroups.slice(start, start + PAGE_SIZE);
  }, [filteredGroups, safePage]);

  const rangeLabel = useMemo(() => {
    if (!filteredGroups || filteredGroups.length === 0) return "0 convites";
    const start = (safePage - 1) * PAGE_SIZE + 1;
    const end = Math.min(safePage * PAGE_SIZE, filteredGroups.length);
    return `${start}–${end} de ${filteredGroups.length}`;
  }, [filteredGroups, safePage]);

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
    copyText(buildInviteMessage(group, messageTemplate), { id: group.id, kind: "message" });
  };

  const openWhatsApp = (group) => {
    const digits = phoneDigits(group.phone);
    if (!digits) {
      setError("Este convite não tem telefone cadastrado.");
      return;
    }
    const message = buildInviteMessage(group, messageTemplate);
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
      if (expandedId === group.id) setExpandedId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaved = (saved) => {
    setGroups((current) => {
      if (!current) return [saved];
      const exists = current.some((item) => item.id === saved.id);
      return exists
        ? current.map((item) => (item.id === saved.id ? { ...item, ...saved } : item))
        : [...current, saved].sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));
    });
    setEditing(null);
    setCreating(false);
  };

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
  };

  const startEdit = (group) => {
    setCreating(false);
    setEditing(group);
  };

  if (creating) {
    return <GuestGroupForm onCancel={() => setCreating(false)} onSaved={handleSaved} />;
  }

  if (editing) {
    return (
      <GuestGroupForm initial={editing} onCancel={() => setEditing(null)} onSaved={handleSaved} />
    );
  }

  return (
    <div className="adm-guests">
      <div className="adm-guests-toolbar">
        <div className="adm-guests-toolbar-copy">
          <p className="adm-guests-lead">
            Busque, filtre e envie convites. Os indicadores abaixo representam pessoas, não grupos.
          </p>
        </div>
        <button type="button" className="adm-btn adm-btn-primary" onClick={startCreate}>
          <Icon name="Plus" size={16} /> Novo convite
        </button>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {groups === null && !error && (
        <div className="adm-card adm-empty">
          <p className="adm-hint" style={{ margin: 0 }}>
            Carregando convites…
          </p>
        </div>
      )}

      {groups && groups.length === 0 && (
        <div className="adm-card adm-empty adm-empty-rich">
          <div className="adm-empty-icon" aria-hidden="true">
            <Icon name="Users" size={22} />
          </div>
          <h2>Nenhum convite ainda</h2>
          <p>Cadastre o primeiro grupo para gerar o link de confirmação e a mensagem de WhatsApp.</p>
          <button type="button" className="adm-btn adm-btn-primary" onClick={startCreate}>
            <Icon name="Plus" size={16} /> Criar primeiro convite
          </button>
        </div>
      )}

      {groups && groups.length > 0 && summary && (
        <>
          <div className="adm-summary-row" role="group" aria-label="Resumo de pessoas e filtros rápidos">
            <SummaryChip
              count={summary.total}
              label="Convidados"
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            />
            <SummaryChip
              count={summary.notSent}
              label="Com convite não enviado"
              tone="warn"
              active={statusFilter === "not_sent"}
              onClick={() => setStatusFilter("not_sent")}
            />
            <SummaryChip
              count={summary.sent}
              label="Com convite enviado"
              tone="success"
              active={statusFilter === "sent"}
              onClick={() => setStatusFilter("sent")}
            />
            <SummaryChip
              count={summary.pending}
              label="Aguardando resposta"
              tone="neutral"
              active={statusFilter === "pending"}
              onClick={() => setStatusFilter("pending")}
            />
            <SummaryChip
              count={summary.responded}
              label="Responderam"
              tone="info"
              active={statusFilter === "responded"}
              onClick={() => setStatusFilter("responded")}
            />
            <SummaryChip
              count={summary.ceremonyOnly}
              label="Somente cerimônia"
              active={statusFilter === "ceremony_only"}
              onClick={() => setStatusFilter("ceremony_only")}
            />
            <SummaryChip
              count={summary.ceremonyAndParty}
              label="Cerimônia + festa"
              active={statusFilter === "party"}
              onClick={() => setStatusFilter("party")}
            />
          </div>

          <div className="adm-guests-controls">
            <label className="adm-search-field">
              <Icon name="Search" size={15} />
              <input
                className="adm-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome, telefone ou nota…"
                aria-label="Buscar convites"
              />
            </label>

            <label className="adm-filter">
              <span>Lado</span>
              <select
                className="adm-select"
                value={sideFilter}
                onChange={(event) => setSideFilter(event.target.value)}
              >
                <option value="all">Todos</option>
                {GUEST_SIDES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="adm-card adm-empty">
              Nenhum convite corresponde aos filtros.
              <div style={{ marginTop: "0.75rem" }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-secondary adm-btn-sm"
                  onClick={() => {
                    setQuery("");
                    setSideFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="adm-table-meta">
                <span>{rangeLabel}</span>
                <span className="adm-hint">Clique na linha para ver detalhes e o link</span>
              </div>

              <div className="adm-card adm-table-card">
                <div className="adm-table-wrap">
                  <table className="adm-data-table">
                    <thead>
                      <tr>
                        <th scope="col">Convite</th>
                        <th scope="col">Lado</th>
                        <th scope="col">Presença</th>
                        <th scope="col">Enviado</th>
                        <th scope="col" className="adm-col-actions">
                          Ações rápidas
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageGroups.map((group) => {
                        const rsvp = memberRsvpSummary(group.members);
                        const party = partyRsvpLabel(group);
                        const memberCount = group.members?.length ?? 0;
                        const isExpanded = expandedId === group.id;
                        const copiedMessage =
                          copied?.id === group.id && copied?.kind === "message";
                        const copiedLink = copied?.id === group.id && copied?.kind === "link";

                        return (
                          <tr key={group.id} className={isExpanded ? "is-expanded" : undefined}>
                            <td>
                              <button
                                type="button"
                                className="adm-guest-cell"
                                onClick={() => setExpandedId(isExpanded ? null : group.id)}
                                aria-expanded={isExpanded}
                              >
                                <span className="adm-avatar">{initials(group.displayName)}</span>
                                <span className="adm-guest-cell-text">
                                  <span className="adm-row-title">{group.displayName}</span>
                                  <span className="adm-row-meta">
                                    {memberCount} {memberCount === 1 ? "pessoa" : "pessoas"}
                                    {group.invitedToParty ? " · festa" : ""}
                                    {group.phone ? ` · ${group.phone}` : ""}
                                  </span>
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="adm-guest-details">
                                  {(group.members ?? []).length === 0 ? (
                                    <p className="adm-row-meta">Sem pessoas listadas</p>
                                  ) : (
                                    <ul className="adm-member-rsvp-list">
                                      {(group.members ?? []).map((member) => {
                                        const status =
                                          member.attending === true
                                            ? { label: "Vai", state: "success" }
                                            : member.attending === false
                                              ? { label: "Não vai", state: "danger" }
                                              : { label: "Pendente", state: "neutral" };
                                        return (
                                          <li key={member.id} className="adm-member-rsvp-item">
                                            <span>
                                              {member.name}
                                              {member.isChild ? (
                                                <span className="adm-row-meta"> (criança)</span>
                                              ) : null}
                                            </span>
                                            <RsvpBadge label={status.label} state={status.state} />
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                  {group.notes && <p className="adm-row-meta">Nota: {group.notes}</p>}
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
                                      <Icon name={copiedLink ? "Check" : "Copy"} size={13} />
                                      {copiedLink ? "Copiado" : "Copiar link"}
                                    </button>
                                  </div>
                                  <div className="adm-guest-details-actions">
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn-ghost adm-btn-sm"
                                      onClick={() => startEdit(group)}
                                    >
                                      <Icon name="Pencil" size={13} /> Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="adm-btn adm-btn-danger adm-btn-sm"
                                      onClick={() => remove(group)}
                                    >
                                      <Icon name="Trash2" size={13} /> Remover
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>

                            <td>
                              <span className="adm-badge adm-badge-info">{sideLabel(group.side)}</span>
                            </td>

                            <td>
                              <div className="adm-rsvp-cell">
                                <RsvpBadge label={rsvp.label} state={rsvp.state} />
                                {party && <RsvpBadge label={party.label} state={party.state} />}
                                <GuestRsvpEditor group={group} onSaved={handleSaved} />
                              </div>
                            </td>

                            <td>
                              <label className="adm-sent-switch">
                                <input
                                  type="checkbox"
                                  checked={Boolean(group.inviteSent)}
                                  disabled={togglingSent === group.id}
                                  onChange={() => toggleInviteSent(group)}
                                  aria-label={
                                    group.inviteSent
                                      ? `Convite de ${group.displayName} marcado como enviado`
                                      : `Marcar convite de ${group.displayName} como enviado`
                                  }
                                />
                                <span className={group.inviteSent ? "is-sent" : ""}>
                                  {group.inviteSent ? "Enviado" : "Não enviado"}
                                </span>
                              </label>
                            </td>

                            <td className="adm-col-actions">
                              <div className="adm-quick-actions" role="group" aria-label={`Ações de ${group.displayName}`}>
                                <QuickAction
                                  label={copiedMessage ? "Mensagem copiada" : "Copiar mensagem"}
                                  labelText={copiedMessage ? "Copiada" : "Mensagem"}
                                  icon={copiedMessage ? "Check" : "MessageCircleHeart"}
                                  tone="secondary"
                                  showLabel
                                  onClick={() => copyMessage(group)}
                                />
                                <QuickAction
                                  label="Abrir no WhatsApp"
                                  icon="Phone"
                                  tone="secondary"
                                  disabled={!group.phone}
                                  onClick={() => openWhatsApp(group)}
                                />
                                <QuickAction
                                  label={copiedLink ? "Link copiado" : "Copiar link"}
                                  icon={copiedLink ? "Check" : "Copy"}
                                  onClick={() => copyLink(group)}
                                />
                                <QuickAction
                                  label={group.inviteSent ? "Marcar como não enviado" : "Marcar como enviado"}
                                  icon="Send"
                                  onClick={() => toggleInviteSent(group)}
                                  disabled={togglingSent === group.id}
                                />
                                <QuickAction
                                  label="Editar"
                                  icon="Pencil"
                                  onClick={() => startEdit(group)}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="adm-pagination">
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <Icon name="ChevronLeft" size={14} /> Anterior
                </button>
                <span className="adm-pagination-status">
                  Página {safePage} de {totalPages}
                </span>
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Próxima <Icon name="ChevronRight" size={14} />
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
